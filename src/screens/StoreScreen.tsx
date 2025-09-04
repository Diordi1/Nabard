import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFarmerContext } from '../context/FarmerContext'

const inventory = [
  { id: 'seed-1', name: 'Wheat Seeds (1kg)', price: 200, creditCost: 10 },
  { id: 'fert-1', name: 'Organic Fertilizer (5kg)', price: 750, creditCost: 35 },
  { id: 'pest-1', name: 'Eco Pesticide (1L)', price: 500, creditCost: 22 },
  { id: 'plant-1', name: 'Sapling Pack (Fruits x5)', price: 900, creditCost: 45 }
]

const StoreScreen: React.FC = () => {
  const navigate = useNavigate()
  const { totalCarbonCredits, purchaseItem } = useFarmerContext()
  const [message, setMessage] = useState<string | null>(null)

  const handlePurchase = (itemId: string, payWithCredits: boolean) => {
    const item = inventory.find(i => i.id === itemId)
    if (!item) return
    const cost = payWithCredits ? item.creditCost : item.price
    const res = purchaseItem(item.name, cost, payWithCredits)
    if (!res.ok) {
      setMessage(res.error || 'Purchase failed')
    } else {
      setMessage(`Purchased ${item.name}`)
    }
  }

  return (
    <main className="screen">
      <header className="app-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} aria-label="Go back">←</button>
        <h1>Store</h1>
        <div style={{ width: 40 }} />
      </header>
      <section className="content">
        <div className="card">
          <h2>Redeem & Purchase</h2>
          <p className="muted">Your Available Credits: {totalCarbonCredits}</p>
          {message && <p className="muted small">{message}</p>}
        </div>
        <ul className="list">
          {inventory.map(item => (
            <li key={item.id} className="list-item store-item">
              <div className="store-info">
                <h4>{item.name}</h4>
                <p className="muted small">₹{item.price} or {item.creditCost} credits</p>
              </div>
              <div className="store-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handlePurchase(item.id, false)}>₹ Buy</button>
                <button className="btn btn-primary btn-sm" onClick={() => handlePurchase(item.id, true)}>Credits</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default StoreScreen
