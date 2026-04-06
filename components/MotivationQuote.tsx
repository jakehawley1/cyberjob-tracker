'use client'
import { useMemo } from 'react'
import styles from './MotivationQuote.module.css'

const QUOTES = [
  { text: "Security is not a product, but a process — and you're becoming part of that process.", author: "Bruce Schneier (adapted)" },
  { text: "Every application you submit is a step closer. The right role is looking for exactly what you bring.", author: "" },
  { text: "The SFS scholarship exists because the government needs people exactly like you. Keep going.", author: "" },
  { text: "Compliance isn't just paperwork — it's the difference between a breach and a near-miss. Your work matters.", author: "" },
  { text: "Rejection is redirection. Every no gets you closer to the organization that deserves your talent.", author: "" },
  { text: "The best time to apply was yesterday. The second best time is right now.", author: "" },
  { text: "Your master's degree, your certifications, your drive — these are rare. The right hiring manager will see it.", author: "" },
  { text: "Cybersecurity is one of the most important fields in the world right now. You chose well.", author: "" },
  { text: "Follow up. Government hiring moves slow — persistence is professionalism, not pestering.", author: "" },
  { text: "Every security analyst started somewhere. Today you're building the foundation of a long career.", author: "" },
  { text: "The government needs defenders more than ever. You're training to be one.", author: "" },
  { text: "A job search is a numbers game with skill applied. Keep both high.", author: "" },
  { text: "Interview prep is just having the conversation before the conversation. You already know this material.", author: "" },
  { text: "NIST, RMF, GRC — you speak the language. The right team needs someone who does.", author: "" },
  { text: "Graduating into this field during this moment in history is an opportunity. Seize it.", author: "" },
  { text: "Every cover letter you write makes the next one better. You are getting sharper every day.", author: "" },
  { text: "Public service is a calling. The salary is good and the mission is better.", author: "" },
  { text: "The person who gets the job is often not the most qualified — it's the most prepared. Be that person.", author: "" },
  { text: "Apply broadly, tailor specifically. Volume and precision together win.", author: "" },
  { text: "You are not just looking for a job. You are starting a career that will matter.", author: "" },
]

export default function MotivationQuote() {
  // Pick quote based on day of year so it changes daily but stays consistent throughout the day
  const quote = useMemo(() => {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
    return QUOTES[day % QUOTES.length]
  }, [])

  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>✦</div>
      <div className={styles.text}>{quote.text}</div>
      {quote.author && <div className={styles.author}>— {quote.author}</div>}
    </div>
  )
}
