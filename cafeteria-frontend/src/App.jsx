import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
import StaffOrderManagement from './components/StaffOrderManagement' // you need to import this

// Context
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected Route Component
const ProtectedRoute = ({ children, requireStaff = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requireStaff && user.role !== 'staff') {
    return <Navigate to="/" />
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
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireStaff={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/orders"
              element={
                <ProtectedRoute requireStaff={true}>
                  <StaffOrderManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkoutpage"
              element={
                <ProtectedRoute>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
