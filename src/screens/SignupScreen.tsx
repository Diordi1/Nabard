import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const SignupScreen: React.FC = () => {
	const navigate = useNavigate()
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

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = 'Please confirm your password'
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (validateForm()) {
			alert('Account created successfully! Redirecting to dashboard...')
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
				<h1>Join Farmer Credit</h1>
				<div style={{ width: 40 }} />
			</header>
			<section className="content">
				<div className="auth-intro">
					<h2>Create Account</h2>
					<p className="muted">Start earning carbon credits for your sustainable farming</p>
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
							placeholder="Create a password (min 6 characters)"
						/>
						{errors.password && <span className="error-text">{errors.password}</span>}
					</div>

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

					<button type="submit" className="btn btn-primary btn-lg">
						<span className="icon" aria-hidden>✅</span>
						<span>Create Account</span>
					</button>
				</form>

				<div className="auth-switch">
					<p className="muted">Already have an account?</p>
					<Link to="/login" className="btn btn-ghost btn-text">
						Sign In
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

				<div className="signup-benefits">
					<h3>Why join Farmer Credit?</h3>
					<div className="benefits-list">
						<div className="benefit-item">
							<span className="icon" aria-hidden>🌱</span>
							<span>Map your farm plots easily</span>
						</div>
						<div className="benefit-item">
							<span className="icon" aria-hidden>💰</span>
							<span>Earn carbon credits</span>
						</div>
						<div className="benefit-item">
							<span className="icon" aria-hidden>📊</span>
							<span>Track your impact</span>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

export default SignupScreen 