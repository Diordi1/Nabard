import React, { useEffect, useState } from "react";
import VegAnalyticsChart from "../components/VegAnalyticsChart";
import RevenueWidget from "../components/RevenueWidget";
import ImageWidget from "../components/ImageWidget";
import RevenueGrowthChart from "../components/RevenueGrowthChart";
import { useNavigate } from "react-router-dom";
import { useFarmerContext } from "../context/FarmerContext";
import { estimateMonthlyCarbon } from "./calculation";
import axios from "axios";

const AchievementsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { achievements, totalCarbonCredits, plots } = useFarmerContext();

  // State for remote vegetation/area data
  const [apiData, setApiData] = useState<any | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [carbonResult, setCarbonResult] = useState<any | null>(null);

  // Fetch NDVI classification summary
  useEffect(() => {
    const url =
      "https://satellitefarm.onrender.com/process-image?farmerId=temp12345";

    console.log("Calling:", url);

    axios
      .get(url)
      .then(res => {
        console.log("✅ API response:", res.data);
      })
      .catch(err => {
        console.error("❌ API error:", err);
      });
  }, []);

  // Example NDVI/vegetation data for previous and current month (replace with real data logic)
  // These values should be calculated from your actual plot/NDVI data
  // Fallback demo values if API not yet loaded
  const prevMonthVeg: Record<string, number> = apiData ? {
    "Bare/Non-Veg": apiData.classes?.["Bare/Non-Veg"]?.before_perc ?? 0,
    "Sparse Veg": apiData.classes?.["Sparse Veg"]?.before_perc ?? 0,
    "Moderate Veg": apiData.classes?.["Moderate Veg"]?.before_perc ?? 0,
    "Dense Veg": apiData.classes?.["Dense Veg"]?.before_perc ?? 0,
  } : { "Bare/Non-Veg": 2, "Sparse Veg": 3, "Moderate Veg": 1, "Dense Veg": 0 };

  const currMonthVeg: Record<string, number> = apiData ? {
    "Bare/Non-Veg": apiData.classes?.["Bare/Non-Veg"]?.after_perc ?? 0,
    "Sparse Veg": apiData.classes?.["Sparse Veg"]?.after_perc ?? 0,
    "Moderate Veg": apiData.classes?.["Moderate Veg"]?.after_perc ?? 0,
    "Dense Veg": apiData.classes?.["Dense Veg"]?.after_perc ?? 0,
  } : { "Bare/Non-Veg": 1, "Sparse Veg": 2, "Moderate Veg": 2, "Dense Veg": 1 };

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
  <h1>Analysis</h1>
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
        <div style={{ marginTop: 24, padding: '12px 16px', border: '1px solid #e2e2e2', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Carbon Credit Estimation</h3>
          {apiError && <p style={{ color: '#b80000', fontSize: 13 }}>Error: {apiError}</p>}
          {!apiError && !apiData && <p style={{ fontSize: 13 }}>Loading satellite data...</p>}
          {carbonResult && (
            <div style={{ fontSize: 13, lineHeight: 1.4 }}>
              <p style={{ margin: '4px 0' }}>Area Analyzed: <strong>{carbonResult.areaHa.toFixed(2)}</strong> ha</p>
              <p style={{ margin: '4px 0' }}>Incremental CO2e: {carbonResult.incremental_CO2e_t.toFixed(2)} t</p>
              <p style={{ margin: '4px 0' }}>Buffer Applied: {carbonResult.buffer_applied_t.toFixed(2)} t</p>
              <p style={{ margin: '4px 0' }}>Uncertainty Discount: {carbonResult.uncertainty_discount_t.toFixed(2)} t</p>
              <p style={{ margin: '4px 0' }}><strong>Net Credits (Provisional): {carbonResult.credits_after_buffer_uncertainty_t.toFixed(2)} t CO2e</strong></p>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer' }}>Method Details</summary>
                <div style={{ marginTop: 8 }}>
                  <p style={{ margin: '4px 0' }}>AGB: {carbonResult.AGB_kg_per_ha.toFixed(1)} kg/ha • Current Carbon Stock: {carbonResult.carbon_current_tC_perHa.toFixed(3)} t C/ha</p>
                  <p style={{ margin: '4px 0' }}>Assumptions: k={carbonResult.assumptions.k}, CF={carbonResult.assumptions.CF}, rootRatio={carbonResult.assumptions.rootRatio}, buffer={carbonResult.assumptions.bufferRate*100}% uncertainty={carbonResult.assumptions.uncertainty*100}%</p>
                </div>
              </details>
            </div>
          )}
        </div>
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
