import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AuthMode = 'login' | 'signup'

const AuthScreen: React.FC = () => {
	const navigate = useNavigate()
	const [mode, setMode] = useState<AuthMode>('login')
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		confirmPassword: ''
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
		} else if (formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters'
		}

		if (mode === 'signup') {
			if (!formData.confirmPassword) {
				newErrors.confirmPassword = 'Please confirm your password'
			} else if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match'
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (validateForm()) {
			alert(`Successfully ${mode === 'login' ? 'logged in' : 'signed up'}! Redirecting to dashboard...`)
			navigate('/dashboard')
		}
	}

	const handleInputChange = (field: string, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	const switchMode = () => {
		setMode(mode === 'login' ? 'signup' : 'login')
		setFormData({ email: '', password: '', confirmPassword: '' })
		setErrors({})
	}

	return (
		<main className="screen">
			<header className="app-header">
				<button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
				<h1>{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
				<div style={{ width: 40 }} />
			</header>
			<section className="content">
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

					{mode === 'signup' && (
						<div className="form-group">
							<label htmlFor="confirmPassword">Confirm Password</label>
							<input
								type="password"
								id="confirmPassword"
								value={formData.confirmPassword}
								onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
								className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
								placeholder="Confirm your password"
							/>
							{errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
						</div>
					)}

					<button type="submit" className="btn btn-primary btn-lg">
						<span className="icon" aria-hidden>{mode === 'login' ? '🔐' : '✅'}</span>
						<span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
					</button>
				</form>

				<div className="auth-switch">
					<p className="muted">
						{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
					</p>
					<button onClick={switchMode} className="btn btn-ghost btn-text">
						{mode === 'login' ? 'Sign Up' : 'Sign In'}
					</button>
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

export default AuthScreen 