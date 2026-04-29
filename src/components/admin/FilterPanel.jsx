import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

export default function FilterPanel({ filters, onFilterChange, onApply, onClear, availableSkills = [], availableStudentIds = [] }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold">
        <FaFilter />
        <span>Filter Students</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Skill</label>
          <select
            name="skill"
            value={filters.skill}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
          >
            <option value="">All Skills</option>
            {availableSkills.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Year Level</label>
          <select
            name="year"
            value={filters.year}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Activity</label>
          <input
            type="text"
            name="activity"
            value={filters.activity}
            onChange={handleChange}
            placeholder="e.g. Debate Society"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Student Number</label>
          <select
            name="studentId"
            value={filters.studentId}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
          >
            <option value="">All Students</option>
            {availableStudentIds.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Min GPA</label>
          <input
            type="number"
            name="minGpa"
            value={filters.minGpa}
            onChange={handleChange}
            placeholder="e.g. 90"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClear}
          className="px-6 py-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-bold flex items-center gap-2"
        >
          <FaTimes /> Clear Filters
        </button>
        <button
          onClick={onApply}
          className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100"
        >
          Apply Filters
        </button>
      </div>

      {/* Active Filter Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        {filters.skill && (
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 flex items-center gap-2">
            Skill: {filters.skill}
          </span>
        )}
        {filters.year && (
          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold border border-purple-100 flex items-center gap-2">
            Year: {filters.year}
          </span>
        )}
        {filters.activity && (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold border border-blue-100 flex items-center gap-2">
            Activity: {filters.activity}
          </span>
        )}
        {filters.studentId && (
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100 flex items-center gap-2">
            ID: {filters.studentId}
          </span>
        )}
        {filters.minGpa && (
          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-bold border border-yellow-100 flex items-center gap-2">
            Min GPA: {filters.minGpa}
          </span>
        )}
      </div>
    </div>
  );
}
