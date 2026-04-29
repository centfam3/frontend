import React, { useState } from 'react';
import { FaTimes, FaUserPlus, FaKey } from 'react-icons/fa';

export default function StudentCreateModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    studentId: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to backend
    // For now, we'll create a skeleton student object
    const newStudent = {
      id: formData.studentId,
      name: 'New Student (Pending Profile)', // Placeholder
      email: '',
      phone: '',
      guardian: '',
      guardianContact: '',
      skills: [],
      hobbies: [],
      achievements: [],  // Changed from { academic: [], sports: [] } to simple array
      medicalInfo: '',
      assignedEvents: [],
      isProfileComplete: false,
    };
    onSave(newStudent);
    setFormData({ studentId: '', password: '' });
    onClose();
  };

  const inputClasses = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
              <FaUserPlus />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Create Student Account</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              Admin only needs to provide the Student ID and temporary password. 
              The student will complete their profile information upon first login.
            </p>
          </div>

          <div>
            <label className={labelClasses}>Student ID</label>
            <div className="relative">
              <input 
                name="studentId" 
                value={formData.studentId} 
                onChange={handleChange} 
                className={inputClasses} 
                required 
                placeholder="e.g. 2024-0001" 
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Temporary Password</label>
            <div className="relative">
              <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                className={`${inputClasses} pl-11`} 
                required 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
