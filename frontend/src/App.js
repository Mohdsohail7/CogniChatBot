import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
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
        {/* Default redirect */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
