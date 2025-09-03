import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LatLngPoint, useFarmerContext } from '../context/FarmerContext'

const PlotMappingScreen: React.FC = () => {
	const navigate = useNavigate()
	const { addPlot, calculatePlotArea } = useFarmerContext()
	const [isRecording, setIsRecording] = useState(false)
	const [points, setPoints] = useState<LatLngPoint[]>([])
	const [plotName, setPlotName] = useState('')
	const [showSaveForm, setShowSaveForm] = useState(false)
	const watchIdRef = useRef<number | null>(null)

	const startRecording = useCallback(() => {
		if (!('geolocation' in navigator)) {
			alert('Geolocation is not supported on this device.')
			return
		}
		try {
			const id = navigator.geolocation.watchPosition(
				pos => {
					const { latitude, longitude } = pos.coords
					setPoints(prev => [...prev, { lat: latitude, lng: longitude }])
				},
				error => {
					console.error('Geolocation error:', error)
					if (error.code === error.PERMISSION_DENIED) {
						alert('Location permission denied. Please enable it to map your plot.')
					} else {
						alert('Unable to fetch location. Please try again.')
					}
				},
				{
					enableHighAccuracy: true,
					maximumAge: 0,
					timeout: 10000,
				}
			)
			watchIdRef.current = id
			setIsRecording(true)
		} catch (e) {
			console.error(e)
			alert('Failed to start location tracking.')
		}
	}, [])

	const stopRecording = useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current)
			watchIdRef.current = null
		}
		setIsRecording(false)
		if (points.length > 0) {
			setShowSaveForm(true)
		}
	}, [points])

	const handleSavePlot = () => {
		if (!plotName.trim()) {
			alert('Please enter a plot name')
			return
		}
		
		const area = calculatePlotArea(points)
		addPlot(points, plotName.trim(), area)
		setPoints([])
		setPlotName('')
		setShowSaveForm(false)
		navigate('/dashboard')
	}

	useEffect(() => {
		return () => {
			if (watchIdRef.current !== null) {
				navigator.geolocation.clearWatch(watchIdRef.current)
			}
		}
	}, [])

	if (showSaveForm) {
		return (
			<main className="screen">
				<header className="app-header">
					<button className="btn btn-ghost" onClick={() => setShowSaveForm(false)} aria-label="Go back">←</button>
					<h1>Save Your Plot</h1>
					<div style={{ width: 40 }} />
				</header>
				<section className="content">
					<div className="save-form">
						<h2>Plot Details</h2>
						<p className="muted">Your plot has {points.length} GPS points</p>
						
						<div className="form-group">
							<label htmlFor="plotName">Plot Name</label>
							<input
								type="text"
								id="plotName"
								value={plotName}
								onChange={(e) => setPlotName(e.target.value)}
								className="form-input"
								placeholder="e.g., Wheat Field, Vegetable Garden"
							/>
						</div>

						<div className="plot-summary">
							<div className="summary-item">
								<span className="icon">📍</span>
								<span>{points.length} GPS points</span>
							</div>
							<div className="summary-item">
								<span className="icon">📏</span>
								<span>~{calculatePlotArea(points).toFixed(2)} acres</span>
							</div>
							<div className="summary-item">
								<span className="icon">💰</span>
								<span>~{Math.floor(calculatePlotArea(points) * 0.5)} carbon credits</span>
							</div>
						</div>

						<button onClick={handleSavePlot} className="btn btn-primary btn-lg">
							<span className="icon" aria-hidden>💾</span>
							<span>Save Plot</span>
						</button>
					</div>
				</section>
			</main>
		)
	}

	return (
		<main className="screen">
			<header className="app-header">
				<button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
				<h1>Map Your Plot</h1>
				<div style={{ width: 40 }} />
			</header>
			<section className="content">
				<div className="card status">
					<p className="status-text">
						{isRecording ? 'Recording your path…' : 'Press start and walk your field perimeter.'}
					</p>
					<p className="muted">Points captured: {points.length}</p>
					{points.length > 0 && (
						<p className="muted">Estimated area: ~{calculatePlotArea(points).toFixed(2)} acres</p>
					)}
				</div>

				<button
					className={`btn btn-primary btn-lg ${isRecording ? 'btn-danger' : ''}`}
					onClick={isRecording ? stopRecording : startRecording}
				>
					<span className="icon" aria-hidden>{isRecording ? '⏹️' : '▶️'}</span>
					<span>{isRecording ? 'Stop Mapping' : 'Start Mapping'}</span>
				</button>

				{points.length > 0 && (
					<div className="mapping-tips">
						<h3>💡 Mapping Tips</h3>
						<ul className="tips-list">
							<li>Walk slowly around the perimeter</li>
							<li>Make sure to close the shape</li>
							<li>More points = more accurate area</li>
							<li>Stay within your property boundaries</li>
						</ul>
					</div>
				)}
			</section>
		</main>
	)
}

export default PlotMappingScreen 