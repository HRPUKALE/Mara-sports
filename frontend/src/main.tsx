import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/toaster"
import { NotificationProvider } from "@/contexts/NotificationContext"
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <App />
      <Toaster />
    </NotificationProvider>
  </StrictMode>,
)
