import React from 'react'
import { LogOut, LayoutDashboard, Clock, Settings, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const SidebarMontir = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/dashboardmontir',
    },
    {
      name: 'Riwayat Service',
      icon: <Clock size={20} />,
      path: '/riwayatmontir',
    },
    {
      name: 'Profil',
      icon: <User size={20} />,
      path: '/profilmontir',
    },
    {
      name: 'Pengaturan',
      icon: <Settings size={20} />,
      path: '/pengaturanmontir',
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('user_id')
    navigate('/login')
  }

  return (
    <aside className="w-64 h-screen bg-blue-700 text-white fixed shadow-lg">
      {/* Header */}
      <div className="px-6 py-5 border-b border-blue-600">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Montir Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col px-4 py-6 gap-1">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
              location.pathname === item.path 
                ? 'bg-blue-600 shadow-md font-medium' 
                : 'hover:bg-blue-800/50'
            }`}
          >
            <span className="text-blue-200">
              {item.icon}
            </span>
            {item.name}
          </button>
        ))}

        {/* Logout Button */}
        <div className="mt-8 pt-4 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600/20 text-red-100 w-full transition-all"
          >
            <LogOut size={20} className="text-red-300" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Profile Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-blue-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <div>
          <p className="font-medium">Nama Montir</p>
          <p className="text-xs text-blue-200">Montir Bengkel</p>
        </div>
      </div>
    </aside>
  )
}

export default SidebarMontir