import "../assets/styles/base.css";
import "./App.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { getSession, signOut } from "@nexus/api";
import type { AuthUser } from "@nexus/api";
import LoginPage from "../features/auth/LoginPage";
import { Sidebar } from "./Sidebar/Sidebar";
import { AppRoute } from "../constants/routes";

const CentralCommand = lazy(() => import("../features/central-command/CentralCommand"));
const PulseDashboard = lazy(() => import("../features/pulse/PulseDashboard"));
const EnterpriseScheduler = lazy(() => import("../features/scheduler/EnterpriseScheduler"));

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession()
      .then((u) => { setUser(u); setLoading(false); })
      .catch(() => { setUser(null); setLoading(false); });
  }, []);

  async function handleLogout() {
    await signOut();
    setUser(null);
  }

  if (loading) {
    return <div className="app-loading" />;
  }

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }

  return (
    <HashRouter>
      <div className="app-shell">
        <Sidebar handleLogout={handleLogout} />
        <main className="app-shell__main">
          <Suspense fallback={<div className="app-loading" />}>
            <Routes>
              <Route path={AppRoute.Pulse} element={<CentralCommand user={user} />} />
              <Route path={AppRoute.Map} element={<PulseDashboard user={user} />} />
              <Route path={AppRoute.Scheduler} element={<EnterpriseScheduler />} />
              <Route path="*" element={<Navigate to={AppRoute.Pulse} replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
