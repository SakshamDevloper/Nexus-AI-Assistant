import type { Config } from "@netlify/functions";
import admin from "firebase-admin";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { memories, users } from "../../db/schema.js";

const json = (body: unknown, init?: ResponseInit) => Response.json(body, init);

const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for real-time information.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          max_results: { type: "number", default: 5 },
          search_depth: { type: "string", enum: ["basic", "advanced"], default: "basic" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather or forecast for a location.",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string" },
          units: { type: "string", enum: ["metric", "imperial"], default: "metric" },
          forecast: { type: "boolean", default: false },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "wikipedia_lookup",
      description: "Look up factual information on Wikipedia.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          sentences: { type: "number", default: 5 },
        },
        required: ["query"],
      },
    },
  },
];

let firebaseReady = false;

function initFirebase() {
  if (firebaseReady || admin.apps.length > 0) {
    firebaseReady = true;
    return true;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return false;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
  firebaseReady = true;
  return true;
}

function getProvider(modelId = "gpt-4o-mini") {
  const providers = {
    "gpt-4o": process.env.OPENAI_API_KEY
      ? { client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), model: "gpt-4o", supportsTools: true }
      : null,
    "gpt-4o-mini": process.env.OPENAI_API_KEY
      ? { client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }), model: "gpt-4o-mini", supportsTools: true }
      : null,
    deepseek: process.env.DEEPSEEK_API_KEY
      ? {
          client: new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" }),
          model: "deepseek-chat",
          supportsTools: true,
        }
      : null,
    "llama-3.3": process.env.GROQ_API_KEY
      ? { client: new Groq({ apiKey: process.env.GROQ_API_KEY }), model: "llama-3.3-70b-versatile", supportsTools: true }
      : null,
    "gemini-flash": process.env.GEMINI_API_KEY
      ? {
          client: new OpenAI({
            apiKey: process.env.GEMINI_API_KEY,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
          }),
          model: "gemini-1.5-flash",
          supportsTools: false,
        }
      : null,
  };

  return providers[modelId as keyof typeof providers] || Object.values(providers).find(Boolean) || null;
}

async function executeTool(name: string, args: Record<string, any>) {
  if (name === "wikipedia_lookup") {
    const summary = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(args.query)}`);
    if (summary.ok) {
      const data = await summary.json();
      return {
        title: data.title,
        extract: data.extract,
        url: data.content_urls?.desktop?.page,
        thumbnail: data.thumbnail?.source,
      };
    }
    return { error: "Page not found" };
  }

  if (name === "get_weather") {
    if (!process.env.OPENWEATHER_API_KEY) return { error: "OpenWeather API key not configured" };
    const endpoint = args.forecast ? "forecast" : "weather";
    const url = new URL(`https://api.openweathermap.org/data/2.5/${endpoint}`);
    url.searchParams.set("q", args.location);
    url.searchParams.set("units", args.units || "metric");
    url.searchParams.set("appid", process.env.OPENWEATHER_API_KEY);
    const response = await fetch(url);
    if (!response.ok) return { error: "Weather lookup failed" };
    const data = await response.json();
    if (args.forecast) {
      return {
        location: data.city.name,
        country: data.city.country,
        forecast: data.list.slice(0, 8).map((item: any) => ({
          datetime: item.dt_txt,
          temp: item.main.temp,
          condition: item.weather?.[0]?.description,
        })),
      };
    }
    return {
      location: data.name,
      country: data.sys?.country,
      temperature: data.main?.temp,
      condition: data.weather?.[0]?.description,
      humidity: data.main?.humidity,
      wind_speed: data.wind?.speed,
    };
  }

  if (name === "web_search") {
    if (!process.env.TAVILY_API_KEY) return { error: "Tavily API key not configured" };
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: args.query,
        max_results: args.max_results || 5,
        search_depth: args.search_depth || "basic",
        include_answer: true,
        include_raw_content: false,
      }),
    });
    if (!response.ok) return { error: "Search failed" };
    const data = await response.json();
    return {
      answer: data.answer,
      results: data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
      })) || [],
    };
  }

  return { error: `Unknown tool: ${name}` };
}

async function handleMemory(req: Request, key?: string) {
  if (req.method === "GET") {
    const items = await db.select().from(memories).orderBy(desc(memories.updatedAt)).limit(50);
    return json({ memories: items });
  }

  if (req.method === "POST") {
    const body = await req.json();
    if (!body.key || !body.value) return json({ error: "key and value required" }, { status: 400 });
    await db
      .insert(memories)
      .values({ key: body.key, value: body.value, type: body.type || "preference", updatedAt: new Date() })
      .onConflictDoUpdate({
        target: memories.key,
        set: { value: body.value, type: body.type || "preference", updatedAt: new Date() },
      });
    return json({ success: true });
  }

  if (req.method === "DELETE" && key) {
    await db.delete(memories).where(eq(memories.key, decodeURIComponent(key)));
    return json({ success: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}

async function handleAuth(req: Request, tail: string[]) {
  if (!initFirebase()) return json({ error: "Firebase not configured" }, { status: 503 });

  if (req.method === "POST" && tail[0] === "verify") {
    const { idToken } = await req.json();
    if (!idToken) return json({ error: "No token provided" }, { status: 400 });
    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email?.split("@")[0] || "User",
      picture: decoded.picture,
    };

    await db
      .insert(users)
      .values({
        firebaseUid: user.uid,
        email: user.email,
        name: user.name,
        picture: user.picture,
        lastLogin: new Date(),
      })
      .onConflictDoUpdate({
        target: users.firebaseUid,
        set: { email: user.email, name: user.name, picture: user.picture, lastLogin: new Date() },
      });

    return json({ user });
  }

  if (req.method === "GET" && tail[0] === "me") {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ error: "No token" }, { status: 401 });
    const decoded = await admin.auth().verifyIdToken(authHeader.split(" ")[1]);
    return json({ user: { uid: decoded.uid, email: decoded.email, name: decoded.name || decoded.email } });
  }

  return json({ error: "Not found" }, { status: 404 });
}

async function handleChat(req: Request) {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });
  const body = await req.json();
  const provider = getProvider(body.model);
  if (!provider) return json({ error: "No AI provider is configured for this site." }, { status: 503 });

  let messages: any[] = [
    {
      role: "system",
      content: `You are NexusAI, a helpful AI assistant with access to tools.
Current date: ${new Date().toISOString().slice(0, 10)}.
Use tools when you need real-time information, weather, or factual lookups.
Be concise but thorough. Format code blocks with language tags.`,
    },
    ...(body.history || []).map((message: any) => ({ role: message.role, content: message.content })),
    { role: "user", content: body.content },
  ];

  let fullContent = "";
  const toolCalls = [];

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const response = await provider.client.chat.completions.create({
      model: provider.model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      tools: provider.supportsTools ? toolDefinitions : undefined,
      tool_choice: provider.supportsTools ? "auto" : undefined,
    });

    const message = response.choices[0]?.message;
    if (!message) break;
    if (message.content) fullContent += message.content;

    if (!message.tool_calls?.length) break;

    messages.push(message);
    for (const call of message.tool_calls) {
      const args = JSON.parse(call.function.arguments || "{}");
      const result = await executeTool(call.function.name, args);
      toolCalls.push({ id: call.id, name: call.function.name, arguments: args, result });
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
    }
  }

  return json({ content: fullContent, fullContent, toolCalls });
}

export default async (req: Request) => {
  try {
    const url = new URL(req.url);
    const tail = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);

    if (tail[0] === "health") return json({ status: "ok", timestamp: Date.now() });
    if (tail[0] === "tools") return json(toolDefinitions);
    if (tail[0] === "memory") return handleMemory(req, tail[1]);
    if (tail[0] === "auth") return handleAuth(req, tail.slice(1));
    if (tail[0] === "chat") return handleChat(req);

    return json({ name: "NexusAI Backend", version: "1.0.0", status: "running" });
  } catch (error: any) {
    return json({ error: error.message || "Server error" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/*",
};
