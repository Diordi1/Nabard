import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export type RevenueGrowthChartProps = {
  months: string[];
  revenues: number[];
};

const RevenueGrowthChart: React.FC<RevenueGrowthChartProps> = ({ months, revenues }) => {
  const data = {
    labels: months,
    datasets: [
      {
        label: "Revenue",
        data: revenues,
        fill: false,
        borderColor: "#1a8e3f",
        backgroundColor: "#1a8e3f",
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Revenue Growth (Month to Month)" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: string | number) {
            if (typeof value === 'number') return `₹${value.toLocaleString()}`;
            return value;
          }
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default RevenueGrowthChart;
