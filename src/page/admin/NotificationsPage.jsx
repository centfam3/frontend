import React, { useState, useMemo } from 'react';
import { FaUserPlus, FaCalendarPlus, FaEdit, FaBullhorn, FaCheckCircle, FaTrash, FaCheckDouble, FaBell } from 'react-icons/fa';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('All');

  const filteredNotifications = useMemo(() => {
    if (filterType === 'All') return notifications;
    return notifications.filter(notif => notif.type === filterType);
  }, [notifications, filterType]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getIconStyles = (type) => {
    switch (type) {
      case 'UserPlus': return { icon: <FaUserPlus />, styles: 'bg-blue-50 text-blue-500 border-blue-100' };
      case 'CalendarPlus': return { icon: <FaCalendarPlus />, styles: 'bg-indigo-50 text-indigo-500 border-indigo-100' };
      case 'Edit': return { icon: <FaEdit />, styles: 'bg-yellow-50 text-yellow-500 border-yellow-100' };
      case 'Bullhorn': return { icon: <FaBullhorn />, styles: 'bg-red-50 text-red-500 border-red-100' };
      default: return { icon: <FaCheckCircle />, styles: 'bg-green-50 text-green-500 border-green-100' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-sm border border-indigo-100">
            <FaBell />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Notifications Center</h2>
            <p className="text-sm text-gray-400 font-medium">Keep track of updates and important alerts</p>
          </div>
        </div>

        <button 
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-sm font-bold shadow-sm shadow-indigo-100"
        >
          <FaCheckDouble /> Mark All Read
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto pb-2 sm:pb-4">
        {['All', 'UserPlus', 'CalendarPlus', 'Edit', 'Bullhorn'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              filterType === type 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-white hover:text-indigo-600 hover:border-indigo-100'
            }`}
          >
            {type === 'All' ? 'All Alerts' : type === 'UserPlus' ? 'New Registrations' : type === 'CalendarPlus' ? 'Event Assignments' : type === 'Edit' ? 'Updates' : 'Announcements'}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.map(notif => {
          const { icon, styles } = getIconStyles(notif.type);
          return (
            <div 
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id)}
              className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:shadow-md transition-all group cursor-pointer ${
                !notif.isRead ? 'border-indigo-100 bg-indigo-50/20' : 'border-gray-50'
              }`}
            >
              <div className="flex items-start sm:items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border shrink-0 ${styles}`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>{notif.timestamp}</span>
                    <span className={`flex items-center gap-1 ${!notif.isRead ? 'text-indigo-500' : 'text-green-500'}`}>
                      {notif.isRead ? <FaCheckCircle /> : <FaBell />} {notif.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notif.isRead && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                    className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                    title="Mark as Read"
                  >
                    <FaCheckCircle size={14} />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                  className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                  title="Delete Alert"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="p-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBell className="text-gray-200 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No notifications found</h3>
            <p className="text-gray-400 text-sm mt-1">Try selecting a different category or adjust filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
