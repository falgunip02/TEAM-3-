import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, ShoppingCart, Menu as MenuIcon } from 'lucide-react'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const role = (user?.role || '').toLowerCase()
  const isStaffOrAdmin = role === 'staff' || role === 'admin'
  const isEmployee = role === 'employee'

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MenuIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gray-900">CafeOrder</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition-colors">Home</Link>

            {/* Both roles still go to /menu; staff/admin will see AdminMenu automatically */}
            <Link to="/menu" className="text-gray-700 hover:text-primary transition-colors">Menu</Link>

            {/* My Orders ONLY for employees */}
            {user && isEmployee && (
              <Link to="/orders" className="text-gray-700 hover:text-primary transition-colors">
                My Orders
              </Link>
            )}

            {/* Admin link ONLY for staff/admin */}
            {user && isStaffOrAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  {/* My Orders — employees only */}
                  {isEmployee && (
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      My Orders
                    </DropdownMenuItem>
                  )}

                  {/* Admin — staff/admin only */}
                  {isStaffOrAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                <Button onClick={() => navigate('/register')}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
