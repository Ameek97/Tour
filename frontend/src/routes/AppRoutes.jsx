import { Route, Routes } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import BookingDetail from '../pages/BookingDetail';
import Bookings from '../pages/Bookings';
import ForgotPassword from '../pages/ForgotPassword';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import ResetPassword from '../pages/ResetPassword';
import Signup from '../pages/Signup';
import TourDetails from '../pages/TourDetails';
import TourManagement from '../pages/TourManagement';
import Tours from '../pages/Tours';
import TourStats from '../pages/TourStats';
import RoleRoute from '../components/RoleRoute';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/stats" element={<TourStats />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tours"
          element={
            <ProtectedRoute>
              <Tours />
            </ProtectedRoute>
          }
        />
        <Route path="/tours/:id" element={<TourDetails />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['admin', 'lead guide']}>
                <TourManagement />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
