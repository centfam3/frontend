import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaUsers, FaCalendarAlt, FaClipboardList, FaEye, FaBullhorn, FaBell } from 'react-icons/fa'
import { MdLogout, MdDashboard, MdPeople, MdMenuBook, MdCalendarToday, MdBarChart, MdCheckCircle, MdAssignment, MdChat, MdAccountCircle, MdSettings } from 'react-icons/md'
import { HiMenuAlt2 } from 'react-icons/hi'

const adminNavItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: <MdDashboard />, to: '/dashboard' },
      { label: 'Student Management', icon: <FaUsers />, to: '/dashboard/students' },
      { label: 'Faculty Management', icon: <MdPeople />, to: '/dashboard/faculty' },
      { label: 'Event Management', icon: <FaCalendarAlt />, to: '/dashboard/events' },
      { label: 'Event Assignment', icon: <FaClipboardList />, to: '/dashboard/assignment' },
      { label: 'Event Handler View', icon: <FaEye />, to: '/dashboard/handler-view' },
      { label: 'Announcements', icon: <FaBullhorn />, to: '/dashboard/announcements' },
      { label: 'Reports', icon: <MdBarChart />, to: '/dashboard/reports' },
    ],
  },
];

const facultyAdminNavItems = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: <MdDashboard />, to: '/dashboard' },
      { label: 'Student Management', icon: <FaUsers />, to: '/dashboard/students' },
      { label: 'Event Management', icon: <FaCalendarAlt />, to: '/dashboard/events' },
      { label: 'Event Assignment', icon: <FaClipboardList />, to: '/dashboard/assignment' },
      { label: 'Event Handler View', icon: <FaEye />, to: '/dashboard/handler-view' },
      { label: 'Announcements', icon: <FaBullhorn />, to: '/dashboard/announcements' },
      { label: 'Reports', icon: <MdBarChart />, to: '/dashboard/reports' },
      { label: 'My Profile', icon: <MdAccountCircle />, to: '/dashboard/profile' },
    ],
  },
];

export default function Sidebar({ isCollapsed: externalIsCollapsed, onToggle, activePage, onLogout, user }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed

  const getInitials = (name) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalCollapsed(!internalCollapsed)
    }
  }

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : facultyAdminNavItems;
  
  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-orange-100 flex flex-col transition-all duration-500 ease-in-out overflow-hidden shadow-[4px_0_24px_rgba(251,146,60,0.05)] z-30`}>
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 py-4 mb-2">
        <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-200/50">
            <FaClipboardList size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-800 tracking-tight leading-none">{isAdmin ? 'Admin' : 'Faculty'} Panel</span>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-1">{isAdmin ? 'Management' : 'Dashboard'}</span>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 ${isCollapsed ? 'mx-auto' : ''}`}
        >
          <HiMenuAlt2 size={22} className={isCollapsed ? 'rotate-180' : ''} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-8 custom-scrollbar pt-2">
        {navItems.map((section, idx) => (
          <div key={section.section} className="space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                {section.section}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                return (
                  <div key={item.to} className="px-1">
                    <NavLink
                      to={item.to}
                      end={item.to === '/dashboard'}
                      className={({ isActive }) => `w-full group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 border ${
                        isActive
                          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                          : 'bg-transparent border-transparent text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-600'
                          }`}>
                            {item.icon}
                          </span>
                          
                          {!isCollapsed && (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm font-bold tracking-tight">{item.label}</span>
                              {item.badge && (
                                <span className={`ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-orange-100 text-orange-600'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Active Indicator Bar */}
                          {isActive && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout Action */}
      <div className="p-4 mt-auto">
        <div className={`bg-orange-50/50 rounded-[2rem] p-2 border border-orange-100 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
          <button 
            onClick={onLogout}
            className={`w-full group flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 font-bold ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-rose-100 transition-all">
              <MdLogout size={14} className="group-hover:rotate-12 transition-transform" />
            </div>
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
