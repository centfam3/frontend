import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, itemType = 'item' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center animate-scaleIn">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          <FaExclamationTriangle />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h3>
        <p className="text-gray-500 mb-8">
          Are you sure you want to delete <span className="font-bold text-gray-800">{itemName}</span>? 
          This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
