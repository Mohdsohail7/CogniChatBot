// src/pages/GoogleCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import axiosInstance from "../utils/axios";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      try {
        // get session from Supabase
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session) {
          console.error("No session found:", error);
          navigate("/login");
          return;
        }

        const access_token = data.session.access_token;

        // ✅ send token to backend to get JWT + user
        const res = await axiosInstance.post("/auth/google-login", {
          access_token,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/chat");
      } catch (err) {
        console.error("Google login failed:", err);
        navigate("/login");
      }
    };

    handleGoogleLogin();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white text-lg font-bold">
      Signing you in with Google...
    </div>
  );
}
