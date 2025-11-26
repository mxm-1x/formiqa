import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PresenterDashboard from "./pages/PresenterDashboard";
import CreateSession from "./pages/CreateSession";
import LiveSession from "./pages/LiveSession";
import JoinSession from "./pages/JoinSession";
import ViewerFeedback from "./pages/ViewerFeedback";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import DashboardLayout from "./components/DashboardLayout";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/presenter"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<PresenterDashboard />} />
            <Route path="create" element={<CreateSession />} />
            <Route path="session/:id" element={<LiveSession />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/join" element={<JoinSession />} />
          <Route path="/join/:code" element={<ViewerFeedback />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}
