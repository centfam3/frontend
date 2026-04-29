import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function FacultyCard({ faculty, onEdit, onDelete }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col h-full">
      {/* Header with Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
          {faculty.fullname.split(' ')[0][0]}{faculty.fullname.split(' ')[1]?.[0] || 'F'}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 leading-tight">{faculty.fullname}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{faculty.facultyid}</p>
        </div>
      </div>

      {/* Information Grid */}
      <div className="space-y-3 flex-1">
        {/* Email */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
          <p className="text-xs font-medium text-gray-700 truncate">{faculty.email}</p>
        </div>

        {/* Program & Position Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Program</p>
            <p className="text-xs font-bold text-blue-600">{faculty.program}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl border border-green-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Position</p>
            <p className="text-xs font-bold text-green-600">{faculty.position.split(' ')[0]}</p>
          </div>
        </div>

        {/* Birth Date */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Birth Date</p>
          <p className="text-xs font-bold text-indigo-600">{formatDate(faculty.birthdate)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-6 pt-6 border-t border-gray-50">
        <button 
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex flex-col items-center gap-1"
          title="Edit faculty"
        >
          <FaEdit size={14} />
          <span className="text-[8px] font-bold uppercase">Edit</span>
        </button>
        <button 
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex flex-col items-center gap-1"
          title="Delete faculty"
        >
          <FaTrash size={14} />
          <span className="text-[8px] font-bold uppercase">Delete</span>
        </button>
      </div>
    </div>
  );
}
