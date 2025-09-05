import React, { useEffect, useState } from "react";
import VegAnalyticsChart from "../components/VegAnalyticsChart";
import RevenueWidget from "../components/RevenueWidget";
import ImageWidget from "../components/ImageWidget";
import RevenueGrowthChart from "../components/RevenueGrowthChart";
import { useNavigate } from "react-router-dom";
import { useFarmerContext } from "../context/FarmerContext";
import { estimateMonthlyCarbon } from "./calculation";

// Constants (should be centralized if reused elsewhere)
const BIOMASS_CONSTANTS = {
  k: 7500,      // kg/ha per NDVI (placeholder)
  CF: 0.45,     // carbon fraction
  rootRatio: 0.20
};

const AnalysisScreen: React.FC = () => {
  const navigate = useNavigate();
  const { achievements, totalCarbonCredits, plots } = useFarmerContext();

  // State for remote vegetation/area data
  const [apiData, setApiData] = useState<any | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [carbonResult, setCarbonResult] = useState<any | null>(null);
  const [baselineStock, setBaselineStock] = useState<number | null>(null); // t C/ha

  // Fetch NDVI classification summary & compute carbon credits
  const loadData = async (isRefresh = false) => {
    const storedId = localStorage.getItem("farmerId") || '';
    let triedFallbackId = false;
    let currentFarmerId = storedId || 'temp12345';
    const buildEndpoint = (fid: string) => `https://satellitefarm.onrender.com/process-image?farmerId=${encodeURIComponent(fid)}`;
    let endpoint = buildEndpoint(currentFarmerId);
    const maxAttempts = 3;
    let lastError: any = null;

    // Try cached (only for initial load, not manual refresh)
    if (!isRefresh) {
      try {
        const cached = localStorage.getItem('analysisLastSnapshot');
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log("Using cached data:", parsed);
          setApiData(parsed);
        }
      } catch {}
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setApiError(null);
        const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
          let txt = '';
          try { txt = await res.text(); } catch {}
          const statusMsg = `HTTP ${res.status}${txt ? ': ' + txt.slice(0,140) : ''}`;
          // If 500 and we haven't tried fallback ID yet, swap to temp ID and retry immediately
          if (res.status === 500 && !triedFallbackId && currentFarmerId !== 'temp12345') {
            triedFallbackId = true;
            currentFarmerId = 'temp12345';
            endpoint = buildEndpoint(currentFarmerId);
            console.warn('API 500 with farmerId', storedId, 'retrying with fallback id temp12345');
            continue; // re-enter loop without counting attempt as failure
          }
          if (res.status >= 500) {
            // Don't throw to avoid noisy console error; mark error and continue attempts
            lastError = new Error(statusMsg);
            setApiError(statusMsg);
            await new Promise(r => setTimeout(r, 350 * attempt));
            continue;
          } else {
            throw new Error(statusMsg);
          }
        }
        let json: any;
        try {
          json = await res.json();
        } catch (je) {
          throw new Error('Failed to parse JSON response');
        }
        setApiData(json);
        try { localStorage.setItem('analysisLastSnapshot', JSON.stringify(json)); } catch {}

        const classes = json.classes || {};
        const beforePerc = {
          bare: classes["Bare/Non-Veg"]?.before_perc ?? 0,
          sparse: classes["Sparse Veg"]?.before_perc ?? 0,
            moderate: classes["Moderate Veg"]?.before_perc ?? 0,
          dense: classes["Dense Veg"]?.before_perc ?? 0,
        };
        const afterPerc = {
          bare: classes["Bare/Non-Veg"]?.after_perc ?? 0,
          sparse: classes["Sparse Veg"]?.after_perc ?? 0,
          moderate: classes["Moderate Veg"]?.after_perc ?? 0,
          dense: classes["Dense Veg"]?.after_perc ?? 0,
        };

        // Normalize if rounding drift (rare)
        const norm = (p: any) => {
          const s = p.bare + p.sparse + p.moderate + p.dense;
          if (s > 0 && Math.abs(s - 100) > 0.05) {
            p.bare = p.bare * 100 / s;
            p.sparse = p.sparse * 100 / s;
            p.moderate = p.moderate * 100 / s;
            p.dense = p.dense * 100 / s;
          }
        };
        norm(beforePerc); norm(afterPerc);

        // Derive baseline ("previous month") carbon stock per ha from before percentages so deltas are meaningful
        const { k, CF, rootRatio } = BIOMASS_CONSTANTS;
        // NDVI midpoints used in calculation module
        const NDVI_MIDPOINTS: any = { bare: 0.10, sparse: 0.30, moderate: 0.50, dense: 0.80 };
        const agbBefore = (
          (beforePerc.bare/100) * (k * NDVI_MIDPOINTS.bare) +
          (beforePerc.sparse/100) * (k * NDVI_MIDPOINTS.sparse) +
          (beforePerc.moderate/100) * (k * NDVI_MIDPOINTS.moderate) +
          (beforePerc.dense/100) * (k * NDVI_MIDPOINTS.dense)
        );
        const cBefore = (agbBefore * CF / 1000) * (1 + rootRatio); // t C/ha
        setBaselineStock(cBefore);

        // Use baseline stock as prevMonthStock for after snapshot
        try {
          const result = estimateMonthlyCarbon({
            areaHa: json.total_area_ha ?? 0,
            month: new Date().toISOString().slice(0,7),
            percentages: afterPerc as any,
            prevMonthStock_tC_perHa: cBefore
          });
          setCarbonResult(result);
          setApiError(null);
          return; // success, stop retry loop
        } catch (calcErr: any) {
          lastError = calcErr;
          setApiError(calcErr.message);
          return; // Calculation error won't improve with retries
        }
      } catch (e: any) {
        lastError = e;
        if (attempt < maxAttempts) {
          // Exponential backoff
            await new Promise(r => setTimeout(r, 400 * attempt));
          continue;
        }
        setApiError(e.message);
      }
    }

    // Fallback synthetic dataset if completely failed and nothing cached
    if (!apiData) {
      try {
        const cached = localStorage.getItem('analysisLastSnapshot');
        if (!cached) {
          console.warn('Using synthetic fallback analysis data due to API failure:', lastError?.message);
          const synthetic = {
            total_area_ha: 7.5,
            classes: {
              'Bare/Non-Veg': { before_perc: 8, after_perc: 6 },
              'Sparse Veg': { before_perc: 32, after_perc: 28 },
              'Moderate Veg': { before_perc: 40, after_perc: 43 },
              'Dense Veg': { before_perc: 20, after_perc: 23 }
            },
            urls: [
              'https://placehold.co/280x180?text=Before',
              'https://placehold.co/280x180?text=After'
            ],
            fallback: true
          };
          setApiData(synthetic as any);
          const { k, CF, rootRatio } = BIOMASS_CONSTANTS;
          const NDVI_MIDPOINTS: any = { bare: 0.10, sparse: 0.30, moderate: 0.50, dense: 0.80 };
          const beforePerc = synthetic.classes;
          const agbBefore = (
            (beforePerc['Bare/Non-Veg'].before_perc/100) * (k * NDVI_MIDPOINTS.bare) +
            (beforePerc['Sparse Veg'].before_perc/100) * (k * NDVI_MIDPOINTS.sparse) +
            (beforePerc['Moderate Veg'].before_perc/100) * (k * NDVI_MIDPOINTS.moderate) +
            (beforePerc['Dense Veg'].before_perc/100) * (k * NDVI_MIDPOINTS.dense)
          );
          const cBefore = (agbBefore * CF / 1000) * (1 + rootRatio);
          setBaselineStock(cBefore);
          try {
            const result = estimateMonthlyCarbon({
              areaHa: synthetic.total_area_ha,
              month: new Date().toISOString().slice(0,7),
              percentages: {
                bare: synthetic.classes['Bare/Non-Veg'].after_perc,
                sparse: synthetic.classes['Sparse Veg'].after_perc,
                moderate: synthetic.classes['Moderate Veg'].after_perc,
                dense: synthetic.classes['Dense Veg'].after_perc
              } as any,
              prevMonthStock_tC_perHa: cBefore
            });
            setCarbonResult(result);
            if (!isRefresh) setApiError(lastError?.message || 'API unavailable, showing fallback data');
          } catch (calcErr:any) {
            setApiError('Fallback calc error: ' + calcErr.message);
          }
        }
      } catch {}
    }
  };

  useEffect(() => { loadData(); }, []);

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

  // Example revenue data (placeholder for UI continuity)
  const prevRevenue = 12000; const currRevenue = 15000;
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  const revenues = [9000, 11000, 12000, 13000, 15000, 17000];

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
              {apiData?.urls && Array.isArray(apiData.urls) && apiData.urls.length >= 2 ? (
                <ImageWidget
                  images={[
                    { url: apiData.urls[0], alt: "Farm 1" },
                    { url: apiData.urls[1], alt: "Farm 2" }
                  ]}
                  title="Farm View"
                  description="Latest satellite images of your farm."
                />
              ) : apiError ? (
                <div style={{ fontSize: 12, color: '#b80000' }}>Image load failed</div>
              ) : apiData && apiData.urls && apiData.urls.length === 1 ? (
                <ImageWidget
                  images={[{ url: apiData.urls[0], alt: "Farm" }]}
                  title="Farm View"
                  description="Single satellite image available."
                />
              ) : (
                <div style={{ fontSize: 12, color: '#555' }}>Loading images...</div>
              )}
            </div>
        </div>
        <VegAnalyticsChart prevMonth={prevMonthVeg} currMonth={currMonthVeg} />
        <div style={{ marginTop: 32 }}>
          <RevenueGrowthChart months={months} revenues={revenues} />
        </div>

        <div style={{ marginTop: 24, padding: '12px 16px', border: '1px solid #e2e2e2', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Carbon Credit Estimation</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            {apiError ? (
              apiError.includes('HTTP 500') ? (
                <p style={{ color: '#b80000', fontSize: 13, margin: 0 }}>Satellite processing not available yet.</p>
              ) : (
                <p style={{ color: '#b80000', fontSize: 13, margin: 0 }}>Error: {apiError}</p>
              )
            ) : !apiData ? (
              <p style={{ fontSize: 13, margin: 0 }}>Loading satellite data...</p>
            ) : (
              <p style={{ fontSize: 13, margin: 0, color: '#25663a' }}>Data loaded</p>
            )}
            <button onClick={() => loadData(true)} style={{ fontSize: 12, padding: '4px 10px', border: '1px solid #ccc', background: '#fff', borderRadius: 4, cursor: 'pointer' }}>Refresh</button>
          </div>
          {apiData?.fallback && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#8a6d00' }}>Service unreachable (HTTP 500). Showing synthetic fallback sample.</p>
          )}
          {apiError?.includes('HTTP 500') && !apiData?.fallback && (
            <div style={{ margin: '6px 0 0', fontSize: 12, color: '#8a2525' }}>
              <p style={{ margin: '4px 0' }}>Satellite data not available yet for your farm ID.</p>
              {plots.length === 0 && (
                <div style={{ marginTop: 4 }}>
                  <p style={{ margin: '4px 0', color: '#444' }}>You haven't mapped any plots. Map a plot first or request an agent verification to initiate satellite processing.</p>
                  <button onClick={() => navigate('/visit-request')} style={{ fontSize: 12, padding: '6px 12px', background: '#25663a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
                    Request Agent Verification
                  </button>
                </div>
              )}
              {plots.length > 0 && (
                <p style={{ margin: '4px 0', color: '#444' }}>Your plots are mapped; processing may still be running. Check back later or refresh.</p>
              )}
            </div>
          )}
          {carbonResult && (
            <div style={{ fontSize: 13, lineHeight: 1.45 }}>
              <p style={{ margin: '4px 0' }}>Area Analyzed: <strong>{carbonResult.areaHa.toFixed(2)}</strong> ha</p>
              {baselineStock !== null && (
                <p style={{ margin: '4px 0' }}>Baseline Carbon Stock: {baselineStock.toFixed(3)} t C/ha</p>
              )}
              <p style={{ margin: '4px 0' }}>Current Carbon Stock: {carbonResult.carbon_current_tC_perHa.toFixed(3)} t C/ha</p>
              <p style={{ margin: '4px 0' }}>Incremental Carbon (t C/ha): {carbonResult.incremental_tC_perHa.toFixed(3)}</p>
              <p style={{ margin: '4px 0' }}>Incremental CO2e: {carbonResult.incremental_CO2e_t.toFixed(2)} t</p>
              <p style={{ margin: '4px 0' }}>Buffer Applied: {carbonResult.buffer_applied_t.toFixed(2)} t</p>
              <p style={{ margin: '4px 0' }}>Uncertainty Discount: {carbonResult.uncertainty_discount_t.toFixed(2)} t</p>
              <p style={{ margin: '4px 0' }}><strong>Net Credits (Provisional): {carbonResult.credits_after_buffer_uncertainty_t.toFixed(2)} t CO2e</strong></p>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: 'pointer' }}>Method Details</summary>
                <div style={{ marginTop: 8 }}>
                  <p style={{ margin: '4px 0' }}>AGB: {carbonResult.AGB_kg_per_ha.toFixed(1)} kg/ha</p>
                  <p style={{ margin: '4px 0' }}>Assumptions: k={carbonResult.assumptions.k}, CF={carbonResult.assumptions.CF}, rootRatio={carbonResult.assumptions.rootRatio}, buffer={carbonResult.assumptions.bufferRate*100}%, uncertainty={carbonResult.assumptions.uncertainty*100}%</p>
                </div>
              </details>
              <small style={{ display: 'block', marginTop: 8, color: '#555' }}>Credits are indicative; coefficients need calibration.</small>
            </div>
          )}
        </div>

        <div className="upcoming-achievements" style={{ marginTop: 32 }}>
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
                    style={{ width: `${Math.min((plots.length / 5) * 100, 100)}%` }}
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
                    style={{ width: `${Math.min((totalCarbonCredits / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="progress-text">{totalCarbonCredits}/100 credits</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AnalysisScreen;