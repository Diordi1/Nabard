import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarmerContext } from '../context/FarmerContext'
import { useAuth } from '../context/AuthContext'

const ProfileScreen: React.FC = () => {
	const navigate = useNavigate()
	const { farmerName, farmerId, mobileNumber, farmDetails, plots, totalCarbonCredits, creditsSpent } = useFarmerContext()
	const { user, logout } = useAuth()
	return (
		<main className="screen">
			<header className="app-header">
				<button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
				<h1>My Profile</h1>
				<div style={{ width: 40 }} />
			</header>
			<section className="content">
				<div className="card">
					<h2 className="greeting">{user?.name || farmerName}</h2>
					<p className="muted">Farmer ID: <strong>{localStorage.getItem("farmerId")}</strong></p>
					<p className="muted">Mobile: {user?.mobile || mobileNumber || '—'}</p>
					{user?.email && <p className="muted">Email: {user.email}</p>}
					<p className="muted">Provider: {user?.provider || 'local-context'}</p>
					<button className="btn btn-ghost btn-text" onClick={logout}>Logout</button>
					{farmDetails && (
						<div className="profile-farm-details">
							<p><strong>Farm:</strong> {farmDetails.name}</p>
							<p><strong>Location:</strong> {farmDetails.location}</p>
							<p><strong>Area:</strong> {farmDetails.totalAcres} acres</p>
							<p><strong>Type:</strong> {farmDetails.farmingType}</p>
							<p><strong>Soil:</strong> {farmDetails.soilType}</p>
							{farmDetails.cropDetails && <p><strong>Crops:</strong> {farmDetails.cropDetails}</p>}
						</div>
					)}
					<div className="profile-stats-inline">
						<span>Credits Available: {totalCarbonCredits}</span>
						<span>Credits Spent: {creditsSpent}</span>
					</div>
					<p className="muted">Your mapped plots</p>
				</div>
				<ul className="list">
					{plots.length === 0 && <li className="muted">No plots yet. Map your first plot!</li>}
					{plots.map((plot, idx) => (
						<li key={plot.id} className="list-item">
							<span className="icon" aria-hidden>🗺️</span>
							<span>Plot #{plots.length - idx} - {plot.points.length} points</span>
						</li>
					))}
				</ul>
			</section>
		</main>
	)
}

export default ProfileScreen 