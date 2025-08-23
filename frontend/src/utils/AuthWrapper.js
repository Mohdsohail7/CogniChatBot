import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import axiosInstance from "../utils/axios";

export default function AuthWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // get current supabase session
        const { data } = await supabase.auth.getSession();
        const access_token = data?.session?.access_token;

        if (access_token) {
          // send token to backend to exchange for JWT + user
          const result = await axiosInstance.post("/auth/google-login", {
            access_token,
          });

          localStorage.setItem("token", result.data.token);
          localStorage.setItem("user", JSON.stringify(result.data.user));
        }
      } catch (err) {
        console.error("Auth sync failed:", err);
        navigate("/login"); // if session fails, force login
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 text-xl font-semibold">
        Loading...
      </div>
    );
  }

  return children;
}
