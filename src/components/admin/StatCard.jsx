import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StatCard({ icon: Icon, label, value, color, to }) {
  const navigate = useNavigate();
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div 
      onClick={() => to && navigate(to)}
      className={`bg-white rounded-xl shadow-md p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300 ${to ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClasses[color] || 'bg-gray-50 text-gray-600'}`}>
        <Icon />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}
