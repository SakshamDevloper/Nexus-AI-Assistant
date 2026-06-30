import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

// Firebase Web API keys always start with "AIzaSy"
const isValidApiKey = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.startsWith('AIzaSy')
const hasFirebaseConfig = isValidApiKey && firebaseConfig.projectId

if (firebaseConfig.apiKey && !isValidApiKey) {
  console.warn(
    'Firebase: VITE_FIREBASE_API_KEY appears invalid. ' +
    'A Firebase Web API key must start with "AIzaSy". ' +
    'Copy it from Firebase Console → Project Settings → General → Your apps.'
  )
}

let app = null
let auth = null
let googleProvider = null

if (hasFirebaseConfig && !getApps().length) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  } catch (e) {
    console.warn('Firebase init failed:', e.message)
  }
}

export { app, auth, googleProvider }
export default app
