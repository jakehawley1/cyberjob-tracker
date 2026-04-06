import type { Job } from '@/lib/supabase'
import styles from './StatsBar.module.css'

export default function StatsBar({ jobs }: { jobs: Job[] }) {
  const c = { applied: 0, interview: 0, finalist: 0, offer: 0, rejected: 0 }
  jobs.forEach(j => { if (j.status in c) c[j.status as keyof typeof c]++ })

  const stats = [
    { label: 'Applied', count: c.applied, color: 'blue' },
    { label: 'Interviews', count: c.interview, color: 'teal' },
    { label: 'Finalist', count: c.finalist, color: 'amber' },
    { label: 'Offers', count: c.offer, color: 'green' },
    { label: 'Rejected', count: c.rejected, color: 'red' },
    { label: 'Total', count: jobs.length, color: 'gray' },
  ]

  return (
    <div className={styles.bar}>
      {stats.map(s => (
        <div key={s.label} className={styles.stat}>
          <span className={`${styles.num} ${styles[s.color]}`}>{s.count}</span>
          <span className={styles.lbl}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}
