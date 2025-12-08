// src/App.jsx
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./components/Auth.jsx";
import Notes from "./components/Notes.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="center-screen">Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>My Universal Notes</h1>
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          <button className="secondary-btn" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>
      </header>
      <Notes user={user} />
    </div>
  );
}

export default App;
