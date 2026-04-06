'use client'
import { useState } from 'react'
import type { Job } from '@/lib/supabase'
import styles from './JobDetail.module.css'

const STATUSES: { value: Job['status']; label: string; color: string }[] = [
  { value: 'applied', label: 'Applied', color: 'blue' },
  { value: 'interview', label: 'Interview', color: 'teal' },
  { value: 'finalist', label: 'Finalist', color: 'amber' },
  { value: 'offer', label: 'Offer', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'pink' },
]

function fd(d: string) {
  if (!d) return '—'
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function cl(c: string) {
  return { none: 'Not required', preferred: 'Preferred', required: 'Required' }[c] || c
}

export default function JobDetail({ job, onEdit, onDelete, onStatusChange }: {
  job: Job
  onEdit: (j: Job) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Job['status']) => void
}) {
  const [scoring, setScoring] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [jdText, setJdText] = useState('')
  const [scoreResult, setScoreResult] = useState<{ score: number; feedback: string } | null>(null)
  const [showScorer, setShowScorer] = useState(false)

  async function runScore() {
    if (!resumeText || !jdText) return
    setScoring(true)
    try {
      const res = await fetch('/api/resume-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, resumeText, jdText })
      })
      const data = await res.json()
      setScoreResult(data)
    } finally {
      setScoring(false)
    }
  }

  const currentStatus = STATUSES.find(s => s.value === job.status)

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{job.title}</div>
          <div className={styles.subtitle}>{job.org}{job.location ? ` — ${job.location}` : ''}</div>
        </div>
        <div className={styles.actions}>
          {job.url && <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-sm">Posting ↗</a>}
          <button className="btn btn-sm" onClick={() => onEdit(job)}>Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => onDelete(job.id)}>Delete</button>
        </div>
      </div>

      <div className={`${styles.currentStatus} ${styles['status_' + job.status]}`}>
        <div className={styles.currentStatusLabel}>Current status</div>
        <div className={styles.currentStatusValue}>{currentStatus?.label}</div>
      </div>

      <div className={styles.section}>
        <div className="label" style={{ marginBottom: 8 }}>Update status</div>
        <div className={styles.statusGrid}>
          {STATUSES.map(s => (
            <button
              key={s.value}
              className={`${styles.statusTile} ${styles['tile_' + s.color]} ${job.status === s.value ? styles.statusTileActive : ''}`}
              onClick={() => onStatusChange(job.id, s.value)}
            >
              {s.label}
              {job.status === s.value && <span className={styles.checkmark}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.drow}><div className="label">Applied</div><div>{fd(job.date_applied)}</div></div>
        <div className={styles.drow}><div className="label">Salary</div><div>{job.salary || '—'}</div></div>
        <div className={styles.drow}><div className="label">Source</div><div>{job.source || '—'}</div></div>
        <div className={styles.drow}><div className="label">Clearance</div><div>{cl(job.clearance)}</div></div>
        <div className={styles.drow}><div className="label">Resume version</div><div>{job.resume_version || '—'}</div></div>
        {job.match_score != null && (
          <div className={styles.drow}><div className="label">Match score</div><div style={{ color: 'var(--teal)', fontWeight: 600 }}>{job.match_score}%</div></div>
        )}
      </div>

      {job.tags?.length > 0 && (
        <div className={styles.section}>
          <div className="label" style={{ marginBottom: 6 }}>Tags</div>
          <div className={styles.tags}>{job.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
        </div>
      )}

      {job.notes && (
        <div className={styles.section}>
          <div className="label" style={{ marginBottom: 6 }}>Notes</div>
          <div className={styles.notes}>{job.notes}</div>
        </div>
      )}

      {job.timeline?.length > 0 && (
        <div className={styles.section}>
          <div className="label" style={{ marginBottom: 8 }}>Timeline</div>
          <div className={styles.timeline}>
            {job.timeline.map((t, i) => (
              <div key={i} className={styles.tlItem}>
                <div className={`${styles.tlDot} ${styles['dot_' + t.status]}`} />
                <div>
                  <div className={styles.tlStatus}>{STATUSES.find(s => s.value === t.status)?.label || t.status}</div>
                  <div className={styles.tlDate}>{fd(t.date)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <button className="btn btn-sm" onClick={() => setShowScorer(!showScorer)}>
          {showScorer ? 'Hide scorer' : '✦ Score my resume against this job'}
        </button>
        {showScorer && (
          <div className={styles.scorer}>
            <div className="label" style={{ marginBottom: 4 }}>Paste job description</div>
            <textarea placeholder="Paste the full job description here..." value={jdText} onChange={e => setJdText(e.target.value)} style={{ marginBottom: 10 }} />
            <div className="label" style={{ marginBottom: 4 }}>Paste your resume text</div>
            <textarea placeholder="Paste your resume here..." value={resumeText} onChange={e => setResumeText(e.target.value)} style={{ marginBottom: 10 }} />
            <button className="btn btn-primary btn-sm" onClick={runScore} disabled={scoring || !resumeText || !jdText}>
              {scoring ? 'Scoring...' : 'Score match'}
            </button>
            {scoreResult && (
              <div className={styles.scoreResult}>
                <div className={styles.scoreNum} style={{ color: scoreResult.score >= 70 ? 'var(--teal)' : scoreResult.score >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                  {scoreResult.score}% match
                </div>
                <div className={styles.scoreFeedback}>{scoreResult.feedback}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
