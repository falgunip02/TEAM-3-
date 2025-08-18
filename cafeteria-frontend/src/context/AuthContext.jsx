import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import API_ENDPOINTS from '../config/api.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])




  const login = async (username, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.signin, {
  username,
  password
})

      const { accessToken, id, username: userUsername, email, role } = response.data
      const userData = { id, username: userUsername, email, role }

      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(userData))

      setToken(accessToken)
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const register = async (username, email, password, role = 'employee') => {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.signup, {
        username,
        email,
        password,
        role
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

