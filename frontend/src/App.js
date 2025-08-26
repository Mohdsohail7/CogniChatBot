import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import ProtectedRoute from './utils/ProtectedRoute';
import GoogleCallback from './pages/GoogleCallback';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
    <Toaster position="top-center"
    toastOptions={{
      success: {
        style: {
          background: "#9bba9cff",
          color: "#fff",
        }
      },
      error: {
        style: {
          background: "#9bba9cff",
          color: "#fff"
        }
      }
    }} />
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected route */}

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
