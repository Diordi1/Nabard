import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFarmerContext } from '../context/FarmerContext'

const DashboardScreen: React.FC = () => {
	const navigate = useNavigate()
	const { 
		farmerName, 
		plots, 
		farmDetails, 
		achievements, 
		notifications, 
		totalCarbonCredits,
		markNotificationRead 
	} = useFarmerContext()
	
	const [showNotifications, setShowNotifications] = useState(false)

	const unreadNotifications = notifications.filter(n => !n.read)
	const totalArea = plots.reduce((total, plot) => total + plot.area, 0)

	return (
		<main className="screen">
			<header className="app-header">
				<h1>Dashboard</h1>
				<div className="header-actions">
					<button 
						className="btn btn-ghost notification-btn"
						onClick={() => setShowNotifications(!showNotifications)}
						aria-label="Notifications"
					>
						<span className="icon" aria-hidden>🔔</span>
						{unreadNotifications.length > 0 && (
							<span className="notification-badge">{unreadNotifications.length}</span>
						)}
					</button>
					<Link to="/login" className="btn btn-ghost">
						<span className="icon" aria-hidden>👤</span>
					</Link>
				</div>
			</header>

			{showNotifications && (
				<div className="notifications-panel">
					<div className="notifications-header">
						<h3>Notifications</h3>
						<button 
							className="btn btn-ghost btn-text"
							onClick={() => setShowNotifications(false)}
						>
							Close
						</button>
					</div>
					{notifications.length === 0 ? (
						<p className="muted">No notifications yet</p>
					) : (
						<div className="notifications-list">
							{notifications.slice(0, 5).map((notification) => (
								<div 
									key={notification.id} 
									className={`notification-item ${notification.read ? 'read' : 'unread'}`}
									onClick={() => markNotificationRead(notification.id)}
								>
									<span className="icon" aria-hidden>
										{notification.type === 'success' ? '✅' : 
										 notification.type === 'warning' ? '⚠️' : 'ℹ️'}
									</span>
									<div className="notification-content">
										<p>{notification.message}</p>
										<span className="notification-time">
											{notification.createdAt.toLocaleTimeString()}
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			<section className="content">
				<div className="welcome-card">
					<h2 className="greeting">Hello, {farmerName.split(' ')[0]}!</h2>
					<p className="muted">Welcome back to your carbon credit dashboard</p>
					{farmDetails && (
						<div className="farm-info">
							<span className="icon" aria-hidden>🏡</span>
							<span>{farmDetails.name} • {farmDetails.location}</span>
						</div>
					)}
				</div>

				<div className="quick-stats">
					<div className="stat-item">
						<span className="stat-number">{plots.length}</span>
						<span className="stat-label">Plots Mapped</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">{totalArea.toFixed(1)}</span>
						<span className="stat-label">Total Acres</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">{totalCarbonCredits}</span>
						<span className="stat-label">Carbon Credits</span>
					</div>
					<div className="stat-item">
						<span className="stat-number">{achievements.length}</span>
						<span className="stat-label">Achievements</span>
					</div>
				</div>

				<div className="action-buttons">
					<Link to="/map" className="btn btn-primary btn-lg">
						<span className="icon" aria-hidden>📍</span>
						<span>Map New Plot</span>
					</Link>
					<div className="secondary-actions">
						<Link to="/profile" className="btn btn-secondary">
							<span className="icon" aria-hidden>👤</span>
							<span>My Profile</span>
						</Link>
						<Link to="/achievements" className="btn btn-secondary">
							<span className="icon" aria-hidden>🏆</span>
							<span>Achievements</span>
						</Link>
					</div>
				</div>

				{!farmDetails && (
					<div className="setup-card">
						<h3>🚀 Get Started</h3>
						<p className="muted">Complete your farm profile to get better carbon credit calculations</p>
						<Link to="/farm-details" className="btn btn-primary">
							<span className="icon" aria-hidden>📝</span>
							<span>Add Farm Details</span>
						</Link>
					</div>
				)}

				{plots.length > 0 && (
					<div className="recent-plots">
						<div className="section-header">
							<h3>Recent Plots</h3>
							<Link to="/profile" className="btn btn-ghost btn-text">View All</Link>
						</div>
						<div className="plot-list">
							{plots.slice(0, 3).map((plot, idx) => (
								<div key={plot.id} className="plot-item">
									<span className="icon" aria-hidden>🗺️</span>
									<div className="plot-details">
										<h4>{plot.name}</h4>
										<p className="muted">
											{plot.area.toFixed(2)} acres • {plot.points.length} points
										</p>
										<p className="carbon-credits">
											<span className="icon" aria-hidden>💰</span>
											{plot.carbonCredits} carbon credits
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{achievements.length > 0 && (
					<div className="recent-achievements">
						<div className="section-header">
							<h3>Recent Achievements</h3>
							<Link to="/achievements" className="btn btn-ghost btn-text">View All</Link>
						</div>
						<div className="achievements-preview">
							{achievements.slice(0, 2).map((achievement) => (
								<div key={achievement.id} className="achievement-preview">
									<span className="icon" aria-hidden>{achievement.icon}</span>
									<div>
										<h4>{achievement.title}</h4>
										<p className="muted">{achievement.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</section>
		</main>
	)
}

export default DashboardScreen 