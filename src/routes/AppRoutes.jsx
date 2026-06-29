import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SignupPage from '../auth/Signup';
import LoginPage from '../auth/login';
import ForgotPasswordPage from '../auth/ForgotPassword';
import ResetPasswordPage from '../auth/ResetPassword';
import LandingPage from '../pages/LandingPage';
import DynamicRoutes from './DynamicRoutes';
import TokenStatus from '../components/TokenStatus';
import { AuthProvider } from '../context/AuthContext';



function AppRoutesInner() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/*" element={<DynamicRoutes />} />
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <TokenStatus />
        <AppRoutesInner />
      </AuthProvider>
    </Router>
  );
}