import { Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Tours from '../pages/Tours';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/tours"
          element={
            <ProtectedRoute>
              <Tours />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
