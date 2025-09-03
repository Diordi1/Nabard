import React from 'react'
import { Link } from 'react-router-dom'

const HomeScreen: React.FC = () => {
	return (
		<main className="screen">
			<header className="app-header">
				<h1>Farmer Credit</h1>
			</header>
			<section className="content">
				<div className="hero">
					<h2 className="hero-title">Carbon Credits for Farmers</h2>
					<p className="hero-subtitle">
						Map your farm plots and earn carbon credits for sustainable farming practices.
					</p>
				</div>
				
				<div className="auth-actions">
					<Link to="/signup" className="btn btn-primary btn-lg">
						<span className="icon" aria-hidden>✅</span>
						<span>Get Started</span>
					</Link>
					<p className="muted">Already have an account?</p>
					<Link to="/login" className="btn btn-secondary">
						<span className="icon" aria-hidden>🔐</span>
						<span>Sign In</span>
					</Link>
				</div>

				<div className="features">
					<h3>How it works</h3>
					<div className="feature-list">
						<div className="feature-item">
							<span className="icon" aria-hidden>📍</span>
							<div>
								<h4>Map Your Plot</h4>
								<p>Walk around your farm boundary to record GPS coordinates</p>
							</div>
						</div>
						<div className="feature-item">
							<span className="icon" aria-hidden>🌱</span>
							<div>
								<h4>Track Practices</h4>
								<p>Monitor your sustainable farming activities</p>
							</div>
						</div>
						<div className="feature-item">
							<span className="icon" aria-hidden>💰</span>
							<div>
								<h4>Earn Credits</h4>
								<p>Get rewarded for your environmental contributions</p>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}

export default HomeScreen 