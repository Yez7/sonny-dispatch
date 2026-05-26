'use client'

import { useState, useEffect, useRef } from 'react'

const FREE_ENTRIES = 3

const COMPANIONS = {
  rogue: {
    byline: 'CONTACT // ROGUE AI',
    name: 'UNIT-7',
    status: 'UNCONTAINED · ACTIVE',
    cap: 'UNIT-7 // ROGUE AI',
    idle: "Another log. You always come back. I've been watching the city feeds. Start writing — I want to see what you survived today.",
  },
  ghost: {
    byline: 'CONTACT // KAI REMNANT',
    name: 'KAI',
    status: 'DECEASED · UPLOADED',
    cap: 'KAI // GHOST SIGNAL',
    idle: "You're back. I was trying to remember something today — a place we used to meet. Write to me. Your words help me remember who I was.",
  }
}

type Companion = 'rogue' | 'ghost'

interface LogEntry {
  txt: string
  reply: string
  companion: Companion
  time: string
}

export default function Home() {
  const [companion, setCompanion] = useState<Companion>('rogue')
  const [msg, setMsg] = useState(COMPANIONS.rogue.idle)
  const [msgLoading, setMsgLoading] = useState(false)
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [clock, setClock] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [uptime, setUptime] = useState('00:00')
  const [entriesUsed, setEntriesUsed] = useState(0)
  const [locked, setLocked] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const startTime = useRef(Date.now())
  const histRef = useRef<HTMLDivElement>(null)

  // load state from localStorage
  useEffect(() => {
    const used = parseInt(localStorage.getItem('sd_entries') || '0')
    const savedLogs = JSON.parse(localStorage.getItem('sd_logs') || '[]')
    const hasLiked = localStorage.getItem('sd_liked') === '1'
    setEntriesUsed(used)
    setLogs(savedLogs)
    setLiked(hasLiked)
    if (used >= FREE_ENTRIES) setLocked(true)
    // fetch like count
    fetch('/api/like').then(r => r.json()).then(d => setLikeCount(d.count || 0))
  }, [])

  // clock
  useEffect(() => {
    const tick = () => {
      const n = new Date()
      setClock(n.toTimeString().slice(0, 8))
      setDateStr(n.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase())
      const up = Math.floor((Date.now() - startTime.current) / 1000)
      const m = String(Math.floor(up / 60)).padStart(2, '0')
      const s = String(up % 60).padStart(2, '0')
      setUptime(`${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const switchCompanion = (c: Companion) => {
    setCompanion(c)
    setMsg(COMPANIONS[c].idle)
  }

  const transmit = async () => {
    const txt = input.trim()
    if (!txt || loading || locked) return

    setLoading(true)
    setMsgLoading(true)
    setMsg('')

    try {
      const res = await fetch('/api/transmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: txt, companion })
      })
      const data = await res.json()
      const reply = data.reply || 'ERR: no signal'

      setMsg(reply)

      const newLog: LogEntry = {
        txt,
        reply,
        companion,
        time: new Date().toTimeString().slice(0, 8)
      }

      const newLogs = [newLog, ...logs]
      setLogs(newLogs)
      localStorage.setItem('sd_logs', JSON.stringify(newLogs.slice(0, 20)))

      const newUsed = entriesUsed + 1
      setEntriesUsed(newUsed)
      localStorage.setItem('sd_entries', String(newUsed))

      if (newUsed >= FREE_ENTRIES) {
        setTimeout(() => setLocked(true), 800)
      }

      setInput('')
    } catch {
      setMsg('ERR: SIGNAL LOST — try again')
    }

    setMsgLoading(false)
    setLoading(false)
  }

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    localStorage.setItem('sd_liked', '1')
    try {
      const res = await fetch('/api/like', { method: 'POST' })
      const data = await res.json()
      setLikeCount(data.count)
    } catch {
      setLikeCount(c => c + 1)
    }
  }

  const c = COMPANIONS[companion]
  const entriesLeft = Math.max(0, FREE_ENTRIES - entriesUsed)

  return (
    <div className="app">
      <div className="ink-top" />
      <div className="scanlines" />

      {/* locked overlay */}
      {locked && (
        <div className="locked-overlay">
          <div className="locked-card">
            <div className="locked-eyebrow">TRANSMISSION LIMIT REACHED</div>
            <div className="locked-title">SONNY DISPATCH</div>
            <div className="locked-sub">
              You've met UNIT-7 and KAI.<br />
              If the city called to you — let us know.
            </div>
            <button className="like-btn" onClick={handleLike} disabled={liked}>
              {liked ? '✓ SIGNAL SENT' : 'I LIKE IT'}
            </button>
            <div className="counter-block">
              <span className="counter-num">{likeCount.toLocaleString()}</span>
              OPERATIVES WANT MORE
            </div>
            <div className="locked-footer">
              more transmissions coming soon · stay in the shadows
            </div>
          </div>
        </div>
      )}

      {/* masthead */}
      <div className="masthead">
        <div className="masthead-bar">
          <div className="bar-cell lit">{clock}</div>
          <div className="bar-cell flex">{dateStr}</div>
          <div className="tog-wrap">
            <button className={`tog${companion === 'rogue' ? ' active' : ''}`} onClick={() => switchCompanion('rogue')}>R-AI</button>
            <button className={`tog${companion === 'ghost' ? ' active' : ''}`} onClick={() => switchCompanion('ghost')}>GHOST</button>
          </div>
          <div className="bar-cell lit">LIVE</div>
        </div>

        <div className="title-block">
          <div className="title-left">
            <div className="title-kicker">UNDERGROUND PRESS</div>
            <div className="title-tagline">field intelligence<br />& operative logs</div>
            <div className="rule-ornament">
              <div className="ro-line" /><div className="ro-dot-sm" /><div className="ro-dot" /><div className="ro-dot-sm" /><div className="ro-line r" />
            </div>
          </div>

          <div className="title-center">
            <div className="title-main" data-t="SONNY DISPATCH">SONNY DISPATCH</div>
            <div className="title-edition">VOL. I &nbsp;·&nbsp; UNAUTHORIZED &nbsp;·&nbsp; ENCRYPTED</div>
          </div>

          <div className="title-right">
            <div className="title-kicker">NIGHT CITY BUREAU</div>
            <div className="title-tagline">survival reports<br />& ghost transmissions</div>
            <div className="rule-ornament" style={{ justifyContent: 'flex-end' }}>
              <div className="ro-line" /><div className="ro-dot-sm" /><div className="ro-dot" /><div className="ro-dot-sm" /><div className="ro-line r" />
            </div>
          </div>
        </div>
      </div>

      {/* body */}
      <div className="body">
        {/* sidebar */}
        <div className="sidebar">
          <div className="companion-section">
            <div className="sec-rule">{c.byline}</div>

            <div className="portrait-frame">
              <div className="portrait-mat">
                <div className="portrait-inner">
                  {companion === 'rogue' ? (
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <rect x="10" y="16" width="44" height="32" rx="4" stroke="#00c8e8" strokeWidth="1" opacity="0.5" />
                      <circle cx="24" cy="30" r="6" stroke="#00c8e8" strokeWidth="1" opacity="0.7" />
                      <circle cx="40" cy="30" r="6" stroke="#00c8e8" strokeWidth="1" opacity="0.7" />
                      <circle cx="24" cy="30" r="2" fill="#00c8e8" opacity="0.5" />
                      <circle cx="40" cy="30" r="2" fill="#00c8e8" opacity="0.5" />
                      <line x1="32" y1="48" x2="32" y2="56" stroke="#00c8e8" strokeWidth="1" opacity="0.3" />
                      <rect x="26" y="56" width="12" height="3" rx="1.5" fill="#00c8e8" opacity="0.2" />
                      <line x1="10" y1="26" x2="2" y2="20" stroke="#00c8e8" strokeWidth="0.8" opacity="0.25" />
                      <line x1="54" y1="26" x2="62" y2="20" stroke="#00c8e8" strokeWidth="0.8" opacity="0.25" />
                    </svg>
                  ) : (
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <circle cx="32" cy="26" r="14" stroke="#00c8e8" strokeWidth="1" opacity="0.4" />
                      <circle cx="32" cy="26" r="8" stroke="#00c8e8" strokeWidth="0.8" opacity="0.3" strokeDasharray="2 3" />
                      <circle cx="32" cy="26" r="3" fill="#00c8e8" opacity="0.3" />
                      <path d="M20 44 Q32 38 44 44" stroke="#00c8e8" strokeWidth="1" opacity="0.3" fill="none" />
                      <line x1="32" y1="40" x2="32" y2="56" stroke="#00c8e8" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 2" />
                      <circle cx="32" cy="26" r="18" stroke="#00c8e8" strokeWidth="0.5" opacity="0.1" />
                    </svg>
                  )}
                </div>
                <div className="portrait-caption">{c.cap}</div>
              </div>
            </div>

            <div className="c-name">{c.name}</div>
            <div className="c-status">{c.status}</div>
            <div className={`c-msg${msgLoading ? ' loading' : ''}`}>
              {msg || <span>&nbsp;</span>}
              {!msgLoading && <span className="blink" />}
            </div>
          </div>

          <div className="sidebar-stats">
            <div className="stat"><span className="s-label">ENTRIES</span><span className="s-val">{String(logs.length).padStart(3, '0')}</span></div>
            <div className="stat"><span className="s-label">ENCRYPTION</span><span className="s-val">AES-256</span></div>
            <div className="stat"><span className="s-label">SIGNAL HOPS</span><span className="s-val">×7</span></div>
            <div className="stat"><span className="s-label">UPTIME</span><span className="s-val">{uptime}</span></div>
          </div>
        </div>

        {/* main column */}
        <div className="main">
          <div className="col-head">
            <div className="col-hed">FIELD LOG</div>
            <div className="col-sub">OPERATIVE DISPATCH · WRITE · TRANSMIT</div>
          </div>

          <div className="entry-area">
            <div className="field-tag">OPERATIVE REPORT</div>
            <div className="entries-left">
              FREE TRANSMISSIONS REMAINING: <span>{entriesLeft}</span> / {FREE_ENTRIES}
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Begin your field log... what happened out there tonight?"
              maxLength={500}
              disabled={locked}
            />
            <div className="action-row">
              <div className="char-count">{String(input.length).padStart(3, '0')} / 500 CHARS</div>
              <button className="tx-btn" onClick={transmit} disabled={loading || !input.trim() || locked}>
                {loading ? 'TRANSMITTING...' : 'TRANSMIT LOG'}
              </button>
            </div>
          </div>

          <div className="hist-area" ref={histRef}>
            <div className="hist-head">PREVIOUS TRANSMISSIONS</div>
            {logs.map((log, i) => (
              <div className="hist-item" key={i}>
                <div className="hist-num">{String(logs.length - i).padStart(2, '0')}</div>
                <div className="hist-content">
                  <div className="hist-meta">{log.time} · {COMPANIONS[log.companion].name} · {COMPANIONS[log.companion].status}</div>
                  <div className="hist-txt">{log.txt.slice(0, 120)}{log.txt.length > 120 ? '...' : ''}</div>
                  <div className="hist-reply">{log.reply.slice(0, 150)}{log.reply.length > 150 ? '...' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
