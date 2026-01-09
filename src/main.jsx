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

// Always wrap with ClerkProvider to prevent hook errors
// If key is missing, Clerk will not authenticate but hooks won't crash
const AppWrapper = (
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder'}>
    <App />
  </ClerkProvider>
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