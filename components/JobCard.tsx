import type { Job } from '@/lib/supabase'
import styles from './JobCard.module.css'

function statusLabel(s: string) {
  const m: Record<string, string> = { applied: 'Applied', interview: 'Interview', finalist: 'Finalist', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn', pending: 'Pending' }
  return m[s] || s
}

export default function JobCard({ job, selected, onClick }: { job: Job; selected: boolean; onClick: () => void }) {
  return (
    <div className={`${styles.card} ${selected ? styles.selected : ''}`} onClick={onClick}>
      <div className={styles.top}>
        <div className={styles.info}>
          <div className={styles.title}>{job.title}</div>
          <div className={styles.meta}>
            {job.org}{job.location ? ` · ${job.location}` : ''}{job.date_applied ? ` · ${new Date(job.date_applied + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span className={`badge badge-${job.status}`}>{statusLabel(job.status)}</span>
          {job.match_score != null && (
            <span className={styles.score}>{job.match_score}% match</span>
          )}
        </div>
      </div>
      {job.tags?.length > 0 && (
        <div className={styles.tags}>
          {job.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  )
}
