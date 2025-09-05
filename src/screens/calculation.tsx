import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register required radar chart components once at module load
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// NDVI class thresholds provided
// Bare/Non-Veg:   -1.0 – 0.2
// Sparse Veg:      0.2 – 0.4
// Moderate Veg:    0.4 – 0.6
// Dense Veg:       0.6 – 1.0

/*
  This module provides a monthly carbon credit estimation scaffold based on:
  - Area (hectares)
  - Percentage cover of each NDVI vegetation class for the month
  Approach:
    1. Assign a representative midpoint NDVI to each class.
    2. Convert midpoint NDVI to above‑ground biomass (AGB) using a linear factor k (kg/ha per NDVI).
    3. Convert AGB to carbon (t C/ha), add root fraction.
    4. Compare with previous month carbon stock to estimate incremental sequestration.
    5. Convert incremental carbon (t C) to CO2e (t CO2e) and treat as provisional monthly credits.

  IMPORTANT: All coefficients are placeholders and MUST be calibrated with local field data.
*/

// Representative NDVI midpoints (can refine later)
const NDVI_MIDPOINTS = {
  bare: 0.10,      // (-1.0,0.2)
  sparse: 0.30,    // (0.2,0.4)
  moderate: 0.50,  // (0.4,0.6)
  dense: 0.80      // (0.6,1.0) – using 0.80 to reflect high vigour
};

export interface VegetationPercentages {
  bare: number;     // %
  sparse: number;   // %
  moderate: number; // %
  dense: number;    // %
}

export interface MonthlyCarbonInput {
  areaHa: number;                      // Area in hectares
  month: string;                       // e.g. '2025-09'
  percentages: VegetationPercentages;  // class cover distribution (must sum ~100)
  prevMonthStock_tC_perHa: number;     // Previous month total (AGB + belowground) carbon stock per ha
  k?: number;                          // Biomass coefficient (kg/ha per NDVI)
  CF?: number;                         // Carbon fraction of biomass
  rootRatio?: number;                  // Belowground:aboveground carbon ratio
  bufferRate?: number;                 // Fractional buffer (applied to positive increments)
  uncertainty?: number;                // Fractional uncertainty discount
}

export interface MonthlyCarbonResult {
  month: string;
  areaHa: number;
  AGB_kg_per_ha: number;
  carbon_current_tC_perHa: number;
  incremental_tC_perHa: number;          // (>=0) vs previous month
  incremental_CO2e_t: number;            // before buffer/uncertainty
  credits_after_buffer_uncertainty_t: number;
  buffer_applied_t: number;
  uncertainty_discount_t: number;
  assumptions: Record<string, any>;
}

// Core estimation function
export function estimateMonthlyCarbon(input: MonthlyCarbonInput): MonthlyCarbonResult {
  const {
    areaHa,
    month,
    percentages,
    prevMonthStock_tC_perHa,
    k = 7500,          // placeholder linear biomass coefficient
    CF = 0.45,         // carbon fraction
    rootRatio = 0.20,  // 20% additional belowground carbon
    bufferRate = 0.15, // 15% permanence/risk buffer
    uncertainty = 0.10 // 10% conservative uncertainty discount
  } = input;

  // Validate percentages
  const sum = percentages.bare + percentages.sparse + percentages.moderate + percentages.dense;
  if (Math.abs(sum - 100) > 1e-6) {
    throw new Error(`Percentages must sum to 100 (got ${sum.toFixed(3)})`);
  }

  // Weighted AGB (kg/ha)
  const AGB = (
    (percentages.bare / 100) * (k * NDVI_MIDPOINTS.bare) +
    (percentages.sparse / 100) * (k * NDVI_MIDPOINTS.sparse) +
    (percentages.moderate / 100) * (k * NDVI_MIDPOINTS.moderate) +
    (percentages.dense / 100) * (k * NDVI_MIDPOINTS.dense)
  );

  const C_AGB = AGB * CF / 1000;               // t C/ha
  const C_total = C_AGB * (1 + rootRatio);     // total current carbon stock t C/ha

  // Incremental carbon vs previous month (no negatives credited)
  const incremental_tC_perHa = Math.max(0, C_total - prevMonthStock_tC_perHa);

  // Convert incremental carbon to CO2e (t) across area
  const incremental_CO2e_t = incremental_tC_perHa * (44 / 12) * areaHa;

  // Apply buffer to sequestration portion only
  const buffer_applied_t = incremental_CO2e_t * bufferRate;
  const afterBuffer = incremental_CO2e_t - buffer_applied_t;

  // Apply uncertainty discount
  const uncertainty_discount_t = afterBuffer * uncertainty;
  const credits_after_buffer_uncertainty_t = afterBuffer - uncertainty_discount_t;

  return {
    month,
    areaHa,
    AGB_kg_per_ha: AGB,
    carbon_current_tC_perHa: C_total,
    incremental_tC_perHa,
    incremental_CO2e_t,
    credits_after_buffer_uncertainty_t,
    buffer_applied_t,
    uncertainty_discount_t,
    assumptions: {
      k,
      CF,
      rootRatio,
      bufferRate,
      uncertainty,
      NDVI_MIDPOINTS,
      prevMonthStock_tC_perHa
    }
  };
}

// Lightweight radar chart of vegetation class percentage distribution
export const VegetationRadar: React.FC<{ percentages: VegetationPercentages }> = ({ percentages }) => {
  const data = {
    labels: ['Bare', 'Sparse', 'Moderate', 'Dense'],
    datasets: [
      {
        label: 'Cover %',
        data: [
          percentages.bare,
          percentages.sparse,
          percentages.moderate,
          percentages.dense
        ],
        backgroundColor: 'rgba(34,197,94,0.25)',
        borderColor: 'rgba(34,197,94,1)',
        pointBackgroundColor: 'rgba(34,197,94,1)',
        borderWidth: 2,
        fill: true
      }
    ]
  };

  const options: any = {
    responsive: true,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, backdropColor: 'transparent' },
        grid: { color: 'rgba(0,0,0,0.15)' },
        angleLines: { color: 'rgba(0,0,0,0.2)' }
      }
    },
    plugins: {
      legend: { display: true }
    }
  };
  return <Radar data={data} options={options} />;
};

// Simple demo React component (placeholder) that could be integrated later.
// For now it just shows a calculated example.
const CalculationDemo: React.FC = () => {
  const result = estimateMonthlyCarbon({
    areaHa: 2.0,
    month: '2025-09',
    percentages: { bare: 5, sparse: 15, moderate: 40, dense: 40 },
    prevMonthStock_tC_perHa: 1.60,
  });

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h3>Monthly Carbon Estimation Demo</h3>
      <p style={{ fontSize: 14 }}>Month: {result.month}</p>
      <div style={{ maxWidth: 420, marginBottom: '1rem' }}>
        <VegetationRadar percentages={{ bare: 5, sparse: 15, moderate: 40, dense: 40 }} />
      </div>
      <ul style={{ fontSize: 13, lineHeight: 1.4 }}>
        <li>Area: {result.areaHa} ha</li>
        <li>AGB: {result.AGB_kg_per_ha.toFixed(1)} kg/ha</li>
        <li>Current Carbon Stock: {result.carbon_current_tC_perHa.toFixed(3)} t C/ha</li>
        <li>Incremental Carbon (vs prev): {result.incremental_tC_perHa.toFixed(3)} t C/ha</li>
        <li>Incremental CO2e: {result.incremental_CO2e_t.toFixed(3)} t CO2e</li>
        <li>Buffer Applied: {result.buffer_applied_t.toFixed(3)} t CO2e</li>
        <li>Uncertainty Discount: {result.uncertainty_discount_t.toFixed(3)} t CO2e</li>
        <li>Credits (net monthly): {result.credits_after_buffer_uncertainty_t.toFixed(3)} t CO2e</li>
      </ul>
      <small style={{ color: '#555' }}>All numbers are illustrative; coefficients require local calibration.</small>
    </div>
  );
};

export default CalculationDemo;
