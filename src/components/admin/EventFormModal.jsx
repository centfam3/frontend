import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function EventFormModal({ isOpen, onClose, onSave, event }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Academic',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    venue: '',
    description: '',
    maxParticipants: 50,
    status: 'Active',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || event.title || '',
        category: event.category || 'Academic',
        date: event.date || '',
        time: event.time || '',
        endDate: event.endDate || event.date || '',
        endTime: event.endTime || event.time || '',
        venue: event.venue || event.location || '',
        description: event.description || '',
        maxParticipants: event.maxParticipants || 50,
        status: event.status || 'Active',
      });
    } else {
      setFormData({
        name: '',
        category: 'Academic',
        date: '',
        time: '',
        endDate: '',
        endTime: '',
        venue: '',
        description: '',
        maxParticipants: 50,
        status: 'Active',
      });
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare event data - preserve all original fields and merge with form changes
    const eventData = event ? { 
      ...event,  // Keep all original fields (id, participants, _id, etc)
      ...formData,  // Override with edited fields
      title: formData.name,  // Ensure 'title' field is set for Reports
      location: formData.venue  // Ensure 'location' field is set
    } : { 
      ...formData,
      title: formData.name,  // For new events
      location: formData.venue,
      id: `EVT${Date.now()}`,
      participants: [],
      pendingRequests: []
    };
    
    onSave(eventData);
    onClose();
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">{event ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClasses}>Event Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Max Participants</label>
              <input name="maxParticipants" type="number" value={formData.maxParticipants} onChange={handleChange} className={inputClasses} required />
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className={`${labelClasses} text-blue-800`}>Start Date</label>
                <input name="date" type="date" value={formData.date} onChange={handleChange} className={inputClasses} required />
              </div>
              <div>
                <label className={`${labelClasses} text-blue-800`}>Start Time</label>
                <input name="time" type="time" value={formData.time} onChange={handleChange} className={inputClasses} required />
              </div>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className={`${labelClasses} text-green-800`}>End Date</label>
                <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className={inputClasses} required />
              </div>
              <div>
                <label className={`${labelClasses} text-green-800`}>End Time</label>
                <input name="endTime" type="time" value={formData.endTime} onChange={handleChange} className={inputClasses} required />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Venue</label>
            <input name="venue" value={formData.venue} onChange={handleChange} className={inputClasses} required />
          </div>

          <div>
            <label className={labelClasses}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className={inputClasses}></textarea>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-800">Event Status</p>
              <p className="text-xs text-gray-500">Enable or disable registration for this event</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'Active' ? 'Inactive' : 'Active' }))}
              className={`text-3xl transition-colors ${formData.status === 'Active' ? 'text-indigo-600' : 'text-gray-300'}`}
            >
              {formData.status === 'Active' ? <FaToggleOn /> : <FaToggleOff />}
            </button>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <FaSave /> {event ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
