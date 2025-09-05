import React, { useEffect } from "react";
import VegAnalyticsChart from "../components/VegAnalyticsChart";
import RevenueWidget from "../components/RevenueWidget";
import ImageWidget from "../components/ImageWidget";
import RevenueGrowthChart from "../components/RevenueGrowthChart";
import { useNavigate } from "react-router-dom";
import { useFarmerContext } from "../context/FarmerContext";

const AchievementsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { achievements, totalCarbonCredits, plots } = useFarmerContext();

  // API call to process-image endpoint
  useEffect(() => {
    fetch("https://satellitefarm.onrender.com/process-image")
      .then(res => res.json())
      .then(data => {
        console.log("Process Image API response:", data);
      })
      .catch(err => {
        console.error("Process Image API error:", err);
      });
  }, []);

  // Example NDVI/vegetation data for previous and current month (replace with real data logic)
  // These values should be calculated from your actual plot/NDVI data
  const prevMonthVeg: Record<string, number> = {
    "Bare/Non-Veg": 2,
    "Sparse Veg": 3,
    "Moderate Veg": 1,
    "Dense Veg": 0,
  };
  const currMonthVeg: Record<string, number> = {
    "Bare/Non-Veg": 1,
    "Sparse Veg": 2,
    "Moderate Veg": 2,
    "Dense Veg": 1,
  };

  // Example revenue data (replace with real data logic)
  const prevRevenue = 12000;
  const currRevenue = 15000;

  // Example revenue growth data (replace with real data logic)
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const revenues = [9000, 11000, 12000, 13000, 15000, 17000];

  const totalPoints = achievements.reduce(
    (sum, achievement) => sum + achievement.points,
    0
  );
  const totalArea = plots.reduce((sum, plot) => sum + plot.area, 0);

  return (
    <main className="screen">
      <header className="app-header">
        <button
          className="btn btn-ghost"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ←
        </button>
        <h1>Achievements</h1>
        <div style={{ width: 40 }} />
      </header>
      <section className="content">
        <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: '50%', minWidth: 180, maxWidth: 300 }}>
            <RevenueWidget current={currRevenue} previous={prevRevenue} />
          </div>
          <div style={{ width: '50%', minWidth: 120, maxWidth: 220 }}>
            <ImageWidget
              images={[
                { url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80", alt: "Farm 1" },
                { url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80", alt: "Farm 2" }
              ]}
              title="Farm View"
              description="Latest satellite images of your farm."
            />
          </div>
        </div>
        <VegAnalyticsChart prevMonth={prevMonthVeg} currMonth={currMonthVeg} />
        <div style={{ marginTop: 32 }}>
          <RevenueGrowthChart months={months} revenues={revenues} />
        </div>
              
       
        <div className="upcoming-achievements">
          <h3>Upcoming Challenges</h3>
          <div className="challenge-list">
            <div className="challenge-item">
              <span className="icon">🌾</span>
              <div>
                <h4>Harvest Hero</h4>
                <p className="muted">Map 5 different crop plots</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((plots.length / 5) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">{plots.length}/5 plots</span>
              </div>
            </div>

            <div className="challenge-item">
              <span className="icon">🌱</span>
              <div>
                <h4>Carbon Champion</h4>
                <p className="muted">Earn 100 carbon credits</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(
                        (totalCarbonCredits / 100) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {totalCarbonCredits}/100 credits
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AchievementsScreen;
