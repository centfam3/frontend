import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { FaPlus, FaSearch, FaBullhorn, FaEdit, FaTrash, FaEye, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import AnnouncementFormModal from '../../components/admin/AnnouncementFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function Announcements({ searchQuery: globalSearchQuery = '' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const searchTerm = globalSearchQuery || localSearchTerm;

  // Alert Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title, message, type = 'info') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/announcements`);
      setAnnouncements(response.data.reverse()); // Show newest first
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      const matchesSearch = (ann.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                            (ann.content?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || ann.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [announcements, searchTerm, filterCategory]);

  const handleSave = async (savedAnn, isEditing) => {
    try {
      console.log('Attempting to save announcement:', savedAnn, 'isEditing:', isEditing);
      if (isEditing) {
        // Use either 'id' or '_id' field for the query
        const announcementId = savedAnn.id || savedAnn._id;
        if (!announcementId) {
          throw new Error('Announcement ID is missing for update');
        }
        // Update existing announcement
        console.log(`Updating announcement: ${announcementId}`);
        await axios.put(`${API_BASE_URL}/api/announcements/${announcementId}`, savedAnn);
      } else {
        // Create new announcement
        console.log('Creating new announcement');
        await axios.post(`${API_BASE_URL}/api/announcements`, savedAnn);
      }
      await fetchAnnouncements(); // Refresh the list
      setIsFormOpen(false);
      setEditingAnnouncement(null);
      showAlert('Success', 'Announcement saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving announcement:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message;
      showAlert('Error', `Failed to save announcement: ${errorMessage}`, 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/announcements/${id}`);
      fetchAnnouncements(); // Refresh the list
      setDeletingAnnouncement(null);
      showAlert('Success', 'Announcement deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showAlert('Error', 'Failed to delete announcement', 'danger');
    }
  };

  const getCategoryStyles = (category) => {
    const styles = {
      General: 'bg-blue-50 text-blue-600 border-blue-100 icon-bg-blue-100',
      'Event Update': 'bg-indigo-50 text-indigo-600 border-indigo-100 icon-bg-indigo-100',
      Urgent: 'bg-red-50 text-red-600 border-red-100 icon-bg-red-100',
    };
    return styles[category] || styles.General;
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
              placeholder="Search announcements..."
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
            <option value="General">General</option>
            <option value="Event Update">Event Update</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <button 
          onClick={() => { setEditingAnnouncement(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100 whitespace-nowrap"
        >
          <FaPlus /> Create Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(ann => {
          // Ensure announcement has an id property (use _id as fallback)
          const annId = ann.id || ann._id;
          return (
          <div key={annId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${getCategoryStyles(ann.category).split('icon-bg-')[0]} ${getCategoryStyles(ann.category).split('icon-bg-')[1]}`}>
                  {ann.category === 'Urgent' ? <FaExclamationCircle /> : <FaBullhorn />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{ann.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getCategoryStyles(ann.category)}`}>
                      {ann.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{ann.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><FaClock /> {ann.date}</span>
                    <span className="flex items-center gap-1.5"><FaEye /> {ann.targetAudience}</span>
                    <span className={`flex items-center gap-1.5 ${ann.status === 'Published' ? 'text-green-500' : 'text-gray-400'}`}>
                      <FaCheckCircle /> {ann.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingAnnouncement(ann); setIsFormOpen(true); }}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                >
                  <FaEdit size={16} />
                </button>
                <button 
                  onClick={() => setDeletingAnnouncement(ann)}
                  className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
          </div>
          );
        })}

        {filteredAnnouncements.length === 0 && (
          <div className="p-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBullhorn className="text-gray-200 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No announcements found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>

      <AnnouncementFormModal 
        key={editingAnnouncement?.id || editingAnnouncement?._id || 'new'}
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingAnnouncement(null); }} 
        onSave={handleSave}
        announcement={editingAnnouncement}
        showAlert={showAlert}
      />
      <DeleteConfirmModal 
        key={deletingAnnouncement?.id || deletingAnnouncement?._id || 'delete-modal'}
        isOpen={!!deletingAnnouncement} 
        onClose={() => setDeletingAnnouncement(null)} 
        onConfirm={() => handleDelete(deletingAnnouncement.id || deletingAnnouncement._id)}
        itemName={deletingAnnouncement?.title}
      />
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        showCancel={false}
        confirmText="OK"
      />
    </div>
  );
}
