'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type Job } from '@/lib/supabase'
import JobForm from '@/components/JobForm'
import JobCard from '@/components/JobCard'
import JobDetail from '@/components/JobDetail'
import StatsBar from '@/components/StatsBar'
import MatchFinder from '@/components/MatchFinder'
import styles from './dashboard.module.css'

type Tab = 'jobs' | 'matches'

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editJob, setEditJob] = useState<Job | null>(null)
  const [tab, setTab] = useState<Tab>('jobs')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterClearance, setFilterClearance] = useState('')

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase()
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const filtered = jobs.filter(j => {
    if (search) {
      const q = search.toLowerCase()
      if (!(j.title + j.org + j.location + (j.tags || []).join(' ')).toLowerCase().includes(q)) return false
    }
    if (filterStatus && j.status !== filterStatus) return false
    if (filterClearance && j.clearance !== filterClearance) return false
    return true
  })

  const selected = jobs.find(j => j.id === selectedId) || null

  function openAdd() { setEditJob(null); setShowForm(true); setSelectedId(null) }
  function openEdit(job: Job) { setEditJob(job); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditJob(null) }

  async function handleSave(data: Partial<Job>) {
    if (editJob) {
      await supabase().from('jobs').update(data).eq('id', editJob.id)
    } else {
      await supabase().from('jobs').insert([data])
    }
    await fetchJobs()
    closeForm()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this job entry?')) return
    await supabase().from('jobs').delete().eq('id', id)
    setSelectedId(null)
    await fetchJobs()
  }

  async function handleStatusChange(id: string, status: Job['status']) {
    const job = jobs.find(j => j.id === id)
    if (!job || job.status === status) return
    const timeline = [...(job.timeline || []), { status, date: new Date().toISOString().split('T')[0] }]
    await supabase().from('jobs').update({ status, timeline }).eq('id', id)
    await fetchJobs()
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>CyberJob Tracker</div>
        <nav className={styles.nav}>
          <button className={`${styles.navBtn} ${tab === 'jobs' ? styles.navActive : ''}`} onClick={() => setTab('jobs')}>
            All jobs
          </button>
          <button className={`${styles.navBtn} ${tab === 'matches' ? styles.navActive : ''}`} onClick={() => setTab('matches')}>
            Match finder
          </button>
        </nav>
        <div className={styles.sidebarFooter}>
          <a href="https://www.governmentjobs.com" target="_blank" rel="noreferrer" className="btn btn-sm" style={{width:'100%',justifyContent:'center'}}>
            governmentjobs.com ↗
          </a>
          <a href="https://www.usajobs.gov" target="_blank" rel="noreferrer" className="btn btn-sm" style={{width:'100%',justifyContent:'center',marginTop:8}}>
            USAJobs ↗
          </a>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topbar}>
          <StatsBar jobs={jobs} />
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add job</button>
        </div>

        {showForm && (
          <JobForm
            job={editJob}
            onSave={handleSave}
            onCancel={closeForm}
          />
        )}

        {tab === 'jobs' && (
          <div className={styles.content}>
            <div className={styles.filters}>
              <input
                className={styles.search}
                placeholder="Search title, org, location, tags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="finalist">Finalist</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="pending">Pending</option>
              </select>
              <select value={filterClearance} onChange={e => setFilterClearance(e.target.value)}>
                <option value="">Any clearance</option>
                <option value="none">No clearance</option>
                <option value="preferred">Clearance preferred</option>
                <option value="required">Clearance required</option>
              </select>
            </div>

            <div className={styles.listDetail}>
              <div className={styles.list}>
                {loading && <div className="empty">Loading...</div>}
                {!loading && filtered.length === 0 && <div className="empty">No jobs yet. Hit "+ Add job" to start tracking.</div>}
                {filtered.map(j => (
                  <JobCard
                    key={j.id}
                    job={j}
                    selected={selectedId === j.id}
                    onClick={() => setSelectedId(selectedId === j.id ? null : j.id)}
                  />
                ))}
              </div>
              {selected && (
                <div className={styles.detail}>
                  <JobDetail
                    job={selected}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'matches' && <MatchFinder />}
      </main>
    </div>
  )
}
