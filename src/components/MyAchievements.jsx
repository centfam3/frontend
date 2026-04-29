import React, { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'
import { FaTrophy, FaCalendarAlt, FaAward, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaRunning, FaBullhorn } from 'react-icons/fa'

export function AchievementCard({ achievement }) {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { 
          bg: 'bg-green-50', 
          text: 'text-green-700', 
          border: 'border-green-200',
          icon: <FaCheckCircle className="text-green-500" />
        };
      case 'pending':
        return { 
          bg: 'bg-yellow-50', 
          text: 'text-yellow-700', 
          border: 'border-yellow-200',
          icon: <FaHourglassHalf className="text-yellow-500" />
        };
      case 'rejected':
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-700', 
          border: 'border-red-200',
          icon: <FaTimesCircle className="text-red-500" />
        };
      default:
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-700', 
          border: 'border-gray-200',
          icon: <FaAward className="text-gray-400" />
        };
    }
  }

  const info = getStatusInfo(achievement.status)

  return (
    <div className={`${info.bg} border ${info.border} p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
            achievement.category === 'Academic' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
          }`}>
            <FaTrophy />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{achievement.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest flex items-center gap-1 ${info.bg} ${info.text} ${info.border}`}>
                {info.icon} {achievement.status}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{achievement.category}</span>
            </div>
          </div>
        </div>
      </div>
      {achievement.description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{achievement.description}</p>
      )}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100/50">
        <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
          <FaCalendarAlt className="text-orange-400" /> {achievement.date}
        </p>
      </div>
    </div>
  )
}

export default function MyAchievements({ student: initialStudent, searchQuery = '' }) {
  const [activeTab, setActiveTab] = useState('Academic')
  const [student, setStudent] = useState(initialStudent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestStudentData = async () => {
      if (!initialStudent?.id) return;
      
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/api/students/${initialStudent.id}`)
        setStudent(response.data)
      } catch (error) {
        console.error('Error fetching student achievements:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestStudentData()
  }, [initialStudent?.id])

  const achievements = student?.achievements || []
  const filteredAchievements = achievements.filter(a => {
    const matchesTab = a.category === activeTab;
    const matchesSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium tracking-wide">Loading your achievements...</p>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">My Achievements</h1>
          <p className="text-slate-500 font-medium">Your recognized academic and sports milestones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('Academic')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'Academic'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
              : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <FaAward className={activeTab === 'Academic' ? 'text-white' : 'text-slate-400'} />
          Academic Achievements
        </button>
        <button
          onClick={() => setActiveTab('Sports')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'Sports'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-100'
              : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          <FaRunning className={activeTab === 'Sports' ? 'text-white' : 'text-slate-400'} />
          Sports Achievements
        </button>
      </div>

      {/* Achievement List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAchievements.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTrophy className="text-3xl text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No {activeTab} Achievements</h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium leading-relaxed px-6">
              Your recognized milestones will appear here once added by the faculty or administration.
            </p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-12 p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <FaBullhorn />
        </div>
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">Recognition Notice</h4>
          <p className="text-sm text-indigo-700 font-medium leading-relaxed">
            Achievements are managed by the school administration and faculty. If you have a milestone that hasn't been recorded, please visit the faculty office with your supporting documents.
          </p>
        </div>
      </div>
    </div>
  )
}
