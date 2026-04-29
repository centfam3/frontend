import React from 'react';
import API_BASE_URL from '../../config';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function StudentCard({ student, onEdit, onDelete }) {
  const navigate = useNavigate();
  // Uses props: student.firstName, student.skills, student.personalInfo, etc.
  const getYearLabel = (year) => {
    if (!year) return 'N/A';
    const numYear = parseInt(year);
    const suffixes = { 1: 'st', 2: 'nd', 3: 'rd' };
    return `${numYear}${suffixes[numYear] || 'th'} Year`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 hover:shadow-xl hover:border-indigo-200 transition-all group flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
          {student.photo ? (
            <img src={`${API_BASE_URL}/uploads/${student.photo}`} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span>{student.firstName[0]}{student.lastName[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 leading-tight">{student.firstName} {student.lastName}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{student.id}</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Year Level</p>
            <p className="text-xs font-bold text-gray-700">{getYearLabel(student.personalInfo?.year)}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Birth Date</p>
            <p className="text-xs font-bold text-indigo-600">
              {student.personalInfo?.dateOfBirth ? new Date(student.personalInfo.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Top Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {student.skills && student.skills.length > 0 ? (
              <>
                {student.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold border border-indigo-100/50">
                    {skill}
                  </span>
                ))}
                {student.skills.length > 3 && (
                  <span className="text-[9px] text-gray-400 font-bold pl-1">+{student.skills.length - 3} more</span>
                )}
              </>
            ) : (
              <span className="text-[9px] text-gray-400 italic font-medium ml-1">No skills listed</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-50">
        <button 
          onClick={() => navigate(`/dashboard/users/${student.id}`)}
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all flex flex-col items-center gap-1"
        >
          <FaEye size={14} />
          <span className="text-[8px] font-bold uppercase">View</span>
        </button>
        <button 
          onClick={() => onEdit(student)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex flex-col items-center gap-1"
        >
          <FaEdit size={14} />
          <span className="text-[8px] font-bold uppercase">Edit</span>
        </button>
        <button 
          onClick={() => onDelete(student)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all flex flex-col items-center gap-1"
        >
          <FaTrash size={14} />
          <span className="text-[8px] font-bold uppercase">Delete</span>
        </button>
      </div>
    </div>
  );
}
