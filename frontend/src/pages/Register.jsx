import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 max-w-md w-full transform hover:scale-105 transition duration-500">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Create Your Account
        </h1>
        <form className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-yellow-400 text-black font-semibold shadow-md hover:bg-yellow-300 transition duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-300 hover:underline">
            Login
          </Link>
        </p>

        <div className="mt-6">
          <button className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:bg-red-400 transition duration-300">
            Sign up with Google
          </button>
        </div>
      </div>
    </div>
  );
}
