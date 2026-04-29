import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { HiMenuAlt2 } from 'react-icons/hi'
import { FaHome, FaTrophy, FaCalendarAlt, FaBullhorn, FaSignOutAlt, FaChevronDown, FaGraduationCap, FaRunning } from 'react-icons/fa'

const studentNavItems = [
  {
    section: 'Main',
    items: [
      { label: 'Home', icon: <FaHome />, to: '/student-dashboard' },
    ],
  },
  {
    section: 'Academic',
    items: [
      {
        label: 'My Achievements',
        icon: <FaTrophy />,
        to: '/student-dashboard/achievements',
      },
      {
        label: 'Event Participation',
        icon: <FaCalendarAlt />,
        to: '/student-dashboard/events',
      },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Announcements', icon: <FaBullhorn />, to: '/student-dashboard/announcements' },
    ],
  },
]

export default function StudentSidebar({ isCollapsed: externalIsCollapsed, onToggle, activePage, onLogout }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed
  const location = useLocation()

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalCollapsed(!internalCollapsed)
    }
  }

  const toggleExpand = (item) => {
    setExpandedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }))
  }

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-orange-100 flex flex-col transition-all duration-500 ease-in-out overflow-hidden shadow-[4px_0_24px_rgba(251,146,60,0.05)] z-30`}>
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 py-4 mb-2">
        <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100 visible'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-200/50">
            <FaGraduationCap size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-800 tracking-tight leading-none">Student Portal</span>
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mt-1">Dashboard</span>
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
        {studentNavItems.map((section) => (
          <div key={section.section} className="space-y-2">
            {!isCollapsed && (
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                {section.section}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isItemActive = location.pathname === item.to || (item.subItems && item.subItems.some(sub => location.pathname === sub.to))
                const isExpanded = expandedItems[item.label]

                return (
                  <div key={item.label} className="px-1">
                    {item.subItems ? (
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={`w-full group relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 border ${
                          isItemActive
                            ? 'bg-orange-50 border-orange-100 text-orange-600'
                            : 'bg-transparent border-transparent text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isItemActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-600'}`}>
                            {item.icon}
                          </span>
                          {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                        </div>
                        
                        {!isCollapsed && (
                          <FaChevronDown size={10} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-orange-600' : 'text-slate-300'}`} />
                        )}

                        {/* Active Indicator Bar */}
                        {isItemActive && !isCollapsed && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-orange-600"></div>
                        )}
                      </button>
                    ) : (
                      <NavLink
                        to={item.to}
                        end={item.to === '/student-dashboard'}
                        className={({ isActive }) => `w-full group relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 border ${
                          isActive
                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100'
                            : 'bg-transparent border-transparent text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                        }`}
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-600'}`}>
                                {item.icon}
                              </span>
                              {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                            </div>

                            {/* Active Indicator Bar */}
                            {isActive && !isCollapsed && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white"></div>
                            )}
                          </>
                        )}
                      </NavLink>
                    )}

                    {/* Sub Items */}
                    {item.subItems && isExpanded && !isCollapsed && (
                      <div className="mt-2 ml-4 pl-4 border-l-2 border-orange-100 space-y-1 animate-fadeIn">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.to}
                            to={subItem.to}
                            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                              isActive
                                ? 'bg-orange-50 text-orange-600 shadow-sm'
                                : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
                            }`}
                          >
                            {({ isActive }) => (
                              <>
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-orange-600 scale-125' : 'bg-slate-300 group-hover:bg-orange-300'}`}></div>
                                {subItem.label}
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
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
              <FaSignOutAlt size="14" className="group-hover:rotate-12 transition-transform" />
            </div>
            {!isCollapsed && <span className="text-sm">Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  )
}