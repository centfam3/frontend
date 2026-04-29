import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import FacultyCard from '../../components/admin/FacultyCard';
import FacultyFormModal from '../../components/admin/FacultyFormModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import API_BASE_URL from '../../config';

export default function FacultyManagement({ searchQuery: globalSearchQuery = '' }) {
  const [faculty, setFaculty] = useState([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [deletingFaculty, setDeletingFaculty] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  // Use global search query if provided, otherwise use local
  const searchQuery = globalSearchQuery || localSearchQuery;

  // Filter faculty based on search
  const filteredFaculty = faculty.filter(f => {
    const query = searchQuery.toLowerCase().trim();
    return (
      f.fullname.toLowerCase().includes(query) ||
      f.facultyid.toLowerCase().includes(query) ||
      f.email.toLowerCase().includes(query) ||
      f.position.toLowerCase().includes(query) ||
      f.program.toLowerCase().includes(query)
    );
  });

  // Fetch faculty list
  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/faculty`);
      setFaculty(response.data);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleSavefaculty = async (facultyData) => {
    // Show confirmation dialog
    const isEditing = !!editingFaculty;
    const message = isEditing 
      ? `Are you sure you want to update ${facultyData.fullname}'s information?`
      : `Are you sure you want to create a new faculty member: ${facultyData.fullname}?`;
    
    setConfirmData({
      type: 'success',
      title: isEditing ? 'Update Faculty' : 'Create Faculty',
      message,
      confirmText: isEditing ? 'Update' : 'Create',
      onConfirm: () => proceedWithSave(facultyData, isEditing)
    });
    setIsConfirmOpen(true);
  };

  const proceedWithSave = async (facultyData, isEditing) => {
    try {
      if (isEditing) {
        // Update faculty
        await axios.put(`${API_BASE_URL}/api/faculty/${editingFaculty.facultyid}`, facultyData);
        setConfirmData({
          type: 'success',
          title: 'Success',
          message: 'Faculty updated successfully',
          confirmText: 'OK',
          showCancel: false,
          onConfirm: () => {
            setIsConfirmOpen(false);
            setConfirmData(null);
          }
        });
      } else {
        // Create new faculty
        await axios.post(`${API_BASE_URL}/api/faculty`, facultyData);
        setConfirmData({
          type: 'success',
          title: 'Success',
          message: 'Faculty created successfully',
          confirmText: 'OK',
          showCancel: false,
          onConfirm: () => {
            setIsConfirmOpen(false);
            setConfirmData(null);
          }
        });
      }
      
      setIsFormOpen(false);
      setEditingFaculty(null);
      fetchFaculty();
    } catch (err) {
      console.error('Error saving faculty:', err);
      setConfirmData({
        type: 'danger',
        title: 'Error',
        message: err.response?.data?.message || 'Error saving faculty',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => setIsConfirmOpen(false)
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/faculty/${deletingFaculty.facultyid}`);
      setConfirmData({
        type: 'success',
        title: 'Success',
        message: 'Faculty deleted successfully',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => {
          setIsConfirmOpen(false);
          setConfirmData(null);
        }
      });
      setIsConfirmOpen(true);
      setDeletingFaculty(null);
      fetchFaculty();
    } catch (err) {
      console.error('Error deleting faculty:', err);
      setConfirmData({
        type: 'danger',
        title: 'Error',
        message: err.response?.data?.message || 'Error deleting faculty',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: () => setIsConfirmOpen(false)
      });
      setIsConfirmOpen(true);
    }
  };

  const handleEdit = (fac) => {
    setEditingFaculty(fac);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Faculty Management</h1>
        <p className="text-gray-600">Manage faculty members and their information</p>
      </div>

      {/* Search & Action Bar */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, email, position, or program..."
            value={searchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            setEditingFaculty(null);
            setIsFormOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <FaPlus size={18} />
          Add Faculty
        </button>
      </div>

      {/* Faculty Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading faculty...</p>
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {faculty.length === 0 ? 'No faculty members added yet' : 'No results found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((fac) => (
            <FacultyCard
              key={fac.facultyid}
              faculty={fac}
              onEdit={() => handleEdit(fac)}
              onDelete={() => setDeletingFaculty(fac)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <FacultyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFaculty(null);
        }}
        onSave={handleSavefaculty}
        faculty={editingFaculty}
      />

      <DeleteConfirmModal
        isOpen={!!deletingFaculty}
        itemName={deletingFaculty?.fullname || 'Faculty'}
        onConfirm={handleDelete}
        onClose={() => setDeletingFaculty(null)}
      />

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
