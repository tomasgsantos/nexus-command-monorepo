import "../assets/styles/base.css";
import "./App.css";
import { lazy, Suspense, useState, useEffect } from "react";
import { getSession, signOut } from "@nexus/api";
import type { AuthUser } from "@nexus/api";
import LoginPage from "../features/auth/LoginPage";

const PulseDashboard = lazy(() => import("../features/pulse/PulseDashboard"));

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
    <Suspense fallback={<div className="app-loading" />}>
      <PulseDashboard user={user} />
      <button type="button" className="app-signout-btn app-signout-btn--overlay" onClick={handleLogout}>
        Sign out
      </button>
    </Suspense>
  );
}

export default App;
