"""
ATHENA AI ASSISTANT — NEW UI
─────────────────────────────────────────────────────────────────────────────
Drop-in replacement UI for athena.py.

WHAT CHANGED vs old code:
  • Removed: GlobeCanvas (the old Siri-style animated globe)
  • Added: Full-height dark glass panel with:
      - Sidebar (logo + status + quick-actions)
      - Main area: scrollable chat bubbles
      - Bottom bar: text input + mic button + waveform
      - Animated particle/ring orb that pulses on each state
      - Smooth state transitions with color theming

INSTALL any extra deps:
  pip install Pillow

HOW TO INTEGRATE:
  1. Copy this entire file as a NEW file: athena_ui.py
  2. In your athena.py, at the bottom where AthenaApp is defined,
     replace the entire AthenaApp class with an import:
         from athena_ui import AthenaApp
  3. Run: python athena.py   (no changes needed to athena.py logic)

OR: you can paste the AthenaApp class from this file directly
    into your athena.py, replacing the old one.
─────────────────────────────────────────────────────────────────────────────
"""

import tkinter as tk
import math, time, threading, queue, random
from tkinter import font as tkfont

# ── Colour tokens ──────────────────────────────────────────────────────────
C = {
    # Base
    "bg":          "#08080f",   # deep navy-black
    "surface":     "#10111e",   # card / panel bg
    "elevated":    "#181928",   # hover / input bg
    "border":      "#1e2035",   # dividers
    "border2":     "#2a2d4a",   # stronger border

    # Text
    "text":        "#e8e8f5",   # primary
    "text2":       "#8888aa",   # secondary
    "text3":       "#44445a",   # muted / placeholder

    # Accent — Athena purple / violet
    "accent":      "#7c5af0",   # main CTA
    "accent2":     "#9f7cff",   # lighter highlight
    "accent_dim":  "#2a1f5a",   # dim bg glow

    # State colours
    "idle":        "#4040cc",   # cool blue-purple
    "listening":   "#00c896",   # teal-green
    "thinking":    "#c040ff",   # bright violet
    "speaking":    "#ff8c00",   # warm orange

    # Bubble colours
    "user_bubble": "#1a1b30",
    "ai_bubble":   "#0e0f1e",
    "user_border": "#2a2d4a",
    "ai_border":   "#7c5af033",

    # Misc
    "scrollbar":   "#1e2035",
    "input_bg":    "#14152a",
}

STATE_ACCENT = {
    "idle":      C["idle"],
    "listening": C["listening"],
    "thinking":  C["thinking"],
    "speaking":  C["speaking"],
}

# ── Utility: lerp ──────────────────────────────────────────────────────────
def lerp(a, b, t):
    return a + (b - a) * max(0.0, min(1.0, t))

def hex_lerp(h1, h2, t):
    r1, g1, b1 = int(h1[1:3],16), int(h1[3:5],16), int(h1[5:7],16)
    r2, g2, b2 = int(h2[1:3],16), int(h2[3:5],16), int(h2[5:7],16)
    return "#{:02x}{:02x}{:02x}".format(
        int(lerp(r1,r2,t)), int(lerp(g1,g2,t)), int(lerp(b1,b2,t))
    )

# ── Orb Canvas ─────────────────────────────────────────────────────────────
class OrbCanvas(tk.Canvas):
    """
    A self-animating orb that changes color/animation per state.
    No Pillow required — pure canvas drawing.
    States: idle | listening | thinking | speaking
    """
    SIZE = 200
    CX = CY = 100
    R_CORE = 36

    def __init__(self, parent, **kwargs):
        super().__init__(parent, width=self.SIZE, height=self.SIZE,
                         bg=C["surface"], highlightthickness=0, **kwargs)
        self.state = "idle"
        self._t = 0.0
        self._target_col = C["idle"]
        self._cur_col    = C["idle"]
        self._orb_id     = None
        self._label_id   = None
        self._tick       = 33   # ~30fps
        self._init_items()
        self._animate()

    def _init_items(self):
        cx, cy = self.CX, self.CY
        # Background rings (drawn once, recoloured per frame)
        self._ring_ids = []
        for i in range(4):
            r = self.R_CORE + 14 + i * 14
            tag = f"ring{i}"
            self.create_oval(cx-r, cy-r, cx+r, cy+r,
                             outline="", fill="", tags=tag, width=1)
            self._ring_ids.append(tag)

        # Core orb
        r = self.R_CORE
        self._orb_id = self.create_oval(cx-r, cy-r, cx+r, cy+r,
                                        fill=C["idle"], outline="")

        # Waveform bars (shown only in listening / speaking)
        bar_w = 3
        n_bars = 18
        total_w = n_bars * bar_w + (n_bars - 1) * 3
        x0 = cx - total_w // 2
        self._bar_ids = []
        for i in range(n_bars):
            x = x0 + i * (bar_w + 3)
            bid = self.create_rectangle(x, cy, x+bar_w, cy,
                                        fill=C["listening"], outline="")
            self.itemconfigure(bid, state="hidden")
            self._bar_ids.append(bid)

        # State label
        self._label_id = self.create_text(cx, cy + self.R_CORE + 26,
                                          text="STANDBY",
                                          fill=C["text3"],
                                          font=("Courier", 8, "bold"))

    def set_state(self, s):
        self.state = s
        self._target_col = STATE_ACCENT.get(s, C["accent"])
        labels = {
            "idle":      "STANDBY",
            "listening": "LISTENING",
            "thinking":  "THINKING",
            "speaking":  "SPEAKING",
        }
        col_map = {
            "idle":      C["text3"],
            "listening": C["listening"],
            "thinking":  C["thinking"],
            "speaking":  C["speaking"],
        }
        self.itemconfigure(self._label_id, text=labels.get(s, ""),
                           fill=col_map.get(s, C["text3"]))

    @staticmethod
    def _dim(hex_col, factor):
        r = int(hex_col[1:3], 16)
        g = int(hex_col[3:5], 16)
        b = int(hex_col[5:7], 16)
        return "#{:02x}{:02x}{:02x}".format(
            int(r*factor), int(g*factor), int(b*factor)
        )

    def _animate(self):
        self._t += 0.05

        # Lerp toward target colour
        self._cur_col = hex_lerp(self._cur_col, self._target_col, 0.06)
        col = self._cur_col

        # Pulse
        pulse = 0.5 + 0.5 * math.sin(self._t * (
            1.0 if self.state == "idle" else
            3.0 if self.state == "listening" else
            2.0 if self.state == "thinking" else 4.5
        ))

        # Update rings
        cx, cy = self.CX, self.CY
        for i, tag in enumerate(self._ring_ids):
            base_r   = self.R_CORE + 14 + i * 14
            ring_r   = base_r + int(pulse * (4 + i * 2))
            phase    = (self._t + i * 0.5) % (2 * math.pi)
            alpha    = max(0, 0.18 - i * 0.04) * (0.5 + 0.5 * math.sin(phase))
            dim_col  = self._dim(col, alpha)
            self.coords(tag,
                        cx - ring_r, cy - ring_r,
                        cx + ring_r, cy + ring_r)
            self.itemconfigure(tag, outline=col, fill=dim_col,
                               width=max(1, 2 - i))

        # Core orb size pulse
        r_c = self.R_CORE + int(pulse * 4)
        self.coords(self._orb_id,
                    cx - r_c, cy - r_c, cx + r_c, cy + r_c)
        orb_col = self._dim(col, 0.55)
        self.itemconfigure(self._orb_id, fill=orb_col)

        # Waveform bars
        show_bars = self.state in ("listening", "speaking")
        bar_col   = col
        n = len(self._bar_ids)
        total_w   = n * 3 + (n - 1) * 3
        x0 = cx - total_w // 2
        max_h = 28 if self.state == "speaking" else 18

        for i, bid in enumerate(self._bar_ids):
            if show_bars:
                self.itemconfigure(bid, state="normal", fill=bar_col)
                phase = self._t * (3 if self.state == "speaking" else 2) + i * 0.6
                h = int(4 + max_h * abs(math.sin(phase)) *
                        math.sin(i / n * math.pi) ** 0.5)
                x = x0 + i * 6
                self.coords(bid, x, cy - h // 2, x + 3, cy + h // 2)
            else:
                self.itemconfigure(bid, state="hidden")

        self.after(self._tick, self._animate)


# ── Chat Bubble ─────────────────────────────────────────────────────────────
class ChatBubble(tk.Frame):
    def __init__(self, parent, text, role="ai", **kwargs):
        super().__init__(parent, bg=C["surface"], **kwargs)
        is_user = role == "user"

        outer = tk.Frame(self, bg=C["surface"])
        outer.pack(fill="x", padx=12, pady=4,
                   anchor="e" if is_user else "w")

        bubble_bg  = C["user_bubble"] if is_user else C["ai_bubble"]
        bubble_bd  = C["user_border"] if is_user else C["ai_border"]
        text_col   = C["text"]

        # Role label
        label_text = "YOU" if is_user else "ATHENA"
        label_col  = C["accent2"] if not is_user else C["text3"]
        lbl = tk.Label(outer, text=label_text,
                       bg=C["surface"], fg=label_col,
                       font=("Courier", 7, "bold"))
        lbl.pack(anchor="e" if is_user else "w")

        # Bubble container
        bubble = tk.Frame(outer, bg=bubble_bg,
                          highlightbackground=bubble_bd,
                          highlightthickness=1)
        bubble.pack(anchor="e" if is_user else "w",
                    fill="none", expand=False)

        # Text
        msg = tk.Label(bubble, text=text, wraplength=380,
                       justify="left", bg=bubble_bg, fg=text_col,
                       font=("Segoe UI", 10),
                       padx=14, pady=10)
        msg.pack()


# ── Main App ────────────────────────────────────────────────────────────────
class AthenaApp:
    """
    Full redesigned Athena UI.
    Keeps 100% API compatibility with the old AthenaApp class —
    same __init__ signature, same _set_state(), _wake(), _turn() etc.
    """
    WIN_W = 860
    WIN_H = 620

    def __init__(self):
        # ── state copied from old app ─────────────────────────────────────
        self.state    = "idle"
        self.eq       = queue.Queue()
        self._is_small = False

        import os, json, threading
        from pathlib import Path
        from dotenv import load_dotenv
        load_dotenv()

        MEMORY_PATH = Path.home() / ".athena_memory.json"
        AUTH_PATH   = Path.home() / ".athena_auth.json"

        def load_json(p):
            try:
                return json.loads(p.read_text()) if p.exists() else {}
            except:
                return {}

        mem_raw = load_json(MEMORY_PATH)
        self.history   = mem_raw if isinstance(mem_raw, list) else []
        auth           = load_json(AUTH_PATH)
        self.user_name = auth.get("user", "Sir")

        # ── Window ────────────────────────────────────────────────────────
        self.root = tk.Tk()
        self.root.title("Athena")
        self.root.configure(bg=C["bg"])
        self.root.resizable(True, True)

        sw = self.root.winfo_screenwidth()
        sh = self.root.winfo_screenheight()
        x  = (sw - self.WIN_W) // 2
        y  = (sh - self.WIN_H) // 2
        self.root.geometry(f"{self.WIN_W}x{self.WIN_H}+{x}+{y}")

        self.root.bind("<space>",  lambda e: self._wake())
        self.root.bind("<Escape>", lambda e: self._quit())
        self.root.bind("<Return>", lambda e: self._send_text())
        self.root.bind("<s>",      lambda e: self._stop())

        self._build_ui()

        threading.Thread(target=self._wake_thread, daemon=True).start()
        threading.Thread(target=self._eq_loop_thread, daemon=True).start()

        self.root.mainloop()

    def _build_ui(self):
        root = self.root

        # Top bar
        topbar = tk.Frame(root, bg=C["surface"],
                          highlightbackground=C["border"],
                          highlightthickness=1, height=52)
        topbar.pack(fill="x", side="top")
        topbar.pack_propagate(False)

        topbar.bind("<ButtonPress-1>",   self._drag_start)
        topbar.bind("<B1-Motion>",       self._drag_move)

        logo = tk.Label(topbar, text="⬡  ATHENA",
                        bg=C["surface"], fg=C["accent2"],
                        font=("Courier", 13, "bold"), padx=20)
        logo.pack(side="left", pady=12)

        self._state_pill = tk.Label(topbar, text="● STANDBY",
                                    bg=C["surface"], fg=C["text3"],
                                    font=("Courier", 9))
        self._state_pill.pack(side="left", padx=8)

        close_btn = tk.Label(topbar, text="✕", bg=C["surface"],
                             fg=C["text2"], font=("Arial", 11),
                             cursor="hand2", padx=16)
        close_btn.pack(side="right", pady=12)
        close_btn.bind("<Button-1>", lambda e: self._quit())

        min_btn = tk.Label(topbar, text="—", bg=C["surface"],
                           fg=C["text2"], font=("Arial", 11),
                           cursor="hand2", padx=8)
        min_btn.pack(side="right", pady=12)
        min_btn.bind("<Button-1>", lambda e: root.iconify())

        # Body
        body = tk.Frame(root, bg=C["bg"])
        body.pack(fill="both", expand=True)

        # Sidebar
        sidebar = tk.Frame(body, bg=C["surface"], width=180,
                           highlightbackground=C["border"],
                           highlightthickness=1)
        sidebar.pack(fill="y", side="left")
        sidebar.pack_propagate(False)

        # Orb
        self.orb = OrbCanvas(sidebar)
        self.orb.pack(pady=(24, 8))

        # Shortcut hints
        hints = [
            ("Space",  "Wake"),
            ("S",      "Stop"),
            ("Esc",    "Quit"),
        ]
        for key, desc in hints:
            row = tk.Frame(sidebar, bg=C["surface"])
            row.pack(anchor="w", padx=16, pady=2)
            tk.Label(row, text=key,
                     bg=C["accent_dim"], fg=C["accent2"],
                     font=("Courier", 8, "bold"),
                     padx=6, pady=1).pack(side="left")
            tk.Label(row, text=f"  {desc}",
                     bg=C["surface"], fg=C["text2"],
                     font=("Segoe UI", 9)).pack(side="left")

        # Mic button
        self._mic_btn = tk.Label(sidebar,
                                 text="🎙  HOLD TO TALK",
                                 bg=C["accent_dim"], fg=C["accent2"],
                                 font=("Courier", 8, "bold"),
                                 cursor="hand2", padx=0, pady=8)
        self._mic_btn.pack(fill="x", padx=16, pady=(20, 0))
        self._mic_btn.bind("<Button-1>",        lambda e: self._wake())
        self._mic_btn.bind("<Enter>",
                           lambda e: self._mic_btn.configure(bg=C["accent"]))
        self._mic_btn.bind("<Leave>",
                           lambda e: self._mic_btn.configure(bg=C["accent_dim"]))

        tk.Label(sidebar, text=f"Hi, {self.user_name}",
                 bg=C["surface"], fg=C["text2"],
                 font=("Segoe UI", 9)).pack(side="bottom", pady=12)

        # Main chat area
        main = tk.Frame(body, bg=C["surface"])
        main.pack(fill="both", expand=True)

        chat_header = tk.Frame(main, bg=C["elevated"],
                               highlightbackground=C["border"],
                               highlightthickness=1, height=38)
        chat_header.pack(fill="x")
        chat_header.pack_propagate(False)
        tk.Label(chat_header, text="Conversation",
                 bg=C["elevated"], fg=C["text2"],
                 font=("Segoe UI", 9), padx=16).pack(side="left", pady=8)
        self._clear_btn = tk.Label(chat_header, text="Clear",
                                   bg=C["elevated"], fg=C["text3"],
                                   font=("Segoe UI", 9),
                                   cursor="hand2", padx=16)
        self._clear_btn.pack(side="right", pady=8)
        self._clear_btn.bind("<Button-1>", lambda e: self._clear_chat())

        # Scrollable chat
        chat_frame = tk.Frame(main, bg=C["surface"])
        chat_frame.pack(fill="both", expand=True)

        self._canvas = tk.Canvas(chat_frame, bg=C["surface"],
                                 highlightthickness=0)
        self._canvas.pack(side="left", fill="both", expand=True)

        scrollbar = tk.Scrollbar(chat_frame, orient="vertical",
                                 command=self._canvas.yview,
                                 bg=C["scrollbar"])
        scrollbar.pack(side="right", fill="y")
        self._canvas.configure(yscrollcommand=scrollbar.set)

        self._chat_inner = tk.Frame(self._canvas, bg=C["surface"])
        self._chat_window = self._canvas.create_window(
            0, 0, anchor="nw", window=self._chat_inner
        )
        self._chat_inner.bind("<Configure>", self._on_inner_configure)
        self._canvas.bind("<Configure>",     self._on_canvas_configure)

        self._add_bubble("Hey, I'm Athena. Say 'Hey Athena' or press Space to wake me up.", "ai")

        # Bottom input bar
        bottom = tk.Frame(main, bg=C["elevated"],
                          highlightbackground=C["border"],
                          highlightthickness=1, height=60)
        bottom.pack(fill="x", side="bottom")
        bottom.pack_propagate(False)

        self._text_input = tk.Entry(bottom,
                                    bg=C["input_bg"], fg=C["text"],
                                    insertbackground=C["accent2"],
                                    relief="flat",
                                    font=("Segoe UI", 10),
                                    highlightbackground=C["border2"],
                                    highlightthickness=1)
        self._text_input.pack(side="left", fill="both",
                              expand=True, padx=(12, 6), pady=12)
        self._PLACEHOLDER = "Type a message or press Space to speak…"
        self._text_input.insert(0, self._PLACEHOLDER)
        self._text_input.configure(fg=C["text3"])
        self._text_input.bind("<FocusIn>",  self._input_focus_in)
        self._text_input.bind("<FocusOut>", self._input_focus_out)

        send_btn = tk.Label(bottom, text="↑",
                            bg=C["accent"], fg="#ffffff",
                            font=("Arial", 13, "bold"),
                            width=3, cursor="hand2")
        send_btn.pack(side="right", padx=(0, 12), pady=12)
        send_btn.bind("<Button-1>", lambda e: self._send_text())

        self._main_frame = main

    def _add_bubble(self, text, role="ai"):
        bubble = ChatBubble(self._chat_inner, text, role)
        bubble.pack(fill="x")
        self._chat_inner.update_idletasks()
        self._canvas.yview_moveto(1.0)

    def _clear_chat(self):
        for w in self._chat_inner.winfo_children():
            w.destroy()
        self._add_bubble("Conversation cleared. Say 'Hey Athena' or press Space.", "ai")

    def _on_inner_configure(self, event):
        self._canvas.configure(scrollregion=self._canvas.bbox("all"))

    def _on_canvas_configure(self, event):
        self._canvas.itemconfig(self._chat_window, width=event.width)

    def _input_focus_in(self, event):
        if self._text_input.get() == self._PLACEHOLDER:
            self._text_input.delete(0, "end")
            self._text_input.configure(fg=C["text"])

    def _input_focus_out(self, event):
        if not self._text_input.get():
            self._text_input.insert(0, self._PLACEHOLDER)
            self._text_input.configure(fg=C["text3"])

    def _send_text(self):
        txt = self._text_input.get().strip()
        if not txt or txt == self._PLACEHOLDER:
            return
        self._text_input.delete(0, "end")
        self._text_input.configure(fg=C["text"])
        self._add_bubble(txt, "user")
        self._process_text(txt)

    def _process_text(self, txt):
        import threading
        threading.Thread(target=self._text_turn, args=(txt,), daemon=True).start()

    def _text_turn(self, txt):
        self.eq.put({"type": "state", "value": "thinking"})
        try:
            from athena import query_llm, save_memory
        except ImportError:
            self.eq.put({"type": "reply", "text": "[LLM not connected — run via athena.py]"})
            return
        self.history.append({"role": "user", "content": txt})
        reply = query_llm(txt, self.history, self.user_name)
        self.history.append({"role": "assistant", "content": reply})
        save_memory(self.history)
        self.eq.put({"type": "reply", "text": reply})

    def _set_state(self, s):
        self.state = s
        self.orb.set_state(s)
        state_labels = {
            "idle":      "● STANDBY",
            "listening": "● LISTENING",
            "thinking":  "● THINKING",
            "speaking":  "● SPEAKING",
        }
        state_cols = {
            "idle":      C["text3"],
            "listening": C["listening"],
            "thinking":  C["thinking"],
            "speaking":  C["speaking"],
        }
        self._state_pill.configure(
            text=state_labels.get(s, s.upper()),
            fg=state_cols.get(s, C["text2"])
        )

    def _wake(self):
        if self.state != "idle":
            return
        self.eq.put({"type": "state", "value": "listening"})
        import threading
        threading.Thread(target=self._turn, daemon=True).start()

    def _turn(self):
        try:
            from athena import listen_once, query_llm, save_memory, stop_speech, dismiss_alarm
        except ImportError:
            self.eq.put({"type": "reply", "text": "[Run via athena.py to enable voice]"})
            return

        txt = listen_once(8)
        if not txt:
            self.eq.put({"type": "state", "value": "idle"})
            return

        self._add_bubble_safe(txt, "user")

        stop_words = ["stop","quiet","shut up","pause","chup","ruko","bas",
                      "band karo","dismiss","snooze","cancel alarm"]
        if any(w in txt.lower() for w in stop_words):
            stop_speech()
            dismiss_alarm()
            self.root.after(0, self._set_state, "idle")
            return

        self.eq.put({"type": "state", "value": "thinking"})
        self.history.append({"role": "user", "content": txt})
        reply = query_llm(txt, self.history, self.user_name)
        self.history.append({"role": "assistant", "content": reply})
        save_memory(self.history)
        self.eq.put({"type": "reply", "text": reply})

    def _add_bubble_safe(self, text, role):
        self.root.after(0, self._add_bubble, text, role)

    def _speak_bg(self, text):
        self._set_state("speaking")
        self._add_bubble_safe(text, "ai")
        try:
            from athena import speak_text
            speak_text(text)
        except ImportError:
            import time; time.sleep(1)
        if self.state == "speaking":
            self._set_state("idle")

    def _eq_loop_thread(self):
        while True:
            try:
                ev = self.eq.get(timeout=0.5)
                if ev["type"] == "state":
                    self.root.after(0, self._set_state, ev["value"])
                elif ev["type"] == "reply":
                    text = ev["text"]
                    def _launch(t=text):
                        import threading
                        threading.Thread(target=self._speak_bg,
                                         args=(t,), daemon=True).start()
                    self.root.after(0, _launch)
            except queue.Empty:
                pass

    def _wake_thread(self):
        try:
            import speech_recognition as sr
        except ImportError:
            return

        WAKE_WORDS = ["hey athena","athena","hi athena","ok athena",
                      "wake up","hello athena","aye athena","hey elena"]
        rec = sr.Recognizer()
        rec.energy_threshold          = 200
        rec.dynamic_energy_threshold  = True
        rec.pause_threshold           = 0.5

        def callback(recognizer, audio):
            if self.state != "idle":
                return
            try:
                txt = recognizer.recognize_google(audio).lower()
                if any(w in txt for w in WAKE_WORDS):
                    self.root.after(0, self._wake)
            except Exception:
                pass

        with sr.Microphone() as src:
            rec.adjust_for_ambient_noise(src, duration=1)
            recognizer_stop = rec.listen_in_background(src, callback,
                                                       phrase_time_limit=4)
            self.root.mainloop()
            recognizer_stop(wait_for_stop=False)

    def _drag_start(self, e):
        self._drag_x = e.x
        self._drag_y = e.y

    def _drag_move(self, e):
        nx = self.root.winfo_x() + (e.x - self._drag_x)
        ny = self.root.winfo_y() + (e.y - self._drag_y)
        self.root.geometry(f"+{nx}+{ny}")

    def _stop(self):
        try:
            from athena import stop_speech, dismiss_alarm
            stop_speech()
            dismiss_alarm()
        except ImportError:
            pass
        self._set_state("idle")

    def _quit(self):
        self.root.destroy()


if __name__ == "__main__":
    print("Running Athena UI in standalone demo mode.")
    print("Voice features need athena.py + API keys.\n")

    import sys, types
    dummy = types.ModuleType("athena")
    dummy.listen_once    = lambda t: ""
    dummy.query_llm      = lambda *a, **kw: "This is a demo response from Athena."
    dummy.save_memory    = lambda h: None
    dummy.speak_text     = lambda t: None
    dummy.stop_speech    = lambda: None
    dummy.dismiss_alarm  = lambda: None
    sys.modules["athena"] = dummy

    app = AthenaApp()
