import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  User, 
  Users, 
  BarChart3,
  Kanban,
  Settings,
  HelpCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

const Sidebar = () => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics'
    },
    {
      path: '/projects',
      label: 'Projects',
      icon: FolderOpen,
      description: 'Manage Projects'
    },
    {
      path: '/projects/kanban',
      label: 'Kanban Board',
      icon: Kanban,
      description: 'Visual Task Management'
    },
    {
      path: '/tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Task Management'
    },
    {
      path: '/time-tracking',
      label: 'Time Tracking',
      icon: Clock,
      description: 'Track Work Hours'
    },
    ...(isAdmin ? [{
      path: '/users',
      label: 'Users',
      icon: Users,
      description: 'User Management'
    }] : []),
    {
      path: '/profile',
      label: 'Profile',
      icon: User,
      description: 'Your Profile'
    },
  ]

  const bottomNavItems = [
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
    },
    {
      path: '/help',
      label: 'Help',
      icon: HelpCircle,
    },
  ]

     return (
     <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white/80 backdrop-blur-xl border-r border-white/20 min-h-screen transition-all duration-300 ease-in-out`}>
       {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link group relative ${
                  isActive ? 'active' : ''
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && (
                <div className="flex-1">
                  <span className="block">{item.label}</span>
                  <span className="text-xs text-gray-400 group-hover:text-gray-500">
                    {item.description}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 pb-6 border-t border-gray-100/50 pt-6">
        <div className="space-y-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link group relative ${
                  isActive ? 'active' : ''
                }`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="px-3 pb-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full nav-link justify-center"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <BarChart3 className="w-5 h-5" />
          {!isCollapsed && <span>Toggle</span>}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="px-3 pb-6">
          <div className="card p-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0ea5e9&color=fff&size=128`}
                  alt={user?.name}
                  className="h-10 w-10 rounded-lg object-cover ring-2 ring-white/50"
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success-500 border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar 