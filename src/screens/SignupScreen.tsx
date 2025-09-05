import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SignupScreen: React.FC = () => {
	const navigate = useNavigate()
	const { signupLocal, user, loginWithGoogle } = useAuth()
	const [formData, setFormData] = useState({
		name: '',
		mobile: '',
		email: '',
		password: '',
		confirmPassword: ''
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required'
		}

		if (!formData.mobile.trim()) {
			newErrors.mobile = 'Mobile number is required'
		} else if (!/^[0-9]{10}$/.test(formData.mobile)) {
			newErrors.mobile = 'Enter 10 digit mobile number'
		}

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
			signupLocal({ name: formData.name, mobile: formData.mobile, email: formData.email, password: formData.password })
			alert('Account created! Redirecting to dashboard...')
			navigate('/dashboard')
		}
	}

	// Redirect if a user is already authenticated (covers demo View and existing sessions)
	useEffect(() => {
		if (user) {
			try { navigate('/dashboard', { replace: true }) } catch {}
		}
	}, [user, navigate])

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
						<label htmlFor="name">Full Name</label>
						<input
							type="text"
							id="name"
							value={formData.name}
							onChange={(e) => handleInputChange('name', e.target.value)}
							className={`form-input ${errors.name ? 'error' : ''}`}
							placeholder="Enter your full name"
						/>
						{errors.name && <span className="error-text">{errors.name}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="mobile">Mobile Number</label>
						<input
							type="tel"
							id="mobile"
							value={formData.mobile}
							onChange={(e) => handleInputChange('mobile', e.target.value)}
							className={`form-input ${errors.mobile ? 'error' : ''}`}
							placeholder="10 digit mobile"
							maxLength={10}
						/>
						{errors.mobile && <span className="error-text">{errors.mobile}</span>}
					</div>
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

				<div className="auth-switch" style={{ display:'flex', flexDirection:'column', gap:8 }}>
					<p className="muted" style={{ marginBottom:4 }}>Already have an account?</p>
					<button type="button" className="btn btn-text" onClick={() => navigate('/login')}>
						Sign In
					</button>
					<div style={{ height:1, background:'#eee', width:'100%', margin:'4px 0' }} />
					<button type="button" className="btn btn-secondary" onClick={() => { loginWithGoogle(); navigate('/dashboard') }}>
						<span className="icon" aria-hidden>👁️</span>
						<span>View Demo</span>
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