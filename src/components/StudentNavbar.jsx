import { useState, useEffect, useRef } from 'react'
import API_BASE_URL from '../config'
import { FaBell, FaUserCircle, FaCalendarPlus, FaTrophy, FaBullhorn, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { MdSearch, MdLogout } from 'react-icons/md'

export default function StudentNavbar({ onLogout, notifications = [], unreadCount = 0, onProfileOpen = () => {}, user, searchValue = '', onSearchChange, onMarkAsRead, onMarkAllAsRead }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const notificationRef = useRef(null)
  const profileRef = useRef(null)

  const getIcon = (type) => {
    switch (type) {
      case 'CalendarPlus': return <FaCalendarPlus className="text-orange-500" />
      case 'Trophy': return <FaTrophy className="text-yellow-500" />
      case 'Bullhorn': return <FaBullhorn className="text-blue-500" />
      case 'CheckCircle': return <FaCheckCircle className="text-green-500" />
      case 'ExclamationCircle': return <FaExclamationCircle className="text-red-500" />
      default: return <FaBell className="text-gray-400" />
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <div className="h-16 bg-white border-b border-orange-100 px-6 flex items-center justify-between shadow-sm">
        {/* Left Section */}
        <div className="flex-1">
          <p className="text-base font-bold text-black">Student Dashboard</p>
          <p className="text-xs text-gray-400 mt-0.5">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-8">
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 w-52 transition-all duration-200 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]">
            <MdSearch className="text-gray-300 text-base" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search..."
              className="bg-transparent outline-none text-xs text-black placeholder-gray-300 w-full"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 cursor-pointer"
            >
              <FaBell className="text-gray-500 text-lg" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden animate-scaleIn">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-white font-semibold flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Notifications</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAllAsRead?.();
                    }}
                    className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <FaBell className="mx-auto text-3xl mb-2 opacity-20" />
                      <p className="text-sm italic">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          onMarkAsRead?.(notif.id);
                        }}
                        className={`border-b border-gray-100 px-4 py-3 hover:bg-orange-50 cursor-pointer transition relative group ${!notif.isRead ? 'bg-orange-50/30' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${!notif.isRead ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <p className={`text-xs leading-relaxed ${!notif.isRead ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">{notif.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                onProfileOpen();
                setIsProfileOpen(false);
              }}
              className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-all duration-300 text-white overflow-hidden shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-105 active:scale-95 group"
            >
              {user?.photo ? (
                <img 
                  src={`${API_BASE_URL}/uploads/${user.photo}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                />
              ) : (
                <FaUserCircle className="text-xl transition-transform group-hover:scale-110" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
