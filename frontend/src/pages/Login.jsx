import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../utils/api";
import supabase from "../utils/supabaseClient";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: ""});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { token, user } = await loginUser(form);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/chat") // redirect after login
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // login with google
  const handleGoogleOAuthLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/google-callback",
      },
    });
    if (error) console.error("Supabase login error:", error);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 max-w-md w-full transform hover:scale-105 transition duration-500">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Login</h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {error && <p className="text-red-300 text-sm">{error}</p>}
          <button
            type="submit"
            disabled = {loading}
            className="w-full py-3 rounded-lg bg-yellow-400 text-black font-semibold shadow-md hover:bg-yellow-300 transition duration-300"
          >
            {loading ? "Logging in...": "Login"}
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-yellow-300 hover:underline">
            Register
          </Link>
        </p>

        <div className="mt-6">
          <button 
          onClick={() => handleGoogleOAuthLogin()}
          className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:bg-red-400 transition duration-300">
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}
