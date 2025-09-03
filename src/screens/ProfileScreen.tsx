import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarmerContext } from '../context/FarmerContext'

const ProfileScreen: React.FC = () => {
	const navigate = useNavigate()
	const { farmerName, plots } = useFarmerContext()
	return (
		<main className="screen">
			<header className="app-header">
				<button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
				<h1>My Profile</h1>
				<div style={{ width: 40 }} />
			</header>
			<section className="content">
				<div className="card">
					<h2 className="greeting">{farmerName}</h2>
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