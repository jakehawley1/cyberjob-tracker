'use client'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const NAV = [
  { label: 'All jobs', href: '/dashboard' },
  { label: 'Match finder', href: '/dashboard?tab=matches' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'AI resume tailor', href: '/resume' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>CyberJob Tracker</div>
      <nav className={styles.nav}>
        {NAV.map(item => (
          <a
            key={item.label}
            href={item.href}
            className={`${styles.navBtn} ${path === item.href.split('?')[0] ? styles.navActive : ''}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className={styles.footer}>
        <a href="https://www.governmentjobs.com" target="_blank" rel="noreferrer" className={styles.extLink}>
          governmentjobs.com ↗
        </a>
        <a href="https://www.usajobs.gov" target="_blank" rel="noreferrer" className={styles.extLink}>
          USAJobs ↗
        </a>
      </div>
    </aside>
  )
}
