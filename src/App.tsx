import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { FarmerProvider } from "./context/FarmerContext";
import { AuthProvider } from "./context/AuthContext";
import HomeScreen from "./screens/HomeScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import FarmDetailsScreen from "./screens/FarmDetailsScreen";
import AnalysisScreen from "./screens/AnalysisScreen";
import StoreScreen from "./screens/StoreScreen";
import VisitRequestScreen from "./screens/VisitRequestScreen";
import LogoutButton from "./components/LogoutButton";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FarmerProvider>
        <div className="app-shell">
          <LogoutButton />
          <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/farm-details" element={<FarmDetailsScreen />} />
          {/* Legacy achievements path redirects to analysis */}
          <Route path="/achievements" element={<Navigate to="/analysis" replace />} />
          <Route path="/analysis" element={<AnalysisScreen />} />
          <Route path="/store" element={<StoreScreen />} />
          <Route path="/visit-request" element={<VisitRequestScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </FarmerProvider>
    </AuthProvider>
  );
};

export default App;
