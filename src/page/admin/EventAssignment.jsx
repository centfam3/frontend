import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus, FaTimes, FaExclamationTriangle, FaCheckCircle, FaFilter, FaLaptopCode, FaBookOpen, FaCheck, FaBan, FaHourglassHalf } from 'react-icons/fa';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function EventAssignment({ searchQuery: globalSearchQuery = '' }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);

  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  
  const searchTerm = globalSearchQuery || localSearchTerm;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, studentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/events`),
          axios.get(`${API_BASE_URL}/api/students`)
        ]);
        
        const fetchedEvents = Array.isArray(eventsRes.data) ? eventsRes.data : [];
        const fetchedStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        
        setEvents(fetchedEvents);
        setStudents(fetchedStudents);
        
        if (fetchedEvents.length > 0) {
          // Priority for selectedEventId: existing ID > first event's id > first event's _id
          const firstEvent = fetchedEvents[0];
          setSelectedEventId(firstEvent.id || firstEvent._id);
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
    events.find(e => (e.id === selectedEventId || e._id === selectedEventId)),
    [events, selectedEventId]
  );

  const assignedStudents = useMemo(() =>
    students.filter(s => selectedEvent?.participants?.includes(s.id)),
    [students, selectedEvent]
  );

  const pendingRequests = useMemo(() =>
    students.filter(s => selectedEvent?.pendingRequests?.includes(s.id)),
    [students, selectedEvent]
  );

  const candidateStudents = useMemo(() => {
    return students.filter(student => {
      if (!student) return false;
      
      const isAlreadyAssigned = selectedEvent?.participants?.includes(student.id) || false;
      const hasPendingRequest = selectedEvent?.pendingRequests?.includes(student.id) || false;
      
      const firstName = student.firstName || '';
      const lastName = student.lastName || '';
      const studentId = student.id || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      
      // Matches global navbar search
      const matchesGlobal = !globalSearchQuery || 
                           fullName.includes(globalSearchQuery.toLowerCase()) || 
                           studentId.toLowerCase().includes(globalSearchQuery.toLowerCase());
      
      // Matches local page search
      const matchesLocal = !localSearchTerm || 
                          fullName.includes(localSearchTerm.toLowerCase()) || 
                          studentId.toLowerCase().includes(localSearchTerm.toLowerCase());
      
      const matchesSkill = filterSkill === '' || (student.skills && student.skills.some(s => {
        const skillName = (s.name || s || '').toString().toLowerCase();
        return skillName.includes(filterSkill.toLowerCase());
      }));

      return !isAlreadyAssigned && !hasPendingRequest && matchesGlobal && matchesLocal && matchesSkill;
    });
  }, [students, selectedEvent, globalSearchQuery, localSearchTerm, filterSkill]);

  const handleApprove = async (studentId) => {
    if (selectedEvent.participants.length >= selectedEvent.maxParticipants) {
      setConfirmData({
        type: 'warning',
        title: 'Limit Reached',
        message: 'Maximum participants reached for this event!',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => setIsConfirmOpen(false)
      });
      setIsConfirmOpen(true);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/${selectedEventId}/approve`, {
        studentId: studentId
      });

      setEvents(prev => prev.map(e =>
        e.id === selectedEventId ? response.data : e
      ));
    } catch (error) {
      console.error('Error approving request:', error);
      setConfirmData({
        type: 'danger',
        title: 'Error',
        message: 'Error approving request: ' + (error.response?.data?.message || error.message),
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => setIsConfirmOpen(false)
      });
      setIsConfirmOpen(true);
    }
  };

  const handleReject = async (studentId) => {
    setConfirmData({
      type: 'warning',
      title: 'Confirm Reject',
      message: 'Are you sure you want to reject this request?',
      confirmText: 'Reject',
      showCancel: true,
      onConfirm: async () => {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/events/${selectedEventId}/reject`, {
            studentId: studentId
          });

          setEvents(prev => prev.map(e =>
            e.id === selectedEventId ? response.data : e
          ));
          setIsConfirmOpen(false);
        } catch (error) {
          console.error('Error rejecting request:', error);
          setConfirmData({
            type: 'danger',
            title: 'Error',
            message: 'Error rejecting request: ' + (error.response?.data?.message || error.message),
            confirmText: 'OK',
            showCancel: false,
            onConfirm: () => setIsConfirmOpen(false)
          });
        }
      }
    });
    setIsConfirmOpen(true);
  };

  const handleAssign = async (student) => {
    if (selectedEvent.participants.length >= selectedEvent.maxParticipants) {
      setConfirmData({
        type: 'warning',
        title: 'Limit Reached',
        message: 'Maximum participants reached for this event!',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => setIsConfirmOpen(false)
      });
      setIsConfirmOpen(true);
      return;
    }

    const sameDateEvent = events.find(e =>
      e.date === selectedEvent.date &&
      e.participants.includes(student.id)
    );

    if (sameDateEvent) {
      setConfirmData({
        type: 'warning',
        title: 'Schedule Conflict',
        message: `${student.firstName} ${student.lastName} is already assigned to "${sameDateEvent.name}" on ${selectedEvent.date}. Assign anyway?`,
        confirmText: 'Assign Anyway',
        showCancel: true,
        onConfirm: () => proceedWithAssignment(student)
      });
      setIsConfirmOpen(true);
      return;
    }

    proceedWithAssignment(student);
  };

  const proceedWithAssignment = (student) => {
    setConfirmData({
      type: 'success',
      title: 'Confirm Assignment',
      message: `Are you sure you want to assign ${student.firstName} ${student.lastName} to "${selectedEvent.name}"?`,
      confirmText: 'Confirm',
      showCancel: true,
      onConfirm: () => assignStudent(student)
    });
    setIsConfirmOpen(true);
  };

  const assignStudent = async (student) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/events/${selectedEventId}/assign`, {
        studentId: student.id
      });

      setEvents(prev => prev.map(e =>
        e.id === selectedEventId ? response.data : e
      ));
      setIsConfirmOpen(false);
      setConfirmData(null);
    } catch (error) {
      console.error('Error assigning student:', error);
      setConfirmData({
        type: 'danger',
        title: 'Error',
        message: 'Error assigning student: ' + (error.response?.data?.message || error.message),
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => setIsConfirmOpen(false)
      });
      setIsConfirmOpen(true);
    }
  };

  const handleRemove = async (studentId) => {
    setConfirmData({
      type: 'warning',
      title: 'Confirm Removal',
      message: 'Are you sure you want to remove this student from the event?',
      confirmText: 'Remove',
      showCancel: true,
      onConfirm: async () => {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/events/${selectedEventId}/unregister`, {
            studentId: studentId
          });

          setEvents(prev => prev.map(e =>
            e.id === selectedEventId ? response.data : e
          ));
          setIsConfirmOpen(false);
        } catch (error) {
          console.error('Error removing student:', error);
          setConfirmData({
            type: 'danger',
            title: 'Error',
            message: 'Error removing student: ' + (error.response?.data?.message || error.message),
            confirmText: 'OK',
            showCancel: false,
            onConfirm: () => setIsConfirmOpen(false)
          });
        }
      }
    });
    setIsConfirmOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading events and students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fadeIn h-[calc(100vh-12rem)] overflow-hidden">
      {/* LEFT PANEL — Event Selector */}
      <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Event</label>
          <div className="relative mb-6">
            <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer appearance-none"
            >
              <option value="">Select an event...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Event Details</p>
                <h3 className="font-bold text-gray-800 text-sm mb-2">{selectedEvent.name}</h3>
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FaCalendarAlt size={10} className="text-indigo-400" /> {selectedEvent.date} • {selectedEvent.time}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FaMapMarkerAlt size={10} className="text-indigo-400" /> {selectedEvent.venue}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase">Capacity</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedEvent.participants.length >= selectedEvent.maxParticipants ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {selectedEvent.participants.length >= selectedEvent.maxParticipants ? 'Full' : 'Available'}
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-indigo-900">{selectedEvent.participants.length}</span>
                  <span className="text-sm text-indigo-400 mb-1">/ {selectedEvent.maxParticipants} Participants</span>
                </div>
                <div className="w-full h-2 bg-indigo-100 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${selectedEvent.participants.length >= selectedEvent.maxParticipants ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${(selectedEvent.participants.length / selectedEvent.maxParticipants) * 100}%` }}
                  ></div>
                </div>
                {pendingRequests.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-indigo-100">
                    <p className="text-[10px] text-yellow-600 font-bold flex items-center gap-1">
                      <FaHourglassHalf size={10} /> {pendingRequests.length} pending request(s)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL — Student Assignment */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[150px] max-h-[30%] overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-yellow-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                  <FaHourglassHalf size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">Pending Requests</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Students waiting for approval</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white border border-yellow-100 rounded-full text-[10px] font-bold text-yellow-600 shadow-sm">
                {pendingRequests.length} Request(s)
              </span>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {pendingRequests.map(student => (
                  <div key={student.id} className="flex flex-col p-3 bg-white border border-yellow-50 rounded-xl hover:border-yellow-200 hover:shadow-sm transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {student.firstName ? student.firstName.charAt(0) : '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[9px] text-gray-500 font-medium">{student.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApprove(student.id)}
                          className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Approve"
                        >
                          <FaCheck size={10} />
                        </button>
                        <button
                          onClick={() => handleReject(student.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Reject"
                        >
                          <FaBan size={10} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.skills?.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-full text-[8px] font-bold">
                          {skill.name || skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Section — Assigned Students */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[200px] max-h-[40%] overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-green-50/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                <FaCheckCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Assigned Students</h3>
                <p className="text-[10px] text-gray-500 font-medium">Currently registered for this event</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white border border-green-100 rounded-full text-[10px] font-bold text-green-600 shadow-sm">
                {assignedStudents.length} / {selectedEvent?.maxParticipants || 0} Slots
              </span>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {assignedStudents.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-red-100 hover:bg-red-50/30 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {student.firstName ? student.firstName.charAt(0) : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-[9px] text-gray-500 font-medium truncate">{student.id}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[8px] px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-full font-bold">
                          {student.personalInfo?.course}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(student.id)}
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-white rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                    title="Remove from Event"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ))}
              {assignedStudents.length === 0 && (
                <div className="col-span-full py-8 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FaUsers className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-xs text-gray-400 font-medium">No students assigned yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section — Add Students / Candidates */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUsers className="text-indigo-500" />
                <h3 className="font-bold text-gray-800 text-sm">Add Students / Candidates</h3>
              </div>
              <div className="flex items-center gap-3">
                {globalSearchQuery && (
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <FaFilter size={8} /> Navbar filter active: "{globalSearchQuery}"
                  </span>
                )}
                {(localSearchTerm || filterSkill) && (
                  <button 
                    onClick={() => {
                      setLocalSearchTerm('');
                      setFilterSkill('');
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full transition-colors"
                  >
                    <FaTimes size={8} /> Clear Local Filters
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none text-xs"
                />
              </div>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
              >
                <option value="">All Skills</option>
                <option value="React">React</option>
                <option value="Python">Python</option>
                <option value="Design">UI/UX Design</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {candidateStudents.map(student => (
                <div key={student.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      onClick={() => navigate(`/dashboard/users/${student.id}`)}
                      className="flex items-center gap-3 cursor-pointer group/item"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-sm group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                        {student.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 group-hover/item:text-indigo-600 transition-colors">{student.firstName} {student.lastName}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{student.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssign(student)}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm shadow-green-100"
                      title="Assign to Event"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {student.skills?.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-[9px] font-bold border border-gray-100 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {skill.name || skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50 group-hover:border-indigo-50 transition-colors">
                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                      <FaLaptopCode className="text-indigo-400" size={10} /> {student.personalInfo?.course}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-[9px] text-gray-500 flex items-center gap-1">
                      <FaBookOpen className="text-indigo-400" size={10} /> {student.personalInfo?.yearLevel}
                    </span>
                  </div>
                </div>
              ))}
              {candidateStudents.length === 0 && (
                <div className="col-span-full py-10 text-center">
                  <p className="text-sm text-gray-400 italic">No candidates matching filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setConfirmData(null);
        }}
        onConfirm={() => {
          if (confirmData?.onConfirm) {
            confirmData.onConfirm();
          }
          setIsConfirmOpen(false);
          setConfirmData(null);
        }}
        title={confirmData?.title || 'Confirm'}
        message={confirmData?.message || ''}
        confirmText={confirmData?.confirmText || 'Confirm'}
        type={confirmData?.type || 'warning'}
        showCancel={confirmData?.showCancel ?? true}
      />
    </div>
  );
}