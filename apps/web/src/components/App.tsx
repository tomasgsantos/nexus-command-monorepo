import "../assets/styles/base.css";
import "./App.css";
import { useState, useEffect } from "react";
import { getSession, signOut } from "@nexus/api";
import type { AuthUser } from "@nexus/api";
import LoginPage from "../features/auth/LoginPage";

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
    <div className="app-dashboard">
      <div className="app-dashboard-content">
        <p>Welcome, {user.email}</p>
        <button type="button" className="app-signout-btn" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default App;
