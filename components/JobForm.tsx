'use client'
import { useState } from 'react'
import type { Job } from '@/lib/supabase'
import styles from './JobForm.module.css'

const SOURCES = ['governmentjobs.com', 'USAJobs', 'LinkedIn', 'Indeed', 'Agency site', 'ZipRecruiter', 'Other']

export default function JobForm({ job, onSave, onCancel }: {
  job: Job | null
  onSave: (data: Partial<Job>) => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showPaste, setShowPaste] = useState(!job)
  const [form, setForm] = useState({
    title: job?.title || '',
    org: job?.org || '',
    location: job?.location || '',
    salary: job?.salary || '',
    source: job?.source || 'governmentjobs.com',
    url: job?.url || '',
    date_applied: job?.date_applied || new Date().toISOString().split('T')[0],
    status: job?.status || 'applied',
    clearance: job?.clearance || 'none',
    tags: (job?.tags || []).join(', '),
    notes: job?.notes || '',
    resume_version: job?.resume_version || '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function parsePosting() {
    if (!pasteText.trim()) return
    setParsing(true)
    try {
      const res = await fetch('/api/parse-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setForm(f => ({
        ...f,
        title: data.title || f.title,
        org: data.org || f.org,
        location: data.location || f.location,
        salary: data.salary || f.salary,
        source: data.source || f.source,
        clearance: data.clearance || f.clearance,
        tags: (data.tags || []).join(', ') || f.tags,
        notes: data.notes || f.notes,
        url: data.url || f.url,
      }))
      setShowPaste(false)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to parse posting')
    } finally {
      setParsing(false)
    }
  }

  async function submit() {
    if (!form.title.trim() || !form.org.trim()) return alert('Title and organization are required.')
    setSaving(true)
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const data: Partial<Job> = {
      ...form,
      tags,
      status: form.status as Job['status'],
      clearance: form.clearance as Job['clearance'],
    }
    if (!job) {
      data.timeline = [{ status: form.status, date: form.date_applied || new Date().toISOString().split('T')[0] }]
    }
    await onSave(data)
    setSaving(false)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>{job ? 'Edit job' : 'Add new job'}</div>
          <button className={styles.close} onClick={onCancel}>✕</button>
        </div>

        {/* Paste-to-fill section — shown by default on new jobs */}
        {!job && (
          <div className={styles.pasteSection}>
            <div className={styles.pasteHeader}>
              <div className={styles.pasteTitle}>
                ✦ Auto-fill from job posting
              </div>
              <button className={styles.pasteToggle} onClick={() => setShowPaste(!showPaste)}>
                {showPaste ? 'Fill manually instead' : 'Paste job posting instead'}
              </button>
            </div>
            {showPaste && (
              <div className={styles.pasteBody}>
                <p className={styles.pasteHint}>
                  Go to the job posting, select all the text (Cmd+A), copy it (Cmd+C), and paste it below. Claude will extract the title, org, location, salary, tags, and a summary automatically.
                </p>
                <textarea
                  className={styles.pasteArea}
                  placeholder="Paste the full job posting text here..."
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={parsePosting}
                  disabled={parsing || !pasteText.trim()}
                  style={{ marginTop: 8 }}
                >
                  {parsing ? 'Parsing...' : '✦ Auto-fill fields'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Job title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Cybersecurity Compliance Analyst" />
          </div>
          <div className={styles.field}>
            <label>Organization *</label>
            <input value={form.org} onChange={e => set('org', e.target.value)} placeholder="City of Minneapolis" />
          </div>
          <div className={styles.field}>
            <label>Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Minneapolis, MN (or Remote)" />
          </div>
          <div className={styles.field}>
            <label>Salary / Grade</label>
            <input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="$65,000–$75,000 or GS-9" />
          </div>
          <div className={styles.field}>
            <label>Source</label>
            <select value={form.source} onChange={e => set('source', e.target.value)}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Date applied</label>
            <input type="date" value={form.date_applied} onChange={e => set('date_applied', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="finalist">Finalist</option>
              <option value="offer">Offer received</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="pending">Pending / Watching</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Clearance required?</label>
            <select value={form.clearance} onChange={e => set('clearance', e.target.value)}>
              <option value="none">Not required</option>
              <option value="preferred">Preferred</option>
              <option value="required">Required</option>
            </select>
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>Job posting URL</label>
            <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://www.governmentjobs.com/careers/..." />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>Resume version used</label>
            <input value={form.resume_version} onChange={e => set('resume_version', e.target.value)} placeholder="e.g. compliance-v3, nist-focused-v2" />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="compliance, GRC, NIST, local gov, help desk" />
          </div>
          <div className={`${styles.field} ${styles.full}`}>
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Contact info, follow-up dates, interview notes, recruiter name..."
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button className="btn btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-sm btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : job ? 'Save changes' : 'Add job'}
          </button>
        </div>
      </div>
    </div>
  )
}
