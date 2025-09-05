# AgriCarbon Lite (Farmer Credit Demo)

> A lightweight Monitoring, Reporting & Verification (MRV) prototype for smallholder rice & agroforestry projects. Farmers register, map plots, request on‑field verification, and view remotely sensed vegetation & provisional carbon credit estimates.

---
## Live Resources
- Farmer Web App: https://nabard-sigma.vercel.app/analysis  
- Agent / Field Ops Portal: https://nabard-visitor-frontend.vercel.app/
- Demo / Walkthrough Video: https://drive.google.com/drive/folders/19OV4AVQqBAUK_F7MirZ2Jku5S3oxwGqV?usp=sharing

(Add screenshots: Dashboard, Analysis (NDVI classes), Visit Request form, Plot Mapping flow.)

---
## 1. Overview
AgriCarbon Lite demonstrates an end‑to‑end low-cost MRV workflow:
1. Identity & Onboarding (unique Farmer ID)  
2. Farm & Plot Inputs (manual mapping; demo seeded plots)  
3. Visit Verification Request (agent scheduling trigger)  
4. Remote Sensing Ingestion (NDVI class summary & imagery)  
5. Carbon & Vegetation Analytics (provisional biomass → credits pipeline)  
6. Engagement Layer (achievements, credit balance, store simulation)  

The architecture is intentionally modular so coefficient updates, region‑specific factors, or higher-tier methodologies (SOC, CH₄, tree biomass models) can be slotted in without UI refactors.

---
## 2. Core Features
### Farmer & Identity
- Demo auth providers: Google (mock), Phone (mock), Local email/password registry (localStorage only)
- Deterministic persisted Farmer ID stored in `localStorage`

### Farm & Plot Management
- Plot creation (polygon points → area via planar shoelace approximation with scaling)
- Demo mode auto-seeds 4 example plots with carbon credit values
- Achievement unlocking (first plot, multiple plots, total area milestone)

### Verification Workflow
- Farmer submits a Visit Request (village, location details, preferred date)
- Request POSTed to backend endpoint `.../api/visit-request` with robust failure capture
- Status & response message persisted locally for UX continuity if network fails

### Remote Sensing & Analysis
- Fetches NDVI classification snapshot: before/after vegetation class percentages (Bare, Sparse, Moderate, Dense)
- Resilient fetch: retries, fallback to alternate farmerId, cached snapshot reuse, synthetic dataset injection on persistent 500 errors
- Carbon Estimation Pipeline:
  - NDVI class → midpoint NDVI index
  - Above-Ground Biomass (AGB) = k * NDVI_midpoint (per class weighting)  
  - Carbon stock = AGB * CF * (1 + rootRatio) / 1000 (t C/ha)  
  - Incremental monthly delta → CO₂e (×44/12)  
  - Conservative buffer + uncertainty discounts applied  
  - Outputs provisional net credits (t CO₂e)

### Engagement Layer
- Carbon credit tally (sum of per-plot credits minus spent)
- Store purchase simulation (credits vs fiat) with notifications
- Achievement & challenge progress bars (visual habit loop)

### Notifications
- Success / info / warning events appended with timestamps
- Mark-as-read behavior (could extend to persistence)

### Resilience & UX Safeguards
- Cached `analysisLastSnapshot` in localStorage
- Synthetic fallback dataset (clearly labeled) when satellite service unavailable
- Contextual guidance: map plots or request verification when 500 occurs & no plots

---
## 3. Technology Stack
| Layer | Tech |
|-------|------|
| Frontend Framework | React 18 + TypeScript + Vite |
| UI / Styling | Custom CSS (lightweight) |
| State Management | React Context (`AuthContext`, `FarmerContext`) |
| Charts | Chart.js via `react-chartjs-2` (Vegetation, Revenue) |
| Remote Sensing API | External satellite classification endpoint (JSON NDVI classes) |
| HTTP | native fetch (retry, fallback logic) |
| Storage | `localStorage` (demo persistence) |
| Build / Dev | Vite (fast HMR) |

Future Ready (Pluggable): PostGIS / TimescaleDB, Python/GDAL processing microservice, queue for large area jobs, JWT / OTP auth, offline-enabled PWA.

---
## 4. Data Flow (High Level)
```
Farmer Auth → FarmerContext (ID, plots, requests)
        │
        ├─ Visit Request Form → POST backend → status persisted
        │
        ├─ Plot Mapping → polygon points → area → credits → achievements
        │
        └─ Analysis Screen
             ├─ Fetch NDVI classes (retry + cache + fallback)
             ├─ Compute baseline carbon (before %)
             ├─ Compute current delta & provisional credits
             └─ Render vegetation + carbon + imagery widgets
```

---
## 5. Carbon & NDVI Computation (Simplified)
Pseudo-pipeline:
```
For each class c in {bare, sparse, moderate, dense}:
  weighted_AGB += (percent_c / 100) * (k * NDVI_midpoint_c)
AGB_kg_per_ha = weighted_AGB
Carbon_tC_per_ha = AGB_kg_per_ha * CF * (1 + rootRatio) / 1000
Incremental_tC = (Current - Previous)
Incremental_CO2e_t = Incremental_tC * 44/12
Net = (Incremental_CO2e_t - buffer - uncertainty)
```
All coefficients are placeholders pending calibration.

---
## 6. Local Development
### Prerequisites
- Node.js 18+
- npm

### Install & Run
```bash
npm install
npm run dev -- --port 5174
```
Open: http://localhost:5174/

### Build
```bash
npm run build
```
### Preview Build
```bash
npm run preview -- --port 5173
```

---
## 7. Environment & Configuration
Current prototype uses hardcoded endpoints & local storage. Future `.env` (examples):
```
VITE_SATELLITE_API_BASE=https://satellitefarm.onrender.com
VITE_VISIT_API_BASE=https://nabard-visitor-backend.onrender.com
VITE_AUTH_MODE=demo
```
Integrate via `import.meta.env.VITE_*` and fallback defaults.

---
## 8. Project Structure
```
src/
  context/        Auth & Farmer state providers
  screens/        Feature pages (Analysis, Dashboard, VisitRequest, etc.)
  components/     Widgets (charts, images, revenue, logout)
  styles.css      Global styles
  App.tsx         Routing + providers wrapper
```

---
## 9. Deployment Notes
- Static frontend can deploy on Netlify / Vercel / Render static site.
- Ensure CORS permitted on backend endpoints.
- Add uptime & latency checks for satellite and visit APIs.
- Consider service worker for offline queueing of visit requests.

---
## 10. Roadmap
Short Term:
- Proper agent portal (approve / schedule / complete visit requests)
- Persist notifications & achievements (IndexedDB / backend)
- Fine-grained error taxonomy (timeout vs 500 vs parse)
- Secure auth (OTP / federated)

Mid Term:
- Methane (CH₄) reduction model for AWD adoption tracking
- Tree biomass stratification (allometry library integration)
- Multi-temporal NDVI trend sparkline
- Offline-capable PWA + photo evidence capture

Long Term:
- Registry export (Verra/Gold Standard draft JSON)
- MRV audit trail & cryptographic attestation
- Automated anomaly detection (cloud/shadow masks)
- Aggregated portfolio analytics (agent dashboard)

---
## 11. Contributing
1. Fork & clone
2. Create feature branch: `feat/your-feature`
3. Commit using conventional style
4. Open PR with concise summary + screenshot/GIF

---
## 12. License
Prototype stage – license to be finalized (default: All rights reserved for now). Add an explicit LICENSE file before external contributions.

---
## 13. Disclaimers
- All carbon numbers are provisional & illustrative.
- NDVI classification depends on upstream service availability; fallback data explicitly labeled.
- Demo authentication is not secure; do not use for production identities.

---
## 14. Contact / Maintainers
- Core Maintainer: (Add name / email)
- Issues: GitHub Issues tab
- Feature Requests: Open an issue with prefix `[Feature]`

---
## 15. Screenshots (Placeholders)
Add after capturing:
- Dashboard Overview
- Analysis (Vegetation + Carbon Panel)
- Visit Request Form
- Plot Mapping Interaction

---
*Replace placeholder links and enhance sections as production maturity increases.*
