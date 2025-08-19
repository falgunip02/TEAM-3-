import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './components/HomePage'
import MenuPage from './components/MenuPage'
import OrderPage from './components/OrderPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ProfilePage from './components/ProfilePage'
import AdminDashboard from './components/AdminDashboard'
import CheckoutPage from './components/CheckoutPage'
import StaffOrderManagement from './components/StaffOrderManagement'

// Context
import { AuthProvider, useAuth } from './context/AuthContext'

// Route guard with role control
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = (user.role || '').toLowerCase()
    const allowed = allowedRoles.map(r => r.toLowerCase())
    if (!allowed.includes(role)) return <Navigate to="/" />
  }
  return children
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Single menu page that adapts based on user role */}
            <Route path="/menu" element={<MenuPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* My Orders — ONLY employees */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <OrderPage />
                </ProtectedRoute>
              }
            />

            {/* Profile — accessible to all authenticated users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin dashboard — staff + admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Staff order management — staff + admin */}
            <Route
              path="/staff/orders"
              element={
                <ProtectedRoute allowedRoles={['staff', 'admin']}>
                  <StaffOrderManagement />
                </ProtectedRoute>
              }
            />

            {/* Checkout — only for employees */}
            <Route
              path="/checkoutpage"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}