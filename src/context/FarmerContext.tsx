import React, { createContext, useContext, useMemo, useState } from 'react'
// API base (allow override via Vite env var at build time)
const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'https://nabard-visitor-backend.onrender.com'

// Basic geo point type
export type LatLngPoint = { lat: number; lng: number }

// Plot (kept for potential future mapping features / area based credits)
export type Plot = { 
	id: string; 
	points: LatLngPoint[];
	name: string;
	area: number; // acres (approx)
	createdAt: Date;
	carbonCredits: number;
}

// Farmer's farm meta details
export type FarmDetails = {
	name: string;
	location: string;
	totalAcres: number; // farm area in acres
	farmingType: 'organic' | 'conventional' | 'mixed';
	soilType: string;
	cropDetails?: string;
	registeredCoordinates?: string; // optional manual string (e.g. "lat,lng;lat,lng")
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

export type VisitRequest = {
	id: string;
	farmerId: string;
	farmerName: string;
	village: string;
	locationDetails: string;
	preferredDate: string; // YYYY-MM-DD
	status: 'pending' | 'completed' | 'failed';
	createdAt: Date;
	updatedAt: Date;
	responseMessage?: string;
}

// Context shape used across screens
type FarmerContextShape = {
	farmerId: string
	farmerName: string
	mobileNumber: string | null
	plots: Plot[]
	farmDetails: FarmDetails | null
	achievements: Achievement[]
	notifications: Notification[]
	totalCarbonCredits: number
	creditsSpent: number
	visitRequests: VisitRequest[]
	addPlot: (newPlotPoints: LatLngPoint[], plotName: string, area: number) => void
	updateFarmDetails: (details: FarmDetails) => void
	updateFarmerProfile: (data: { name?: string; mobileNumber?: string }) => void
	addNotification: (message: string, type: 'success' | 'info' | 'warning') => void
	markNotificationRead: (id: string) => void
	calculatePlotArea: (points: LatLngPoint[]) => number
	requestVisitVerification: (data: { village: string; locationDetails: string; preferredDate: string }) => Promise<{ ok: boolean; error?: string }>
	markVisitRequestCompleted: (id: string) => void
	purchaseItem: (itemName: string, cost: number, payWithCredits: boolean) => { ok: boolean; error?: string }
}

const FarmerContext = createContext<FarmerContextShape | undefined>(undefined)

export const useFarmerContext = (): FarmerContextShape => {
	const ctx = useContext(FarmerContext)
	if (!ctx) throw new Error('useFarmerContext must be used within FarmerProvider')
	return ctx
}

export const FarmerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [plots, setPlots] = useState<Plot[]>([])
	const [farmDetails, setFarmDetails] = useState<FarmDetails | null>(null)
	const [achievements, setAchievements] = useState<Achievement[]>([])
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [farmerNameState, setFarmerNameState] = useState<string>('Rahul Kumar')
	const [mobileNumber, setMobileNumber] = useState<string | null>(null)
	const [creditsSpent, setCreditsSpent] = useState<number>(0)
	const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([])

	// Stable Farmer ID (local persistence)
	const [farmerId] = useState<string>(() => {
		try {
			const existing = localStorage.getItem('farmerId')
			if (existing) return existing
			const id = generateFarmerId()
			localStorage.setItem('farmerId', id)
			return id
		} catch {
			return generateFarmerId()
		}
	})

	function generateFarmerId(): string {
		const d = new Date()
		const datePart = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('')
		const rand = Math.random().toString(36).substring(2,7).toUpperCase()
		return `FRM-${datePart}-${rand}`
	}

	// Shoelace approximation (very rough) kept for legacy; not used for visit request payload now
	const calculatePlotArea = (points: LatLngPoint[]): number => {
		if (points.length < 3) return 0
		let area = 0
		for (let i = 0; i < points.length; i++) {
			const j = (i + 1) % points.length
			area += points[i].lat * points[j].lng
			area -= points[j].lat * points[i].lng
		}
		return Math.abs(area) / 2 * 0.0001 // arbitrary scale to "acres"
	}

	const addNotification = (message: string, type: 'success' | 'info' | 'warning') => {
		const n: Notification = { id: `${Date.now()}`, message, type, read: false, createdAt: new Date() }
		setNotifications(prev => [n, ...prev])
	}

	const markNotificationRead = (id: string) => {
		setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
	}

	const addPlot = (newPlotPoints: LatLngPoint[], plotName: string, area: number) => {
		if (!newPlotPoints.length) return
		const newPlot: Plot = {
			id: `${Date.now()}`,
			points: newPlotPoints,
			name: plotName,
			area,
			createdAt: new Date(),
			carbonCredits: Math.floor(area * 0.5)
		}
		setPlots(prev => [newPlot, ...prev])
		checkAchievements([newPlot, ...plots])
		addNotification(`Plot "${plotName}" saved. +${newPlot.carbonCredits} credits`, 'success')
	}

	const updateFarmDetails = (details: FarmDetails) => {
		setFarmDetails(details)
		addNotification('Farm details updated', 'success')
	}

	const updateFarmerProfile = (data: { name?: string; mobileNumber?: string }) => {
		if (data.name) setFarmerNameState(data.name)
		if (data.mobileNumber) setMobileNumber(data.mobileNumber)
		addNotification('Profile updated', 'success')
	}

	const checkAchievements = (currentPlots: Plot[]) => {
		const newOnes: Achievement[] = []
		if (currentPlots.length === 1 && !achievements.some(a => a.id === 'first-plot')) {
			newOnes.push({ id:'first-plot', title:'First Steps', description:'Mapped your first plot', icon:'🌱', unlockedAt:new Date(), points:10 })
		}
		if (currentPlots.length >= 3 && !achievements.some(a => a.id === 'multiple-plots')) {
			newOnes.push({ id:'multiple-plots', title:'Plot Master', description:'Mapped 3+ plots', icon:'🏆', unlockedAt:new Date(), points:25 })
		}
		const totalArea = currentPlots.reduce((s,p)=>s+p.area,0)
		if (totalArea >= 10 && !achievements.some(a => a.id === 'large-farm')) {
			newOnes.push({ id:'large-farm', title:'Land Baron', description:'10+ acres mapped', icon:'🌍', unlockedAt:new Date(), points:50 })
		}
		if (newOnes.length) {
			setAchievements(prev => [...prev, ...newOnes])
			newOnes.forEach(a => addNotification(`Achievement unlocked: ${a.title}`, 'success'))
		}
	}

	// Carbon credits available (earned - spent)
	const totalCarbonCredits = useMemo(() => {
		const earned = plots.reduce((t,p)=>t+p.carbonCredits,0)
		return earned - creditsSpent
	}, [plots, creditsSpent])

	// Visit request (minimal payload as specified)
	const requestVisitVerification = async (data: { village: string; locationDetails: string; preferredDate: string }): Promise<{ ok: boolean; error?: string }> => {
		const base: Omit<VisitRequest,'status'> = {
			id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
			farmerId,
			farmerName: farmerNameState,
			village: data.village,
			locationDetails: data.locationDetails,
			preferredDate: data.preferredDate,
			createdAt: new Date(),
			updatedAt: new Date()
		}
		try {
			const payload = { farmerId, farmerName: farmerNameState, village: data.village, locationDetails: data.locationDetails, preferredDate: data.preferredDate }
			const resp = await fetch(`${API_BASE}/api/visit-request`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})
			let bodyText = ''
			let bodyJson: any = null
			try { bodyText = await resp.text(); try { bodyJson = JSON.parse(bodyText) } catch {} } catch {}
			if (!resp.ok) {
				const msg = bodyJson?.message || bodyText || `HTTP ${resp.status}`
				addNotification(`Verification request failed (${resp.status})`, 'warning')
				setVisitRequests(prev => [{ ...base, status:'failed', responseMessage: msg }, ...prev])
				return { ok:false, error: msg }
			}
			addNotification('Verification request sent successfully!', 'success')
			setVisitRequests(prev => [{ ...base, status:'pending' }, ...prev])
			return { ok:true }
		} catch (e) {
			const message = (e as Error).message
			addNotification('Network error sending verification request', 'warning')
			setVisitRequests(prev => [{ ...base, status:'failed', responseMessage: message }, ...prev])
			return { ok:false, error: message }
		}
	}

	const markVisitRequestCompleted = (id: string) => {
		setVisitRequests(prev => prev.map(v => v.id === id ? { ...v, status:'completed', updatedAt:new Date() } : v))
		addNotification('Visit marked completed', 'success')
	}

	const purchaseItem = (itemName: string, cost: number, payWithCredits: boolean) => {
		if (payWithCredits) {
			if (cost > totalCarbonCredits) return { ok:false, error:'Not enough carbon credits' }
			setCreditsSpent(prev => prev + cost)
			addNotification(`Purchased ${itemName} for ${cost} credits`, 'success')
			return { ok:true }
		}
		addNotification(`Purchased ${itemName} for ₹${cost}`, 'success')
		return { ok:true }
	}

	const value: FarmerContextShape = useMemo(() => ({
		farmerId,
		farmerName: farmerNameState,
		mobileNumber,
		plots,
		farmDetails,
		achievements,
		notifications,
		totalCarbonCredits,
		creditsSpent,
		visitRequests,
		addPlot,
		updateFarmDetails,
		updateFarmerProfile,
		addNotification,
		markNotificationRead,
		calculatePlotArea,
		requestVisitVerification,
		markVisitRequestCompleted,
		purchaseItem
	}), [farmerId, farmerNameState, mobileNumber, plots, farmDetails, achievements, notifications, totalCarbonCredits, creditsSpent, visitRequests])

	return <FarmerContext.Provider value={value}>{children}</FarmerContext.Provider>
}
