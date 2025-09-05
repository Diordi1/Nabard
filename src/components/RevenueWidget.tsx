import React from "react";

export type RevenueWidgetProps = {
  current: number;
  previous: number;
};

const RevenueWidget: React.FC<RevenueWidgetProps> = ({ current, previous }) => {
  const diff = current - previous;
  const percent = previous === 0 ? 100 : (diff / previous) * 100;
  const up = diff >= 0;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      padding: 20,
      marginBottom: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: 180,
      maxWidth: 300,
      height: 180
    }}>
      <div style={{ fontSize: 16, color: '#888', marginBottom: 4 }}>Revenue</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#1a8e3f' }}>₹{current.toLocaleString()}</div>
      <div style={{ fontSize: 14, color: up ? '#1a8e3f' : '#c62828', marginTop: 6 }}>
        {up ? '▲' : '▼'} {Math.abs(percent).toFixed(1)}% {up ? 'up' : 'down'} from last month
      </div>
      <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>
        Previous: ₹{previous.toLocaleString()}
      </div>
    </div>
  );
};

export default RevenueWidget;
