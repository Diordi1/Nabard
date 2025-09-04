import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarmerContext, FarmDetails } from '../context/FarmerContext'

const FarmDetailsScreen: React.FC = () => {
	const navigate = useNavigate()
	const { farmDetails, updateFarmDetails } = useFarmerContext()
	const [formData, setFormData] = useState<FarmDetails>({
		name: farmDetails?.name || '',
		location: farmDetails?.location || '',
		totalAcres: farmDetails?.totalAcres || 0,
		farmingType: farmDetails?.farmingType || 'mixed',
		soilType: farmDetails?.soilType || '',
		cropDetails: farmDetails?.cropDetails || '',
		registeredCoordinates: farmDetails?.registeredCoordinates || ''
	})
	const [errors, setErrors] = useState<Record<string, string>>({})

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.name.trim()) {
			newErrors.name = 'Farm name is required'
		}

		if (!formData.location.trim()) {
			newErrors.location = 'Location is required'
		}

		if (formData.totalAcres <= 0) {
			newErrors.totalAcres = 'Total acres must be greater than 0'
		}

		if (!formData.soilType.trim()) {
			newErrors.soilType = 'Soil type is required'
		}

		if (!formData.cropDetails?.trim()) {
			newErrors.cropDetails = 'Crop details required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (validateForm()) {
			updateFarmDetails(formData)
			navigate('/dashboard')
		}
	}

	const handleInputChange = (field: keyof FarmDetails, value: string | number) => {
		setFormData(prev => ({ ...prev, [field]: value }))
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }))
		}
	}

	return (
		<main className="screen">
			<header className="app-header">
				<button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
				<h1>Farm Details</h1>
				<div style={{ width: 40 }} />
			</header>
			<section className="content">
				<div className="form-intro">
					<h2>Tell us about your farm</h2>
					<p className="muted">This helps us calculate accurate carbon credits and provide better recommendations.</p>
				</div>

				<form onSubmit={handleSubmit} className="auth-form">
					<div className="form-group">
						<label htmlFor="name">Farm Name</label>
						<input
							type="text"
							id="name"
							value={formData.name}
							onChange={(e) => handleInputChange('name', e.target.value)}
							className={`form-input ${errors.name ? 'error' : ''}`}
							placeholder="e.g., Green Valley Farm"
						/>
						{errors.name && <span className="error-text">{errors.name}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="location">Location</label>
						<input
							type="text"
							id="location"
							value={formData.location}
							onChange={(e) => handleInputChange('location', e.target.value)}
							className={`form-input ${errors.location ? 'error' : ''}`}
							placeholder="e.g., Punjab, India"
						/>
						{errors.location && <span className="error-text">{errors.location}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="totalAcres">Total Farm Area (Acres)</label>
						<input
							type="number"
							id="totalAcres"
							value={formData.totalAcres}
							onChange={(e) => handleInputChange('totalAcres', parseFloat(e.target.value) || 0)}
							className={`form-input ${errors.totalAcres ? 'error' : ''}`}
							placeholder="Enter total acres"
							min="0"
							step="0.1"
						/>
						{errors.totalAcres && <span className="error-text">{errors.totalAcres}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="farmingType">Farming Type</label>
						<select
							id="farmingType"
							value={formData.farmingType}
							onChange={(e) => handleInputChange('farmingType', e.target.value as 'organic' | 'conventional' | 'mixed')}
							className="form-input"
						>
							<option value="organic">Organic</option>
							<option value="conventional">Conventional</option>
							<option value="mixed">Mixed</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="soilType">Soil Type</label>
						<input
							type="text"
							id="soilType"
							value={formData.soilType}
							onChange={(e) => handleInputChange('soilType', e.target.value)}
							className={`form-input ${errors.soilType ? 'error' : ''}`}
							placeholder="e.g., Loamy, Clay, Sandy"
						/>
						{errors.soilType && <span className="error-text">{errors.soilType}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="cropDetails">Crop Details</label>
						<textarea
							id="cropDetails"
							value={formData.cropDetails}
							onChange={(e) => handleInputChange('cropDetails', e.target.value)}
							className={`form-input ${errors.cropDetails ? 'error' : ''}`}
							placeholder="List crops grown, rotation schedule, etc."
							rows={3}
						/>
						{errors.cropDetails && <span className="error-text">{errors.cropDetails}</span>}
					</div>

					<div className="form-group">
						<label htmlFor="registeredCoordinates">Farm Coordinates (optional)</label>
						<textarea
							id="registeredCoordinates"
							value={formData.registeredCoordinates}
							onChange={(e) => handleInputChange('registeredCoordinates', e.target.value)}
							className="form-input"
							placeholder="lat,lng; lat,lng; ..."
							rows={2}
						/>
						<p className="muted small">Provide comma separated latitude,longitude pairs if you already know the boundary.</p>
					</div>

					<button type="submit" className="btn btn-primary btn-lg">
						<span className="icon" aria-hidden>💾</span>
						<span>{farmDetails ? 'Update Farm Details' : 'Save Farm Details'}</span>
					</button>
				</form>

				<div className="info-card">
					<h3>💡 Why this matters?</h3>
					<ul className="info-list">
						<li>Organic farming earns more carbon credits</li>
						<li>Soil type affects carbon sequestration potential</li>
						<li>Location helps with regional carbon calculations</li>
						<li>Total area determines your earning potential</li>
					</ul>
				</div>
			</section>
		</main>
	)
}

export default FarmDetailsScreen 