import type { Metadata } from 'next'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'CyberJob Tracker',
  description: 'Cybersecurity job search tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          {children}
        </main>
      </body>
    </html>
  )
}
