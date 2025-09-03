import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const LoginScreen: React.FC = () => {
	const navigate = useNavigate()
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.email) {
			newErrors.email = 'Email is required'
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email'
		}

		if (!formData.password) {
			newErrors.password = 'Password is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (validateForm()) {
			alert('Successfully logged in! Redirecting to dashboard...')
			navigate('/dashboard')
		}
	}

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

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

				<form onSubmit={handleSubmit} className="auth-form">
					<div className="form-group">
						<label htmlFor="email">Email Address</label>
						<input
							type="email"
							id="email"
							value={formData.email}
							onChange={(e) => handleInputChange('email', e.target.value)}
							className={`form-input ${errors.email ? 'error' : ''}`}
							placeholder="Enter your email"
						/>
						{errors.email && <span className="error-text">{errors.email}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							value={formData.password}
							onChange={(e) => handleInputChange('password', e.target.value)}
							className={`form-input ${errors.password ? 'error' : ''}`}
							placeholder="Enter your password"
						/>
						{errors.password && <span className="error-text">{errors.password}</span>}
					</div>

					<button type="submit" className="btn btn-primary btn-lg">
						<span className="icon" aria-hidden>🔐</span>
						<span>Sign In</span>
					</button>
				</form>

				<div className="auth-switch">
					<p className="muted">Don't have an account?</p>
					<Link to="/signup" className="btn btn-ghost btn-text">
						Create Account
					</Link>
				</div>

				<div className="divider">
					<span>or</span>
				</div>

				<div className="social-auth">
					<button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
						<span className="icon" aria-hidden>🔐</span>
						<span>Continue with Google</span>
					</button>
					<button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
						<span className="icon" aria-hidden>📱</span>
						<span>Continue with Phone</span>
					</button>
				</div>
			</section>
		</main>
	)
}

export default LoginScreen 