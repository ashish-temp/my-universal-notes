// src/components/Auth.jsx
import { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // on success, App.jsx will get the logged-in user
    } catch (err) {
      setError(err.message);
    }
  };

    const handleForgotPassword = async () => {
    setError("");

    if (!email) {
      setError("Please enter your email to reset the password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="center-screen">
      <div className="auth-card">
        <h2>{isRegister ? "Create account" : "Welcome back"}</h2>
        <p className="auth-subtitle">
          {isRegister
            ? "Sign up to save your notes securely."
            : "Login to access your saved notes."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {!isRegister && (
            <button
              type="button"
              className="link-btn"
              style={{ alignSelf: "flex-end", marginTop: "-0.3rem" }}
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          )}


          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            {isRegister ? "Sign up" : "Login"}
          </button>
        </form>

        <button
          className="link-btn"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Already have an account? Login"
            : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
