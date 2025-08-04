import { useAuthStore } from '@/store/authStore'
import { LogOut, User, Settings, Bell, Search, Menu } from 'lucide-react'
import NotificationsDropdown from './NotificationsDropdown'
import { useState } from 'react'

const Header = () => {
  const { user, logout } = useAuthStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Logo and Search */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 shadow-lg">
              <span className="text-lg font-bold text-white">PM</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient-primary">
                Project Management
              </h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, tasks..."
                className="h-10 w-64 rounded-xl border border-gray-200 bg-white/80 px-10 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <NotificationsDropdown />
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm border border-white/20">
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff&size=128`}
                  alt={user?.name}
                  className="h-8 w-8 rounded-lg object-cover ring-2 ring-white/50"
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success-500 border-2 border-white"></div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200 focus-ring">
                <User className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200 focus-ring">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-danger-600 hover:bg-danger-50/80 rounded-xl transition-all duration-200 focus-ring"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="border-t border-gray-100/50 bg-white/90 backdrop-blur-sm px-6 py-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white/80 px-10 py-2 text-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}

export default Header 