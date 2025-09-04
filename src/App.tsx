import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FarmerProvider } from "./context/FarmerContext";
import HomeScreen from "./screens/HomeScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import FarmDetailsScreen from "./screens/FarmDetailsScreen";
import AchievementsScreen from "./screens/AchievementsScreen";
import StoreScreen from "./screens/StoreScreen";
import VisitRequestScreen from "./screens/VisitRequestScreen";

const App: React.FC = () => {
  return (
    <FarmerProvider>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/farm-details" element={<FarmDetailsScreen />} />
          <Route path="/achievements" element={<AchievementsScreen />} />
          <Route path="/store" element={<StoreScreen />} />
          <Route path="/visit-request" element={<VisitRequestScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </FarmerProvider>
  );
};

export default App;
