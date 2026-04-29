import { useState, useEffect, useRef } from 'react'
import { MdSearch, MdKeyboardArrowDown, MdLogout } from 'react-icons/md'
import { FaBell } from 'react-icons/fa'

export default function Navbar({ 
  title = 'Faculty Dashboard', 
  subtitle = 'A.Y. 2025–2026 • 2nd Semester', 
  searchPlaceholder = 'Search...', 
  onNotificationClick, 
  user, 
  onLogout,
  searchValue = '',
  onSearchChange,
  unreadCount = 0
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const getInitials = (name) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dropdownItems = []

  return (
    <div className="h-16 bg-white border-b border-orange-100 px-6 flex items-center justify-between shadow-sm">
      {/* Left Section */}
      <div className="flex-1">
        <p className="text-base font-bold text-black">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-8">
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 w-52 transition-all duration-200 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.1)]">
          <MdSearch className="text-gray-300 text-base" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-transparent outline-none text-xs text-black placeholder-gray-300 w-full"
          />
        </div>

        {/* Notification Button */}
        <button 
          onClick={onNotificationClick}
          className="relative w-9 h-9 rounded-xl border border-orange-100 bg-white flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 cursor-pointer"
        >
          <FaBell className="text-gray-500 text-lg" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-orange-100"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-orange-100 bg-white cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
          >
            {/* Navbar (Top Right Corner) Display the user name */}
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
              {user?.fullname ? getInitials(user.fullname) : (user?.name ? getInitials(user.name) : 'A')}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-black truncate max-w-[100px]">{user?.fullname || user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role || 'Faculty'}</p>
            </div>
            <MdKeyboardArrowDown className={`text-gray-300 text-sm transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-14 right-0 w-56 bg-white rounded-xl border border-orange-100 shadow-xl shadow-orange-100/50 z-50 overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="px-4 py-3 border-b border-orange-50 bg-orange-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {user?.fullname ? getInitials(user.fullname) : (user?.name ? getInitials(user.name) : 'A')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black truncate">{user?.fullname || user?.name || 'User'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email || ''}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items - Removed for faculty user independence */}

              {/* Divider */}
              <div className="border-t border-orange-100 my-0"></div>

              {/* Logout */}
              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              >
                <MdLogout size={16} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
