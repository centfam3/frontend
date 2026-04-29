import React from 'react';
import { FaBell, FaUserPlus, FaCalendarPlus, FaBullhorn, FaCheckCircle, FaExclamationCircle, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

export default function NotificationDropdown({ isOpen, onClose, notifications = [], onMarkAsRead, onMarkAllAsRead }) {
  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'UserPlus': return <FaUserPlus className="text-blue-500" />;
      case 'CalendarPlus': return <FaCalendarPlus className="text-indigo-500" />;
      case 'Edit': return <FaEdit className="text-yellow-500" />;
      case 'Bullhorn': return <FaBullhorn className="text-red-500" />;
      case 'Success': return <FaCheckCircle className="text-green-500" />;
      case 'CheckCircle': return <FaCheckCircle className="text-green-500" />;
      case 'ExclamationCircle': return <FaExclamationCircle className="text-red-500" />;
      case 'Urgent': return <FaExclamationCircle className="text-red-500" />;
      case 'Trash': return <FaTrash className="text-red-500" />;
      case 'Trophy': return <FaCheckCircle className="text-yellow-500" />;
      default: return <FaCheckCircle className="text-green-500" />;
    }
  };

  const getTimeAgo = (timestamp) => {
    if (timestamp === 'Recent') return 'Just now';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " years ago";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " months ago";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " days ago";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " hours ago";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " minutes ago";
      return Math.floor(seconds) + " seconds ago";
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl border border-orange-100 shadow-2xl z-50 overflow-hidden animate-scaleIn font-sans">
      <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
        <button 
          onClick={onMarkAllAsRead}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              onClick={() => onMarkAsRead?.(notif.id)}
              className={`px-5 py-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className={`text-xs leading-relaxed ${!notif.isRead ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                  {notif.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">
                  {getTimeAgo(notif.timestamp)}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5 shadow-sm shadow-indigo-200"></div>
              )}
            </div>
          ))
        ) : (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCheckCircle className="text-gray-200 text-xl" />
            </div>
            <p className="text-xs text-gray-400 font-medium italic">All caught up!</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-50 text-center">
        <button 
          onClick={onClose}
          className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 uppercase tracking-widest transition-colors py-1"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
}
