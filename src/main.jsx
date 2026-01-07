import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from '@/App.jsx'
import '@/index.css'

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️ VITE_CLERK_PUBLISHABLE_KEY not set. Authentication disabled. Landing page will work, but sign-in will not.')
}

// Conditionally wrap with ClerkProvider only if key is present
const AppWrapper = CLERK_PUBLISHABLE_KEY ? (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
) : (
  <App />
)

ReactDOM.createRoot(document.getElementById('root')).render(AppWrapper) 