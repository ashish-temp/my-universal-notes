import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Notes from "./components/Notes";
import Auth from "./components/Auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌙 theme
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🔐 auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="center-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>My Universal Notes</h1>

        {/* RIGHT SIDE */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "0.4rem",
          }}
        >
          {/* ✅ USER EMAIL */}
          {user && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
              }}
            >
              {user.email}
            </span>
          )}

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              className="secondary-btn"
              onClick={() =>
                setTheme(theme === "light" ? "dark" : "light")
              }
            >
              {theme === "light" ? "🌙 Dark" : "☀ Light"}
            </button>

            {user && (
              <button
                className="secondary-btn"
                onClick={() => auth.signOut()}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🔁 CONDITIONAL RENDER */}
      {user ? <Notes user={user} /> : <Auth />}
    </div>
  );
}

export default App;
