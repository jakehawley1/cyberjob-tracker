'use client'
import { useState, useEffect } from 'react'
import styles from './MatchFinder.module.css'

type USAJob = {
  title: string
  org: string
  location: string
  salary: string
  url: string
  closeDate: string
  openDate: string
  grade: string
}

type Search = {
  title: string
  desc: string
  url: string
  tags: string[]
}

const SEARCHES: Search[] = [
  {
    title: 'Cybersecurity Compliance / GRC Analyst',
    desc: 'Governance, Risk & Compliance roles across federal, state, and local government',
    url: 'https://www.governmentjobs.com/careers/search?keyword=cybersecurity+compliance+GRC',
    tags: ['GRC', 'Compliance', 'Nationwide'],
  },
  {
    title: 'NIST / Information Security Analyst',
    desc: 'Roles requiring NIST framework knowledge — federal agencies and contractors',
    url: 'https://www.usajobs.gov/search/results/?k=NIST+cybersecurity+information+security&p=1',
    tags: ['NIST', 'Federal', 'USAJobs'],
  },
  {
    title: 'Information Assurance Analyst',
    desc: 'IA roles across DoD, civilian agencies, and state governments',
    url: 'https://www.usajobs.gov/search/results/?k=information+assurance&p=1',
    tags: ['IA', 'DoD', 'Federal'],
  },
  {
    title: 'IT Security Analyst — Local Government',
    desc: 'City and county IT security positions on governmentjobs.com',
    url: 'https://www.governmentjobs.com/careers/search?keyword=IT+security+analyst',
    tags: ['Local gov', 'Security'],
  },
  {
    title: 'Privacy / Data Protection Analyst',
    desc: 'Privacy compliance and data governance roles in government',
    url: 'https://www.governmentjobs.com/careers/search?keyword=privacy+data+protection+analyst',
    tags: ['Privacy', 'Data governance'],
  },
  {
    title: 'Risk Management / Security Compliance',
    desc: 'Risk management framework (RMF) and security compliance across all levels of government',
    url: 'https://www.usajobs.gov/search/results/?k=risk+management+security+compliance&p=1',
    tags: ['RMF', 'Risk', 'Federal'],
  },
  {
    title: 'Help Desk / IT Support — Government',
    desc: 'Entry and mid-level IT support roles that can grow into security positions',
    url: 'https://www.governmentjobs.com/careers/search?keyword=help+desk+IT+support',
    tags: ['Help desk', 'IT Support', 'Entry level'],
  },
  {
    title: 'Cybersecurity Analyst — CyberCorps / SFS',
    desc: 'Roles specifically recruiting CyberCorps Scholarship for Service graduates',
    url: 'https://www.usajobs.gov/search/results/?k=cybersecurity+scholarship+service+SFS&p=1',
    tags: ['SFS', 'CyberCorps', 'Federal'],
  },
  {
    title: 'Security Operations / SOC Analyst',
    desc: 'SOC and security operations center roles in government',
    url: 'https://www.governmentjobs.com/careers/search?keyword=security+operations+SOC+analyst',
    tags: ['SOC', 'Operations'],
  },
  {
    title: 'Audit / IT Auditor — Government',
    desc: 'IT audit roles that overlap heavily with compliance and security',
    url: 'https://www.governmentjobs.com/careers/search?keyword=IT+auditor+information+systems',
    tags: ['Audit', 'FISMA', 'Compliance'],
  },
]

const BOARDS = [
  { name: 'governmentjobs.com', desc: 'State & local government jobs', url: 'https://www.governmentjobs.com/careers/search?keyword=cybersecurity' },
  { name: 'USAJobs', desc: 'Federal government jobs', url: 'https://www.usajobs.gov/search/results/?k=cybersecurity&p=1' },
  { name: 'ClearanceJobs', desc: 'Clearance-required cyber roles', url: 'https://www.clearancejobs.com/jobs?q=cybersecurity+compliance' },
  { name: 'LinkedIn Jobs', desc: 'Broad search with filters', url: 'https://www.linkedin.com/jobs/search/?keywords=cybersecurity%20compliance%20analyst&f_WT=2' },
  { name: 'Indeed — Cyber Gov', desc: 'Government cyber on Indeed', url: 'https://www.indeed.com/jobs?q=cybersecurity+compliance+government&sort=date' },
]

export default function MatchFinder() {
  const [filter, setFilter] = useState('')
  const [usaJobs, setUsaJobs] = useState<USAJob[]>([])
  const [usaLoading, setUsaLoading] = useState(false)
  const [usaKeyword, setUsaKeyword] = useState('cybersecurity compliance')
  const [usaConfigured, setUsaConfigured] = useState(true)

  async function fetchUSAJobs() {
    setUsaLoading(true)
    try {
      const res = await fetch(`/api/usajobs?keyword=${encodeURIComponent(usaKeyword)}`)
      const data = await res.json()
      setUsaConfigured(data.configured)
      setUsaJobs(data.jobs || [])
    } catch(e) {
      console.error(e)
    } finally {
      setUsaLoading(false)
    }
  }

  useEffect(() => { fetchUSAJobs() }, [])

  const shown = SEARCHES.filter(s =>
    !filter || s.tags.some(t => t.toLowerCase().includes(filter.toLowerCase())) ||
    s.title.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.profile}>
        <div className={styles.profileTitle}>Your search profile</div>
        <div className={styles.profileDesc}>
          Master's in cybersecurity · SFS CyberCorps grad · Targeting compliance/GRC, NIST, RMF · Open to clearance roles · Anywhere in the US
        </div>
        <div className={styles.chips}>
          {['Compliance / GRC', 'NIST', 'RMF', 'SFS / CyberCorps', 'Local gov', 'Federal', 'Help desk', 'Clearance OK'].map(c => (
            <span key={c} className={`badge badge-applied ${styles.chip}`}>{c}</span>
          ))}
        </div>
      </div>

      <div className={styles.boards}>
        <div className={styles.sectionTitle}>Job boards</div>
        <div className={styles.boardGrid}>
          {BOARDS.map(b => (
            <a key={b.name} href={b.url} target="_blank" rel="noreferrer" className={styles.boardCard}>
              <div className={styles.boardName}>{b.name} ↗</div>
              <div className={styles.boardDesc}>{b.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <div className={styles.searches}>
        <div className={styles.searchesHeader}>
          <div className={styles.sectionTitle}>Curated searches for your profile</div>
          <input
            className={styles.filterInput}
            placeholder="Filter by keyword..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <div className={styles.searchList}>
          {shown.map(s => (
            <div key={s.title} className={styles.searchCard}>
              <div className={styles.searchInfo}>
                <div className={styles.searchTitle}>{s.title}</div>
                <div className={styles.searchDesc}>{s.desc}</div>
                <div className={styles.searchTags}>
                  {s.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <a href={s.url} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ flexShrink: 0 }}>
                Search ↗
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.usajobs}>
        <div className={styles.usaHeader}>
          <div className={styles.sectionTitle}>Live federal jobs — USAJobs</div>
          <div className={styles.usaSearch}>
            <input
              className={styles.filterInput}
              value={usaKeyword}
              onChange={e => setUsaKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUSAJobs()}
              placeholder="Search keyword..."
            />
            <button className="btn btn-sm btn-primary" onClick={fetchUSAJobs} disabled={usaLoading}>
              {usaLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        {!usaConfigured && (
          <div className={styles.usaNotice}>
            To enable live federal job search, register for a free API key at <a href="https://developer.usajobs.gov" target="_blank" rel="noreferrer">developer.usajobs.gov</a> and add <code>USAJOBS_API_KEY</code> and <code>USAJOBS_EMAIL</code> to your Vercel environment variables.
          </div>
        )}
        {usaConfigured && usaJobs.length === 0 && !usaLoading && (
          <div className={styles.usaEmpty}>No results — try a different keyword.</div>
        )}
        {usaJobs.length > 0 && (
          <div className={styles.usaList}>
            {usaJobs.map((j, i) => (
              <a key={i} href={j.url} target="_blank" rel="noreferrer" className={styles.usaCard}>
                <div className={styles.usaTop}>
                  <div>
                    <div className={styles.usaTitle}>{j.title}</div>
                    <div className={styles.usaMeta}>{j.org} · {j.location}</div>
                  </div>
                  <div className={styles.usaRight}>
                    <div className={styles.usaSalary}>{j.salary}</div>
                    {j.closeDate && <div className={styles.usaClose}>Closes {j.closeDate}</div>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className={styles.tips}>
        <div className={styles.sectionTitle}>Application tips for your profile</div>
        <div className={styles.tipGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipTitle}>Lead with SFS CyberCorps</div>
            <div className={styles.tipBody}>Federal agencies specifically recruit CyberCorps grads. Mention it prominently on your federal applications — it signals commitment to public service.</div>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipTitle}>Tailor to NIST CSF / RMF</div>
            <div className={styles.tipBody}>Most government compliance roles reference NIST CSF 2.0 or RMF. Mirror the exact framework language from each job posting in your resume bullets.</div>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipTitle}>Help desk → security path</div>
            <div className={styles.tipBody}>Local gov help desk roles often convert to security positions. Treat them as a foot in the door, especially in smaller jurisdictions.</div>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipTitle}>Use the resume scorer</div>
            <div className={styles.tipBody}>For each job you add, use the "Score my resume" feature in the job detail panel. It uses AI to compare your resume against the job description and shows gaps.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
