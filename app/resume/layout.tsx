import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Resume Tailor — CyberJob Tracker',
}

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
