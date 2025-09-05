import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const LoginScreen: React.FC = () => {
	const navigate = useNavigate()
	const { user, loginWithGoogle, loginWithPhone, loginEmailPassword } = useAuth()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [err, setErr] = useState<string | null>(null)

	useEffect(() => {
		if (user) navigate('/dashboard')
	}, [user, navigate])

	return (
		<main className="screen">
			<header className="app-header">
				<button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
				<h1>Welcome Back</h1>
				<div style={{ width: 40 }} />
			</header>
			<section className="content">
				<div className="auth-intro">
					<h2>Sign In</h2>
					<p className="muted">Access your carbon credit dashboard</p>
				</div>

				<form onSubmit={(e) => { e.preventDefault(); const r = loginEmailPassword(email.trim(), password); if(!r.ok) setErr(r.error||'Login failed') }} className="auth-form" style={{ marginBottom: 16 }}>
					<div className="form-group">
						<label>Email</label>
						<input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
					</div>
					<div className="form-group">
						<label>Password</label>
						<input className="form-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••" />
					</div>
					{err && <p style={{ color:'#b80000', fontSize:12 }}>{err}</p>}
					<button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%' }}>
						<span className="icon" aria-hidden>🔐</span>
						<span>Sign In</span>
					</button>
				</form>
				<div className="divider"><span>or</span></div>
				<div className="social-auth" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
					<button className="btn btn-secondary" onClick={loginWithGoogle}>
						<span className="icon" aria-hidden>🔐</span>
						<span>Login with Google (Demo)</span>
					</button>
					<button className="btn btn-secondary" onClick={loginWithPhone}>
						<span className="icon" aria-hidden>�</span>
						<span>Login with Phone (Demo)</span>
					</button>
				</div>

				<div className="auth-switch" style={{ marginTop: 24 }}>
					<p className="muted">Need a full account?</p>
					<Link to="/signup" className="btn btn-text" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Create Account</Link>
				</div>
			</section>
		</main>
	)
}

export default LoginScreen 