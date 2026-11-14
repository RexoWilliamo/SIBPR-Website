import { ArrowUpRight, Globe2, ShieldCheck } from 'lucide-react'

export function LocalStartPage() {
  return <div className="local-start-page"><div className="local-start-shell">
    <div className="local-start-brand"><img src="/sibpr-logo.jpeg" alt="" width="52" height="52"/><div><strong>SIB PEKAN RANAU</strong><span>LOCAL DEVELOPMENT</span></div></div>
    <div className="local-start-intro"><span className="local-start-kicker">LOCALHOST · 5173</span><h1>Choose where to go</h1><p>Open the public church website or the staff management portal.</p></div>
    <div className="local-start-options"><a href="/" className="local-start-card"><span className="local-start-icon"><Globe2 size={26}/></span><span className="local-start-card-text"><strong>SIBPR Website</strong><span>View the landing page, events, ministries, and Sunday service schedule.</span><small>PUBLIC WEBSITE</small></span><ArrowUpRight className="local-start-arrow" size={22}/></a><a href="/management" className="local-start-card"><span className="local-start-icon"><ShieldCheck size={26}/></span><span className="local-start-card-text"><strong>SIBPR Management</strong><span>Sign in to manage Sunday schedules and staff access.</span><small>ADMIN & STAFF</small></span><ArrowUpRight className="local-start-arrow" size={22}/></a></div>
    <p className="local-start-note">The management portal requires a username and password.</p>
  </div></div>
}
