import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../../config'
import { FaSearch, FaCalendarAlt, FaFileDownload, FaChartBar, FaUsers, FaSync } from 'react-icons/fa'

export default function Reports({ searchQuery: globalSearchQuery = '' }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [localSearchTerm, setLocalSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const searchTerm = globalSearchQuery || localSearchTerm;

  useEffect(() => {
    fetchReports()
    
    // Refetch when page becomes visible (user switches tabs/windows)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchReports()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Auto-refresh every 5 seconds while page is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchReports()
      }
    }, 5000)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(interval)
    }
  }, [])

  const fetchReports = async () => {
    try {
      setIsRefreshing(true)
      const response = await axios.get(`${API_BASE_URL}/api/reports/summary`)
      setReports(response.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.eventName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = dateFilter ? report.eventDate === dateFilter : true
    return matchesSearch && matchesDate
  })

  const totalStudentsOverall = reports.reduce((sum, report) => sum + report.totalStudents, 0)

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <FaChartBar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Events</p>
            <h3 className="text-2xl font-bold text-slate-800">{reports.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <FaUsers size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Participation</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalStudentsOverall}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <FaCalendarAlt size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Filtered Results</p>
            <h3 className="text-2xl font-bold text-slate-800">{filteredReports.length}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by event name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              value={searchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="p-6 border-b border-orange-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Event Participation Summary</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
            <FaFileDownload /> Export PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Event Name</th>
                <th className="px-6 py-4 font-black">Date</th>
                <th className="px-6 py-4 font-black">Total Students Joined</th>
                <th className="px-6 py-4 font-black text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 font-medium">Loading reports...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <tr key={report.eventId} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
                        {report.eventName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <FaCalendarAlt className="text-orange-400" size={14} />
                        {new Date(report.eventDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                          <div 
                            className="h-full bg-orange-500 rounded-full" 
                            style={{ width: `${Math.min((report.totalStudents / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-black text-slate-700">{report.totalStudents}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        report.totalStudents > 0 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {report.totalStudents > 0 ? 'Active' : 'Empty'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">🔍</div>
                      <p className="text-slate-500 font-medium">No reports found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
