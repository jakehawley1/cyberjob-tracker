'use client'
import { useEffect, useState } from 'react'
import { supabase, type Job } from '@/lib/supabase'
import styles from './analytics.module.css'

type DayStat = { date: string; count: number }
type StatusStat = { status: string; count: number; color: string }
type SourceStat = { source: string; count: number }

const STATUS_COLORS: Record<string, string> = {
  applied: 'var(--blue)',
  interview: 'var(--teal)',
  finalist: 'var(--amber)',
  offer: 'var(--green)',
  rejected: 'var(--red)',
  withdrawn: 'var(--gray)',
  pending: 'var(--pink)',
}

const STATUS_BG: Record<string, string> = {
  applied: 'var(--blue-bg)',
  interview: 'var(--teal-bg)',
  finalist: 'var(--amber-bg)',
  offer: 'var(--green-bg)',
  rejected: 'var(--red-bg)',
  withdrawn: 'var(--gray-bg)',
  pending: 'var(--pink-bg)',
}

function sl(s: string) {
  const m: Record<string, string> = { applied: 'Applied', interview: 'Interview', finalist: 'Finalist', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn', pending: 'Pending' }
  return m[s] || s
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase().from('jobs').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { setJobs(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className={styles.page}><div className={styles.empty}>Loading...</div></div>
  if (jobs.length === 0) return <div className={styles.page}><div className={styles.empty}>No jobs yet — add some applications first.</div></div>

  // Applications per day (last 30 days)
  const dayMap: Record<string, number> = {}
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dayMap[d.toISOString().split('T')[0]] = 0
  }
  jobs.forEach(j => {
    const d = j.date_applied || j.created_at?.split('T')[0]
    if (d && d in dayMap) dayMap[d]++
  })
  const dayStats: DayStat[] = Object.entries(dayMap).map(([date, count]) => ({ date, count }))
  const maxDay = Math.max(...dayStats.map(d => d.count), 1)

  // Status breakdown
  const statusMap: Record<string, number> = {}
  jobs.forEach(j => { statusMap[j.status] = (statusMap[j.status] || 0) + 1 })
  const statusStats: StatusStat[] = Object.entries(statusMap)
    .map(([status, count]) => ({ status, count, color: STATUS_COLORS[status] || 'var(--text2)' }))
    .sort((a, b) => b.count - a.count)

  // Source breakdown
  const sourceMap: Record<string, number> = {}
  jobs.forEach(j => { sourceMap[j.source || 'Unknown'] = (sourceMap[j.source || 'Unknown'] || 0) + 1 })
  const sourceStats: SourceStat[] = Object.entries(sourceMap)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
  const maxSource = Math.max(...sourceStats.map(s => s.count), 1)

  // Response rate
  const responded = jobs.filter(j => ['interview', 'finalist', 'offer', 'rejected'].includes(j.status)).length
  const responseRate = jobs.length > 0 ? Math.round((responded / jobs.length) * 100) : 0
  const interviewRate = jobs.length > 0 ? Math.round((jobs.filter(j => ['interview', 'finalist', 'offer'].includes(j.status)).length / jobs.length) * 100) : 0
  const offerRate = jobs.length > 0 ? Math.round((jobs.filter(j => j.status === 'offer').length / jobs.length) * 100) : 0

  // Weekly pace
  const thisWeek = jobs.filter(j => {
    const d = new Date(j.date_applied || j.created_at)
    const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <div className={styles.subtitle}>{jobs.length} total applications tracked</div>
      </div>

      {/* Key metrics */}
      <div className={styles.metricGrid}>
        <div className={styles.metric}>
          <div className={styles.metricNum} style={{ color: 'var(--blue)' }}>{jobs.length}</div>
          <div className={styles.metricLabel}>Total applied</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricNum} style={{ color: 'var(--teal)' }}>{responseRate}%</div>
          <div className={styles.metricLabel}>Response rate</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricNum} style={{ color: 'var(--amber)' }}>{interviewRate}%</div>
          <div className={styles.metricLabel}>Interview rate</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricNum} style={{ color: 'var(--green)' }}>{offerRate}%</div>
          <div className={styles.metricLabel}>Offer rate</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricNum} style={{ color: 'var(--pink)' }}>{thisWeek}</div>
          <div className={styles.metricLabel}>This week</div>
        </div>
      </div>

      {/* Applications per day chart */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Applications per day — last 30 days</div>
        <div className={styles.barChart}>
          {dayStats.map(d => (
            <div key={d.date} className={styles.barCol}>
              <div className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{ height: `${(d.count / maxDay) * 100}%`, background: d.count > 0 ? 'var(--blue)' : 'var(--border)' }}
                  title={`${d.date}: ${d.count} application${d.count !== 1 ? 's' : ''}`}
                />
              </div>
              {d.count > 0 && <div className={styles.barVal}>{d.count}</div>}
              <div className={styles.barLabel}>
                {new Date(d.date + 'T12:00:00').getDate() === 1 || dayStats.indexOf(d) === 0
                  ? new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : new Date(d.date + 'T12:00:00').getDate() % 7 === 0
                  ? new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Status breakdown */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Status breakdown</div>
          <div className={styles.statusList}>
            {statusStats.map(s => (
              <div key={s.status} className={styles.statusRow}>
                <div className={styles.statusInfo}>
                  <div className={styles.statusDot} style={{ background: s.color }} />
                  <div className={styles.statusName}>{sl(s.status)}</div>
                </div>
                <div className={styles.statusBarWrap}>
                  <div
                    className={styles.statusBar}
                    style={{ width: `${(s.count / jobs.length) * 100}%`, background: STATUS_BG[s.status], border: `1px solid ${s.color}` }}
                  />
                </div>
                <div className={styles.statusCount} style={{ color: s.color }}>{s.count}</div>
              </div>
            ))}
          </div>
          {/* Donut-style visual */}
          <div className={styles.donutWrap}>
            <svg viewBox="0 0 120 120" className={styles.donut}>
              {(() => {
                let offset = 0
                const total = jobs.length
                const r = 45
                const circ = 2 * Math.PI * r
                return statusStats.map(s => {
                  const pct = s.count / total
                  const dash = pct * circ
                  const el = (
                    <circle
                      key={s.status}
                      cx="60" cy="60" r={r}
                      fill="none"
                      stroke={s.color}
                      strokeWidth="18"
                      strokeDasharray={`${dash} ${circ - dash}`}
                      strokeDashoffset={-offset * circ / total * (circ / (circ / total))}
                      style={{ strokeDashoffset: -(offset / total) * circ }}
                      transform="rotate(-90 60 60)"
                    />
                  )
                  offset += s.count
                  return el
                })
              })()}
              <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">{jobs.length}</text>
              <text x="60" y="70" textAnchor="middle" fontSize="9" fill="var(--text2)">total</text>
            </svg>
          </div>
        </div>

        {/* Source breakdown */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Applications by source</div>
          <div className={styles.sourceList}>
            {sourceStats.map(s => (
              <div key={s.source} className={styles.sourceRow}>
                <div className={styles.sourceName}>{s.source}</div>
                <div className={styles.sourceBarWrap}>
                  <div
                    className={styles.sourceBar}
                    style={{ width: `${(s.count / maxSource) * 100}%` }}
                  />
                </div>
                <div className={styles.sourceCount}>{s.count}</div>
              </div>
            ))}
          </div>

          {/* Match scores if any */}
          {jobs.some(j => j.match_score != null) && (
            <>
              <div className={styles.cardTitle} style={{ marginTop: '1.5rem' }}>Resume match scores</div>
              <div className={styles.scoreList}>
                {jobs.filter(j => j.match_score != null).sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).map(j => (
                  <div key={j.id} className={styles.scoreRow}>
                    <div className={styles.scoreJobTitle}>{j.title}</div>
                    <div className={styles.scoreBarWrap}>
                      <div
                        className={styles.scoreBar}
                        style={{
                          width: `${j.match_score}%`,
                          background: (j.match_score || 0) >= 70 ? 'var(--teal)' : (j.match_score || 0) >= 50 ? 'var(--amber)' : 'var(--red)'
                        }}
                      />
                    </div>
                    <div className={styles.scoreVal} style={{ color: (j.match_score || 0) >= 70 ? 'var(--teal)' : (j.match_score || 0) >= 50 ? 'var(--amber)' : 'var(--red)' }}>
                      {j.match_score}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
