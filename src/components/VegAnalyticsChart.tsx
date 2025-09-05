import React from "react";

import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title);

export type VegAnalyticsChartProps = {
  prevMonth: Record<string, number>;
  currMonth: Record<string, number>;
};

const vegTypes = [
  "Bare/Non-Veg",
  "Sparse Veg",
  "Moderate Veg",
  "Dense Veg",
];

const VegAnalyticsChart: React.FC<VegAnalyticsChartProps> = ({ prevMonth, currMonth }) => {
  const data = {
    labels: vegTypes,
    datasets: [
      {
        label: "Previous Month",
        data: vegTypes.map((v) => prevMonth[v] || 0),
        backgroundColor: "rgba(99, 132, 255, 0.2)",
        borderColor: "rgba(99, 132, 255, 1)",
        pointBackgroundColor: "rgba(99, 132, 255, 1)",
      },
      {
        label: "Current Month",
        data: vegTypes.map((v) => currMonth[v] || 0),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        pointBackgroundColor: "rgba(75, 192, 192, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Vegetation Analytics by Month" },
    },
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 5,
        pointLabels: { font: { size: 14 } },
      },
    },
  };

  return <Radar data={data} options={options} />;
};

export default VegAnalyticsChart;
