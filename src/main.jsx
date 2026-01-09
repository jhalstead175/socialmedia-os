import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from '@/App.jsx'
import RootLayout from '@/layouts/RootLayout.jsx'
import ErrorBoundary from '@/components/ErrorBoundary.jsx'
import '@/index.css'

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('⚠️ VITE_CLERK_PUBLISHABLE_KEY not set. Authentication disabled. Landing page will work, but sign-in will not.')
}

// Only wrap with ClerkProvider if valid key exists
// Without key, Landing page will work but protected pages will error gracefully
const AppWrapper = CLERK_PUBLISHABLE_KEY ? (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
) : (
  <App />
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RootLayout>
        {AppWrapper}
      </RootLayout>
    </ErrorBoundary>
  </React.StrictMode>
) 