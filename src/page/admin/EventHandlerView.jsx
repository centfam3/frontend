import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaSearch, FaFileExport, FaEye, FaUsers, FaArrowRight, FaLaptopCode, FaBookOpen } from 'react-icons/fa';

export default function EventHandlerView({ searchQuery: globalSearchQuery = '' }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const searchTerm = globalSearchQuery || localSearchTerm;

  // Fetch events and students from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, studentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/events`),
          axios.get(`${API_BASE_URL}/api/students`)
        ]);
        setEvents(eventsRes.data);
        setStudents(studentsRes.data);
        if (eventsRes.data.length > 0) {
          setSelectedEventId(eventsRes.data[0].id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), 
    [events, selectedEventId]
  );

  const participants = useMemo(() => {
    const assignedIds = selectedEvent?.participants || [];
    return students.filter(s => assignedIds.includes(s.id))
      .filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   s.id.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedEvent, students, searchTerm]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student ID,First Name,Last Name,Email,Phone\n"
      + participants.map(p => `${p.id},${p.firstName},${p.lastName},${p.personalInfo?.email},${p.personalInfo?.contact}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedEvent?.name}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Event Selector Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-sm border border-indigo-100">
            <FaCalendarAlt />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Event Handler View</h2>
            <p className="text-sm text-gray-400 font-medium">Manage and view participants for your events</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="pl-11 pr-10 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer appearance-none min-w-[240px]"
            >
              <option value="">Select an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
              <FaArrowRight size={10} className="rotate-90" />
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-black transition-all text-sm font-bold shadow-lg shadow-gray-100"
          >
            <FaFileExport /> Export CSV
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
              <FaUsers className="text-indigo-500" />
              <span className="text-xs font-bold text-gray-600">
                {participants.length} Participants
              </span>
            </div>
            {selectedEvent && (
              <span className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-bold text-indigo-600 shadow-sm">
                {selectedEvent.category}
              </span>
            )}
          </div>
          
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search participants by name or ID..."
              value={searchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none text-xs shadow-sm"
            />
          </div>
        </div>

        {/* Participant Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Participant Information</th>
                <th className="px-6 py-4">Contact Details</th>
                <th className="px-6 py-4">Residential Address</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {participants.map((student, idx) => (
                <tr key={student.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-4 text-xs font-bold text-gray-400">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <div 
                      onClick={() => navigate(`/dashboard/users/${student.id}`)}
                      className="flex items-center gap-4 cursor-pointer group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors flex-shrink-0">
                        {student.firstName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate group-hover/item:text-indigo-600 transition-colors">{student.firstName} {student.lastName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <FaLaptopCode size={10} /> {student.personalInfo?.course}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <FaBookOpen size={10} /> {student.personalInfo?.yearLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-700">{student.personalInfo?.email}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{student.personalInfo?.contact}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]" title={student.personalInfo?.address}>
                      {student.personalInfo?.address || 'No address provided'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{student.personalInfo?.gender}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => navigate(`/dashboard/users/${student.id}`)}
                      className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-gray-100 group-hover:border-indigo-100"
                      title="View Full Profile"
                    >
                      <FaEye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {participants.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUsers className="text-gray-200 text-2xl" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">No participants found</h3>
                    <p className="text-xs text-gray-400 mt-1 italic">Try selecting a different event or adjust search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal handled by navigate to details page */}
    </div>
  );
}
