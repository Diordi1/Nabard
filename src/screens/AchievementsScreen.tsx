import React from 'react';
import { Navigate } from 'react-router-dom';

// Legacy route preserved only for backward compatibility; immediately redirect to /analysis
const AchievementsScreen: React.FC = () => <Navigate to="/analysis" replace />;

export default AchievementsScreen;
