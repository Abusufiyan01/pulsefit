import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  TrendingUp,
  Target,
  BarChart2,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  Command,
  Bell,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { getImageUrl } from '../utils/imageUrl'

const navLinks = [
  { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Workout', path: '/app/workout', icon: Dumbbell },
  { name: 'Nutrition', path: '/app/nutrition', icon: Apple },
  { name: 'Body & Photos', path: '/app/body', icon: TrendingUp },
  { name: 'Goals', path: '/app/goals', icon: Target },
  { name: 'Analytics', path: '/app/progress', icon: BarChart2 },
  { name: 'Settings', path: '/app/settings', icon: Settings },
]

const mobileBottomNav = [
  { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Workout', path: '/app/workout', icon: Dumbbell },
  { name: 'Nutrition', path: '/app/nutrition', icon: Apple },
  { name: 'Body', path: '/app/body', icon: TrendingUp },
  { name: 'Goals', path: '/app/goals', icon: Target },
]

export function AppLayout() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Get current section title
  const currentNav = navLinks.find((item) => location.pathname.startsWith(item.path))
  const pageTitle = currentNav ? currentNav.name : 'PulseFit'

  return (
    <div className="min-h-screen bg-bg text-current flex flex-col lg:flex-row">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed top-0 left-0 bottom-0 bg-bg-card border-r border-border z-30">
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <div
            onClick={() => navigate('/app/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-[#F0261B] flex items-center justify-center text-white shadow-glow">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight gradient-text">
              PulseFit
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF5A1F] to-[#F0261B] text-white shadow-md'
                    : 'text-muted hover:text-current hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User Card & Controls at Bottom */}
        <div className="p-4 border-t border-border space-y-3">
          {/* Quick theme toggle */}
          <div className="flex items-center justify-between px-2 py-1 text-xs text-muted">
            <span className="font-medium">Theme</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-surface hover:text-current transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* User profile summary */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface/50 border border-border">
            <div
              onClick={() => navigate('/app/profile')}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 overflow-hidden flex items-center justify-center font-bold text-xs shrink-0">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  'U'
                )}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-current truncate">{user?.name || 'PulseFit User'}</p>
                <p className="text-[10px] text-muted truncate">{user?.email || ''}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-surface transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-surface border border-border text-muted hover:text-current"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <h1 className="text-lg sm:text-xl font-bold text-current">{pageTitle}</h1>
          </div>

          {/* Actions on right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command Palette Trigger */}
            <button
              type="button"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })
                window.dispatchEvent(event)
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-muted hover:text-current transition-colors"
            >
              <Command className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="text-[10px] bg-bg-card px-1.5 py-0.5 rounded border border-border">Ctrl+K</kbd>
            </button>

            {/* Start workout quick button */}
            <button
              type="button"
              onClick={() => navigate('/app/workout/log')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#F0261B] text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-glow active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Workout</span>
            </button>

            {/* Theme toggle mobile */}
            <button
              type="button"
              onClick={toggleTheme}
              className="lg:hidden p-2 rounded-xl bg-surface border border-border text-muted hover:text-current"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile Avatar */}
            <div
              onClick={() => navigate('/app/profile')}
              className="w-9 h-9 rounded-full bg-primary-500/15 border border-primary-500/30 text-primary-500 overflow-hidden flex items-center justify-center font-bold text-sm cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all shrink-0"
              title="Profile"
            >
              {user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Fixed Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-bg-card/95 backdrop-blur-lg border-t border-border flex items-center justify-around py-2 px-1">
          {mobileBottomNav.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-primary-500 font-bold' : 'text-muted hover:text-current font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed top-0 bottom-0 left-0 w-72 bg-bg-card shadow-float z-10 flex flex-col p-6">
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-[#F0261B] flex items-center justify-center text-white">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span className="font-display font-extrabold text-lg gradient-text">
                  PulseFit
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-current"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
              {navLinks.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF5A1F] to-[#F0261B] text-white shadow-md'
                        : 'text-muted hover:text-current hover:bg-surface'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="pt-4 border-t border-border space-y-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppLayout
