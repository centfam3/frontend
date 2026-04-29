import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { FaTimes, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function AnnouncementFormModal({ isOpen, onClose, onSave, announcement, showAlert }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
    targetAudience: 'All Students',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'Published',
  });
  const [events, setEvents] = useState([]);

  // Fetch events for target audience dropdown
  useEffect(() => {
    if (isOpen) {
      const fetchEvents = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/events`);
          setEvents(response.data);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };
      fetchEvents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        category: announcement.category || 'General',
        content: announcement.content || '',
        targetAudience: announcement.targetAudience || 'All Students',
        publishDate: announcement.date || new Date().toISOString().split('T')[0],
        status: announcement.status || 'Published',
      });
    } else {
      setFormData({
        title: '',
        category: 'General',
        content: '',
        targetAudience: 'All Students',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'Published',
      });
    }
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      showAlert?.('Validation Error', 'Title is required', 'warning');
      return;
    }
    if (!formData.content.trim()) {
      showAlert?.('Validation Error', 'Content is required', 'warning');
      return;
    }
    
    const dataToSend = {
      title: formData.title,
      category: formData.category,
      content: formData.content,
      targetAudience: formData.targetAudience,
      date: formData.publishDate,
      status: formData.status,
      priority: 'Normal',
      author: 'System Administrator'
    };
    
    // Include ID if editing (support both 'id' and '_id' fields)
    if (announcement) {
      if (announcement.id) {
        dataToSend.id = announcement.id;
      } else if (announcement._id) {
        dataToSend._id = announcement._id;
        dataToSend.id = announcement._id; // Also add as 'id' for API compatibility
      }
    }
    
    console.log('Submitting announcement:', dataToSend, 'isEditing:', !!announcement);
    onSave(dataToSend, !!announcement);
    onClose();
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClasses = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">{announcement ? 'Edit Announcement' : 'Create Announcement'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className={labelClasses}>Title</label>
            <input name="title" value={formData.title} onChange={handleChange} className={inputClasses} required placeholder="e.g. Important Update: Event Schedule Change" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClasses}>
                <option value="General">General</option>
                <option value="Event Update">Event Update</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Publish Date</label>
              <input name="publishDate" type="date" value={formData.publishDate} onChange={handleChange} className={inputClasses} required />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Target Audience</label>
            <select name="targetAudience" value={formData.targetAudience} onChange={handleChange} className={inputClasses}>
              <option value="All Students">All Students</option>
              {events.map(event => (
                <option key={event.id} value={event.name}>{event.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>Content</label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows="5" className={inputClasses} required placeholder="Type your announcement here..."></textarea>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-800">Visibility</p>
              <p className="text-xs text-gray-500">Draft or Publish this announcement</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'Published' ? 'Draft' : 'Published' }))}
              className={`text-3xl transition-colors ${formData.status === 'Published' ? 'text-indigo-600' : 'text-gray-300'}`}
            >
              {formData.status === 'Published' ? <FaToggleOn /> : <FaToggleOff />}
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
              <FaSave /> {announcement ? 'Save Changes' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
