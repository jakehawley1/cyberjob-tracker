import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Resume Tailor — CyberJob Tracker',
}

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: 200,
        flexShrink: 0,
        background: 'var(--bg)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, padding: '0 1.25rem 1.25rem', borderBottom: '0.5px solid var(--border)', marginBottom: '0.75rem' }}>
          CyberJob Tracker
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 0.5rem' }}>
          {[
            { label: 'All jobs', href: '/dashboard' },
            { label: 'Match finder', href: '/dashboard' },
            { label: 'AI resume tailor', href: '/resume' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: 8,
                color: item.href === '/resume' ? 'var(--text)' : 'var(--text2)',
                background: item.href === '/resume' ? 'var(--bg2)' : 'none',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                display: 'block',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div style={{ padding: '0.75rem', borderTop: '0.5px solid var(--border)' }}>
          <a href="https://www.governmentjobs.com" target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', fontSize: 12, padding: '5px 12px', border: '0.5px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', marginBottom: 8 }}>
            governmentjobs.com ↗
          </a>
          <a href="https://www.usajobs.gov" target="_blank" rel="noreferrer"
            style={{ display: 'block', textAlign: 'center', fontSize: 12, padding: '5px 12px', border: '0.5px solid var(--border2)', borderRadius: 8, color: 'var(--text2)' }}>
            USAJobs ↗
          </a>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
