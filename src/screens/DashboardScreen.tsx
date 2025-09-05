import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFarmerContext } from "../context/FarmerContext";
import { useAuth } from "../context/AuthContext";

interface FarmData {
  farmerId: string;
  coordinates: Array<{
    lat: number;
    lng: number;
  }>;
  area: number;
  receivedAt: string;
  cropType?: string;
}

const DashboardScreen: React.FC = () => {
  const {
    farmerName,
    farmerId,
    plots,
    farmDetails,
    achievements,
    notifications,
    totalCarbonCredits,
    markNotificationRead,
    requestVisitVerification,
  } = useFarmerContext();
  const { user } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [farmData, setFarmData] = useState<FarmData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFarmData();
  }, [user?.farmerId]);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const currentFarmerId = user?.farmerId || farmerId;

      if (!currentFarmerId) {
        setError("No farmer ID available");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://nabard-visitor-backend.onrender.com/api/get-coordinates/${currentFarmerId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch farm data: ${response.status}`);
      }

      const data: FarmData[] = await response.json();
      setFarmData(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching farm data:", err);
    } finally {
      setLoading(false);
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);


  const totalArea =
    farmData && farmData.length > 0
      ? farmData.reduce((total, data) => total + data.area, 0)
      : plots.reduce((total, plot) => total + plot.area, 0);

  const latestFarmData =
    farmData && farmData.length > 0 ? farmData[farmData.length - 1] : null;

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
            <span className="icon" aria-hidden>
              🔔
            </span>
            {unreadNotifications.length > 0 && (
              <span className="notification-badge">
                {unreadNotifications.length}
              </span>
            )}
          </button>
          <Link to="/login" className="btn btn-ghost">
            <span className="icon" aria-hidden>
              👤
            </span>
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
                  className={`notification-item ${
                    notification.read ? "read" : "unread"
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <span className="icon" aria-hidden>
                    {notification.type === "success"
                      ? "✅"
                      : notification.type === "warning"
                      ? "⚠️"
                      : "ℹ️"}
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

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading farm data...</p>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <span>⚠️ Error loading farm data: {error}</span>
          <button onClick={fetchFarmData} className="btn btn-text">
            Retry
          </button>
        </div>
      )}

      <section className="content">
        <div className="welcome-card">
          <h2 className="greeting">
            Hello, {(user?.name || farmerName).split(" ")[0]}!
          </h2>
          <p className="muted">
            Farmer ID: <strong>{user?.farmerId || farmerId}</strong>
          </p>
          {user?.email && <p className="muted">Email: {user.email}</p>}
          {user?.mobile && <p className="muted">Mobile: {user.mobile}</p>}
          <p className="muted">Welcome back to your carbon credit dashboard</p>
          {farmDetails && (
            <div className="farm-info">
              <span className="icon" aria-hidden>
                🏡
              </span>
              <span>
                {farmDetails.name} • {farmDetails.location}
              </span>
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
            <span className="stat-label">Total Hectares</span>
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

        {latestFarmData && (
          <div className="api-data-card">
            <h3>🌱 Latest Farm Measurement</h3>
            <div className="api-data-grid">
              <div className="api-data-item">
                <span className="label">Measured Area:</span>
                <span className="value highlight">
                  {latestFarmData.area} hectares
                </span>
              </div>
              <div className="api-data-item">
                <span className="label">Boundary Points:</span>
                <span className="value">
                  {latestFarmData.coordinates.length}
                </span>
              </div>
              <div className="api-data-item">
                <span className="label">Last Updated:</span>
                <span className="value">
                  {new Date(latestFarmData.receivedAt).toLocaleDateString()}
                </span>
              </div>
              {latestFarmData.cropType && (
                <div className="api-data-item">
                  <span className="label">Crop Type:</span>
                  <span className="value">{latestFarmData.cropType}</span>
                </div>
              )}
            </div>
            <button
              onClick={fetchFarmData}
              className="btn btn-secondary btn-sm"
            >
              Refresh Data
            </button>
          </div>
        )}

        <div className="action-buttons">
          <div className="secondary-actions" style={{ width: "100%" }}>
            <Link to="/profile" className="btn btn-secondary">
              <span className="icon" aria-hidden>
                👤
              </span>
              <span>My Profile</span>
            </Link>
            <Link to="/analysis" className="btn btn-secondary">
              <span className="icon" aria-hidden>
                🏆
              </span>
              <span>Achievements</span>
            </Link>
            <Link to="/store" className="btn btn-secondary">
              <span className="icon" aria-hidden>
                🛒
              </span>
              <span>Store</span>
            </Link>
            <Link to="/visit-request" className="btn btn-secondary">
              <span className="icon" aria-hidden>
                📨
              </span>
              <span>Visit Request</span>
            </Link>
          </div>
        </div>

        {!farmDetails && (
          <div className="setup-card">
            <h3>🚀 Get Started</h3>
            <p className="muted">
              Complete your farm profile to get better carbon credit
              calculations
            </p>
            <Link to="/farm-details" className="btn btn-primary">
              <span className="icon" aria-hidden>
                📝
              </span>
              <span>Add Farm Details</span>
            </Link>
          </div>
        )}

        {plots.length > 0 && (
          <div className="recent-plots">
            <div className="section-header">
              <h3>Recent Plots</h3>
              <Link to="/profile" className="btn btn-ghost btn-text">
                View All
              </Link>
            </div>
            <div className="plot-list">
              {plots.slice(0, 3).map((plot) => (
                <div key={plot.id} className="plot-item">
                  <span className="icon" aria-hidden>
                    🗺️
                  </span>
                  <div className="plot-details">
                    <h4>{plot.name}</h4>
                    <p className="muted">
                      {plot.area.toFixed(2)} hectares • {plot.points.length}{" "}
                      points
                    </p>
                    <p className="carbon-credits">
                      <span className="icon" aria-hidden>
                        💰
                      </span>
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
              <Link to="/achievements" className="btn btn-ghost btn-text">
                View All
              </Link>
            </div>
            <div className="achievements-preview">
              {achievements.slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="achievement-preview">
                  <span className="icon" aria-hidden>
                    {achievement.icon}
                  </span>
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

      <style>{`
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.9);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #2c974b;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-banner {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem;
          border-radius: 8px;
        }

        .api-data-card {
          background: #2c974b;
          padding: 1.5rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          color: white;
        }

        .api-data-card h3 {
          margin-top: 0;
          color: white;
        }

        .api-data-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .api-data-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .api-data-item .label {
          font-weight: 600;
        }

        .api-data-item .value {
          font-weight: bold;
        }

        .api-data-item .value.highlight {
          font-size: 1.2em;
          color: #ffd700;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9em;
        }
      `}</style>
    </main>
  );
};

export default DashboardScreen;
