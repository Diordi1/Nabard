import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  creditCost: number;
  description: string;
  badge?: string;
  imageId: string;
}

interface PurchaseResult {
  ok: boolean;
  error?: string;
}

const StoreScreen: React.FC = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [activeCategory, setActiveCategory] = useState("All Products");

  // Mock function to simulate purchase
  const purchaseItem = (
    itemName: string,
    cost: number,
    payWithCredits: boolean
  ): PurchaseResult => {
    // In a real app, this would interact with your backend
    console.log(
      `Purchasing ${itemName} for ${
        payWithCredits ? cost + " credits" : "₹" + cost
      }`
    );

    // Simulate random success/failure for demonstration
    const success = Math.random() > 0.2;

    if (success) {
      return { ok: true };
    } else {
      return { ok: false, error: "Insufficient balance" };
    }
  };

  const inventory: Product[] = [
    {
      id: "seed-1",
      name: "Wheat Seeds (1kg)",
      price: 200,
      creditCost: 10,
      description:
        "High-yield, disease-resistant wheat seeds for optimal harvest",
      badge: "Popular",
      imageId: "1594020665228-255d12d3084d", // Wheat grains https://images.unsplash.com/photo-1594020665228-255d12d3084d?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    },
    {
      id: "fert-1",
      name: "Organic Fertilizer (5kg)",
      price: 750,
      creditCost: 35,
      description: "100% natural fertilizer for healthier soil and plants",
      imageId: "1710666184386-9f42d0227237", // Fertilizer/soil   https://images.unsplash.com/photo-1710666184386-9f42d0227237?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    },
    {
      id: "pest-1",
      name: "Eco Pesticide (1L)",
      price: 500,
      creditCost: 22,
      description:
        "Environmentally friendly pesticide that protects without harming",
      badge: "Eco-friendly",
      imageId: "1615484477919-3a2d3d0fdf44", // Farmer spraying pesticide
    },
    {
      id: "plant-1",
      name: "Sapling Pack (Fruits x5)",
      price: 900,
      creditCost: 45,
      description: "Variety pack of fruit saplings for diversified farming",
      imageId: "1623252161188-87d98a4e4aa4", // Small saplings
    },
    {
      id: "irrig-1",
      name: "Drip Irrigation Kit",
      price: 1500,
      creditCost: 70,
      description: "Water-saving irrigation system for efficient farming",
      badge: "New",
      imageId: "1738598665698-7fd7af4b5e0c", // Drip irrigation system
    },
    {
      id: "comp-1",
      name: "Compost Bin (50L)",
      price: 1200,
      creditCost: 55,
      description: "Create nutrient-rich compost from organic waste",
      imageId: "1611284446314-60a58ac0deb9", // Compost pile/bin https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
    },
  ];

  const totalCarbonCredits = 120; // This would come from your context

  const handlePurchase = (itemId: string, payWithCredits: boolean) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const cost = payWithCredits ? item.creditCost : item.price;
    const res = purchaseItem(item.name, cost, payWithCredits);

    if (!res.ok) {
      setMessageType("error");
      setMessage(res.error || "Purchase failed");
    } else {
      setMessageType("success");
      setMessage(`Successfully purchased ${item.name}`);
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const categories = [
    "All Products",
    "Seeds",
    "Fertilizers",
    "Tools",
    "Saplings",
  ];

  return (
    <div className="screen">
      <header className="app-header">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <h1>Eco Store</h1>
        <div style={{ width: 40 }} />
      </header>

      <section className="content">
        <div className="card">
          <h2>Carbon Credit Marketplace</h2>
          <p className="muted">
            Redeem your carbon credits for sustainable farming products
          </p>

          <div className="credit-balance">
            <div className="credit-icon">
              <i className="fas fa-leaf"></i>
            </div>
            <div>
              <div className="muted small">Available Balance</div>
              <div className="credit-amount">{totalCarbonCredits} credits</div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`message-box ${
              messageType === "success" ? "message-success" : "message-error"
            }`}
          >
            <i
              className={`fas ${
                messageType === "success"
                  ? "fa-check-circle"
                  : "fa-exclamation-circle"
              }`}
            ></i>
            <span>{message}</span>
          </div>
        )}

        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {inventory.map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-image">
                <img
                  src={`https://images.unsplash.com/photo-${item.imageId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
                  alt={item.name}
                  onError={(e) => {
                    // Fallback image if the URL fails
                    (e.target as HTMLImageElement).src =
                      "https://images.pexels.com/photos/51947/tuscany-grape-field-nature-51947.jpeg";
                  }}
                />
                {item.badge && (
                  <div className="product-badge">{item.badge}</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-title">{item.name}</h3>
                <p className="product-description">{item.description}</p>
                <div className="product-pricing">
                  <div className="price-tag">
                    <span className="cash-price">
                      ₹{item.price.toLocaleString()}
                    </span>
                    <div className="credit-price">
                      <i className="fas fa-leaf"></i>
                      <span>{item.creditCost} credits</span>
                    </div>
                  </div>
                </div>
                <div className="product-actions">
                  <button
                    className="action-btn buy-cash"
                    onClick={() => handlePurchase(item.id, false)}
                  >
                    <i className="fas fa-indian-rupee-sign"></i> Buy with Cash
                  </button>
                  <button
                    className="action-btn buy-credits"
                    onClick={() => handlePurchase(item.id, true)}
                  >
                    <i className="fas fa-leaf"></i> Use Credits
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
          background-color: #f8fafc;
          color: #334155;
          line-height: 1.6;
        }
        
        .screen {
          max-width: 100%;
          margin: 0 auto;
          padding: 16px;
        }
        
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          margin-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }
        
        .app-header h1 {
          font-size: 24px;
          color: #2c974b;
          font-weight: 700;
        }
        
        .btn {
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .btn-ghost {
          background: transparent;
          color: #6cd27a;
          border: 1px solid #cbd5e1;
        }
        
        .btn-ghost:hover {
          background: #6cd27a;
          color: #475569;
        }
        
        .content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        
        .card h2 {
          font-size: 20px;
          margin-bottom: 8px;
          color: #1e293b;
        }
        
        .muted {
          color: #64748b;
        }
        
        .small {
          font-size: 14px;
        }
        
        .credit-balance {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          padding: 12px;
          background: #f0fdf4;
          border-radius: 8px;
          border: 1px solid #bbf7d0;
        }
        
        .credit-icon {
          width: 36px;
          height: 36px;
          background: #2c974b;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }
        
        .credit-amount {
          font-size: 20px;
          font-weight: 700;
          color: #2c974b;
        }
        
        .products-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 16px;
        }
        
        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #e2e8f0;
        }
        
        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
        }
        
        .product-image {
          height: 160px;
          overflow: hidden;
          position: relative;
        }
        
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .product-card:hover .product-image img {
          transform: scale(1.05);
        }
        
        .product-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #2c974b;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .product-info {
          padding: 14px;
        }
        
        .product-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #1e293b;
        }
        
        .product-description {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 10px;
          line-height: 1.4;
        }
        
        .product-pricing {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        
        .price-tag {
          display: flex;
          flex-direction: column;
        }
        
        .cash-price {
          font-weight: 600;
          color: #1e293b;
          font-size: 16px;
        }
        
        .credit-price {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #2c974b;
          font-weight: 600;
          font-size: 14px;
        }
        
        .product-actions {
          display: flex;
          gap: 8px;
        }
        
        .action-btn {
          flex: 1;
          padding: 8px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 14px;
        }
        
        .buy-cash {
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        
        .buy-cash:hover {
          background: #e2e8f0;
        }
        
        .buy-credits {
          background: #2c974b;
          color: white;
        }
        
        .buy-credits:hover {
          background: #1e6a34;
        }
        
        .category-filter {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: nowrap;
          overflow-x: auto;
          padding-bottom: 4px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .category-filter::-webkit-scrollbar {
          display: none;
        }
        
        .category-btn {
          padding: 6px 12px;
          background: white;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
          white-space: nowrap;
        }
        
        .category-btn.active, .category-btn:hover {
          background: #2c974b;
          color: white;
          border-color: #2c974b;
        }
        
        .message-box {
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .message-success {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        
        .message-error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        
        @media (min-width: 640px) {
          .screen {
            max-width: 640px;
            margin: 0 auto;
          }
          
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (min-width: 768px) {
          .screen {
            max-width: 768px;
            padding: 20px;
          }
          
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default StoreScreen;
