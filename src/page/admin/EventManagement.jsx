import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaEdit, FaTrash, FaThList, FaThLarge } from 'react-icons/fa';
import EventFormModal from '../../components/admin/EventFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import ParticipantsViewModal from '../../components/admin/ParticipantsViewModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
 import API_BASE_URL from '../../config';

export default function EventManagement({ searchQuery: globalSearchQuery = '' }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const searchTerm = globalSearchQuery || localSearchTerm;

  // Alert/Confirm Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    showCancel: true,
    onConfirm: () => {},
    confirmText: 'Confirm'
  });

  const showAlert = (title, message, type = 'info') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      showCancel: false,
      onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false })),
      confirmText: 'OK'
    });
  };

  const showConfirm = (title, message, onConfirm, type = 'warning') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      showCancel: true,
      onConfirm: () => {
        onConfirm();
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      },
      confirmText: 'Confirm'
    });
  };

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [viewingParticipants, setViewingParticipants] = useState(null);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/events`);
        setEvents(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventName = (event.name || event.title || '').toLowerCase();
      const eventVenue = (event.venue || event.location || '').toLowerCase();
      const matchesSearch = eventName.includes(searchTerm.toLowerCase()) || 
                            eventVenue.includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || event.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, filterCategory]);

  const handleSaveEvent = async (savedEvent) => {
    try {
      if (editingEvent) {
        // Update event
        const response = await axios.put(`${API_BASE_URL}/api/events/${savedEvent.id}`, savedEvent);
        setEvents(prev => prev.map(e => e.id === savedEvent.id ? response.data : e));
      } else {
        // Create new event
        const response = await axios.post(`${API_BASE_URL}/api/events`, savedEvent);
        setEvents(prev => [...prev, response.data]);
      }
      setIsFormOpen(false);
      setEditingEvent(null);
      showAlert('Success', `Event ${editingEvent ? 'updated' : 'created'} successfully!`, 'success');
    } catch (error) {
      console.error('Error saving event:', error);
      showAlert('Error', 'Error saving event: ' + (error.response?.data?.message || error.message), 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      setDeletingEvent(null);
      showAlert('Success', 'Event deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting event:', error);
      showAlert('Error', 'Error deleting event: ' + (error.response?.data?.message || error.message), 'danger');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Academic: 'bg-blue-50 text-blue-600 border-blue-100',
      Sports: 'bg-green-50 text-green-600 border-green-100',
      Cultural: 'bg-purple-50 text-purple-600 border-purple-100',
      Other: 'bg-gray-50 text-gray-600 border-gray-100',
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search events or venues..."
              value={searchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FaThLarge size={16} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FaThList size={16} />
            </button>
          </div>
          <button 
            onClick={() => { setEditingEvent(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100 whitespace-nowrap"
          >
            <FaPlus /> Create Event
          </button>
        </div>
      </div>

      {/* Events Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingEvent(event); setIsFormOpen(true); }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button 
                    onClick={() => setDeletingEvent(event)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors">{event.name || event.title}</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <FaCalendarAlt size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{event.date}</p>
                    <p className="text-[10px]">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <FaMapMarkerAlt size={14} />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">{event.venue || event.location}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <FaUsers size={14} />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">
                    {(event.participants?.length || 0)} / {event.maxParticipants || 0} Participants
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingParticipants(event)}
                className="w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all">
                View Participants
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-5">Event</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Schedule</th>
                <th className="px-6 py-5">Participants</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{event.name || event.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FaMapMarkerAlt className="text-[10px]" /> {event.venue || event.location}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-gray-800">{event.date}</div>
                    <div className="text-[10px] text-gray-400">{event.time}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${((event.participants?.length || 0) / (event.maxParticipants || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{event.participants?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      (event.participants?.length || 0) > 0 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {(event.participants?.length || 0) > 0 ? 'Active' : 'Empty'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingEvent(event); setIsFormOpen(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button 
                        onClick={() => setDeletingEvent(event)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="p-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-gray-200 text-3xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No events found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
        </div>
      )}

      {/* Modals */}
      <EventFormModal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingEvent(null); }} 
        onSave={handleSaveEvent}
        event={editingEvent}
      />
      <DeleteConfirmModal 
        isOpen={!!deletingEvent} 
        onClose={() => setDeletingEvent(null)} 
        onConfirm={() => handleDelete(deletingEvent.id)}
        itemName={deletingEvent?.name}
      />
      <ParticipantsViewModal 
        isOpen={!!viewingParticipants}
        onClose={() => setViewingParticipants(null)}
        event={viewingParticipants}
      />
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        showCancel={modalConfig.showCancel}
        confirmText={modalConfig.confirmText}
      />
    </div>
  );
}
