import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white text-center px-4">
      <AlertTriangle size={64} className="mb-4 text-yellow-300" />
      <h1 className="text-5xl font-bold mb-2">404</h1>
      <p className="text-lg mb-6">Oops! The page you’re looking for doesn’t exist.</p>

      <div className="flex gap-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>

        {/* Home Button */}
        <Link
          to="/chat"
          className="flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
        >
          <Home size={18} />
          Home
        </Link>
      </div>
    </div>
  );
}
