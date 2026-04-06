'use client'
import { useState } from 'react'
import styles from './resume.module.css'

export default function ResumePage() {
  const [latex, setLatex] = useState('')
  const [jd, setJd] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function generate() {
    if (!latex.trim() || !jd.trim()) return alert('Paste both your LaTeX resume and the job description.')
    setLoading(true)
    setOutput('')
    setFeedback('')
    try {
      const res = await fetch('/api/resume-tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex, jd, jobTitle })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOutput(data.latex)
      setFeedback(data.feedback)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Resume Tailor</h1>
        <p className={styles.subtitle}>
          Paste your LaTeX resume + a job description. Claude rewrites your resume to match the role — same experience, optimized language and emphasis.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.col}>
          <div className={styles.fieldHeader}>
            <label className={styles.label}>Job title (optional)</label>
          </div>
          <input
            className={styles.input}
            placeholder="e.g. Cybersecurity Compliance Analyst — City of Minneapolis"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
          />

          <div className={styles.fieldHeader} style={{ marginTop: '1rem' }}>
            <label className={styles.label}>Job description *</label>
            <span className={styles.charCount}>{jd.length} chars</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Paste the full job description here — the more complete it is, the better the tailoring..."
            value={jd}
            onChange={e => setJd(e.target.value)}
          />
        </div>

        <div className={styles.col}>
          <div className={styles.fieldHeader}>
            <label className={styles.label}>Your LaTeX resume code *</label>
            <span className={styles.charCount}>{latex.length} chars</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder={`Paste your full LaTeX code here...\n\n\\documentclass{article}\n\\begin{document}\n...`}
            value={latex}
            onChange={e => setLatex(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-primary"
          onClick={generate}
          disabled={loading || !latex.trim() || !jd.trim()}
        >
          {loading ? 'Tailoring resume...' : '✦ Tailor resume for this job'}
        </button>
        {loading && <span className={styles.hint}>This takes 15–30 seconds...</span>}
      </div>

      {feedback && (
        <div className={styles.feedback}>
          <div className={styles.feedbackTitle}>What was changed</div>
          <div className={styles.feedbackBody}>{feedback}</div>
        </div>
      )}

      {output && (
        <div className={styles.outputSection}>
          <div className={styles.outputHeader}>
            <div className={styles.label}>Tailored LaTeX — ready to paste into Overleaf</div>
            <button className="btn btn-sm" onClick={copy}>
              {copied ? '✓ Copied!' : 'Copy to clipboard'}
            </button>
          </div>
          <pre className={styles.output}>{output}</pre>
          <div className={styles.outputFooter}>
            <span>Paste this into Overleaf and compile to generate your PDF.</span>
          </div>
        </div>
      )}
    </div>
  )
}
