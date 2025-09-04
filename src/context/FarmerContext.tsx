import React, { createContext, useContext, useMemo, useState } from 'react'

export type LatLngPoint = { lat: number; lng: number }
export type Plot = { 
	id: string; 
	points: LatLngPoint[];
	name: string;
	area: number; // in acres
	createdAt: Date;
	carbonCredits: number;
}

export type FarmDetails = {
	name: string;
	location: string;
	totalAcres: number;
	farmingType: 'organic' | 'conventional' | 'mixed';
	soilType: string;
}

export type Achievement = {
	id: string;
	title: string;
	description: string;
	icon: string;
	unlockedAt: Date;
	points: number;
}

export type Notification = {
	id: string;
	message: string;
	type: 'success' | 'info' | 'warning';
	read: boolean;
	createdAt: Date;
}

type FarmerContextShape = {
	farmerId: string
	farmerName: string
	plots: Plot[]
	farmDetails: FarmDetails | null
	achievements: Achievement[]
	notifications: Notification[]
	totalCarbonCredits: number
	addPlot: (newPlotPoints: LatLngPoint[], plotName: string, area: number) => void
	updateFarmDetails: (details: FarmDetails) => void
	addNotification: (message: string, type: 'success' | 'info' | 'warning') => void
	markNotificationRead: (id: string) => void
	calculatePlotArea: (points: LatLngPoint[]) => number
	requestVisitVerification: () => Promise<{ ok: boolean; error?: string }>
}

const FarmerContext = createContext<FarmerContextShape | undefined>(undefined)

export const useFarmerContext = (): FarmerContextShape => {
	const ctx = useContext(FarmerContext)
	if (!ctx) {
		throw new Error('useFarmerContext must be used within FarmerProvider')
	}
	return ctx
}

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [plots, setPlots] = useState<Plot[]>([])
	const [farmDetails, setFarmDetails] = useState<FarmDetails | null>(null)
	const [achievements, setAchievements] = useState<Achievement[]>([])
	const [notifications, setNotifications] = useState<Notification[]>([])

	// Generate / persist a unique Farmer ID (stable across reloads in this browser)
	const [farmerId] = useState<string>(() => {
		try {
			const existing = localStorage.getItem('farmerId')
			if (existing) return existing
			const newId = generateFarmerId()
			localStorage.setItem('farmerId', newId)
			return newId
		} catch {
			// Fallback (no localStorage available)
			return generateFarmerId()
		}
	})

	function generateFarmerId(): string {
		// Format: FRM-YYYYMMDD-<5 char base36>
		const d = new Date()
		const datePart = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('')
		const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
		return `FRM-${datePart}-${rand}`
	}

	const calculatePlotArea = (points: LatLngPoint[]): number => {
		// Simple approximation using shoelace formula for demo
		if (points.length < 3) return 0
		
		let area = 0
		for (let i = 0; i < points.length; i++) {
			const j = (i + 1) % points.length
			area += points[i].lat * points[j].lng
			area -= points[j].lat * points[i].lng
		}
		return Math.abs(area) / 2 * 0.0001 // Rough conversion to acres
	}

	const addPlot = (newPlotPoints: LatLngPoint[], plotName: string, area: number) => {
		if (!newPlotPoints || newPlotPoints.length === 0) return
		
		const newPlot: Plot = {
			id: `${Date.now()}`,
			points: newPlotPoints,
			name: plotName,
			area: area,
			createdAt: new Date(),
			carbonCredits: Math.floor(area * 0.5) // Simple calculation: 0.5 credits per acre
		}
		
		setPlots(prev => [newPlot, ...prev])
		
		// Check for achievements
		checkAchievements([newPlot, ...plots])
		
		// Add success notification
		addNotification(`Plot "${plotName}" mapped successfully! Earned ${newPlot.carbonCredits} carbon credits.`, 'success')
	}

	const updateFarmDetails = (details: FarmDetails) => {
		setFarmDetails(details)
		addNotification('Farm details updated successfully!', 'success')
	}

	const addNotification = (message: string, type: 'success' | 'info' | 'warning') => {
		const notification: Notification = {
			id: `${Date.now()}`,
			message,
			type,
			read: false,
			createdAt: new Date()
		}
		setNotifications(prev => [notification, ...prev])
	}

	const markNotificationRead = (id: string) => {
		setNotifications(prev => 
			prev.map(n => n.id === id ? { ...n, read: true } : n)
		)
	}

	const checkAchievements = (currentPlots: Plot[]) => {
		const newAchievements: Achievement[] = []
		
		// First plot achievement
		if (currentPlots.length === 1 && achievements.every(a => a.id !== 'first-plot')) {
			newAchievements.push({
				id: 'first-plot',
				title: 'First Steps',
				description: 'Mapped your first farm plot',
				icon: '🌱',
				unlockedAt: new Date(),
				points: 10
			})
		}
		
		// Multiple plots achievement
		if (currentPlots.length >= 3 && achievements.every(a => a.id !== 'multiple-plots')) {
			newAchievements.push({
				id: 'multiple-plots',
				title: 'Plot Master',
				description: 'Mapped 3 or more farm plots',
				icon: '🏆',
				unlockedAt: new Date(),
				points: 25
			})
		}
		
		// Large area achievement
		const totalArea = currentPlots.reduce((sum, plot) => sum + plot.area, 0)
		if (totalArea >= 10 && achievements.every(a => a.id !== 'large-farm')) {
			newAchievements.push({
				id: 'large-farm',
				title: 'Land Baron',
				description: 'Total mapped area exceeds 10 acres',
				icon: '🌍',
				unlockedAt: new Date(),
				points: 50
			})
		}
		
		if (newAchievements.length > 0) {
			setAchievements(prev => [...prev, ...newAchievements])
			newAchievements.forEach(achievement => {
				addNotification(`Achievement unlocked: ${achievement.title}!`, 'success')
			})
		}
	}

	const totalCarbonCredits = useMemo(() => 
		plots.reduce((total, plot) => total + plot.carbonCredits, 0), 
		[plots]
	)

	// Send farmer + farm data to external verification API
	const requestVisitVerification = async (): Promise<{ ok: boolean; error?: string }> => {
		try {
			const totalArea = plots.reduce((sum, p) => sum + p.area, 0)
			const payload = {
				farmerId,
				farmerName: 'Rahul Kumar',
				farmDetails, // may be null
				totalArea,
				totalCarbonCredits,
				plots: plots.map(p => ({
					id: p.id,
					name: p.name,
					area: p.area,
					points: p.points,
					carbonCredits: p.carbonCredits
				})),
				requestedAt: new Date().toISOString()
			}
			const resp = await fetch('https://nabard-visitor-backend.onrender.com/api/visit-request', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			if (!resp.ok) {
				let errorText: string
				try { errorText = await resp.text() } catch { errorText = 'Unknown error' }
				addNotification('Verification request failed', 'warning')
				return { ok: false, error: errorText }
			}
			addNotification('Verification request sent successfully!', 'success')
			return { ok: true }
		} catch (e) {
			addNotification('Network error sending verification request', 'warning')
			return { ok: false, error: (e as Error).message }
		}
	}

	const value = useMemo(
		() => ({ 
			farmerId,
			farmerName: 'Rahul Kumar', 
			plots, 
			farmDetails,
			achievements,
			notifications,
			totalCarbonCredits,
			addPlot, 
			updateFarmDetails,
			addNotification,
			markNotificationRead,
			calculatePlotArea,
			requestVisitVerification
		}),
		[farmerId, plots, farmDetails, achievements, notifications, totalCarbonCredits]
	)

	return <FarmerContext.Provider value={value}>{children}</FarmerContext.Provider>
} 