import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaQuestionCircle, FaTimes } from 'react-icons/fa';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'info', 'success', 'danger'
  showCancel = true
}) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          icon: 'text-green-500',
          button: 'bg-green-500 hover:bg-green-600',
          shadow: 'shadow-green-200'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600',
          shadow: 'shadow-blue-200'
        };
      case 'danger':
        return {
          bg: 'bg-red-50',
          icon: 'text-red-500',
          button: 'bg-red-500 hover:bg-red-600',
          shadow: 'shadow-red-200'
        };
      case 'warning':
      default:
        return {
          bg: 'bg-orange-50',
          icon: 'text-orange-500',
          button: 'bg-orange-500 hover:bg-orange-600',
          shadow: 'shadow-orange-200'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'info':
        return <FaQuestionCircle />;
      case 'danger':
        return <FaExclamationTriangle />;
      case 'warning':
      default:
        return <FaExclamationTriangle />;
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-scaleIn">
        <div className={`w-16 h-16 ${colors.bg} ${colors.icon} rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg ${colors.shadow}`}>
          {getIcon()}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        
        <p className="text-gray-600 mb-8 leading-relaxed text-sm">
          {message}
        </p>
        
        <div className="flex gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FaTimes size={16} />
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`${showCancel ? 'flex-1' : 'w-full'} px-6 py-3 ${colors.button} text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2`}
          >
            <FaCheckCircle size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
