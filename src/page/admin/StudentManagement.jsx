import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaTrophy, FaPlus, FaChevronRight, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentFormModal from '../../components/admin/StudentFormModal';
import FilterPanel from '../../components/admin/FilterPanel';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import StudentCard from '../../components/admin/StudentCard';
import API_BASE_URL from '../../config';

export default function StudentManagement({ searchQuery = '' }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [allStudentIds, setAllStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const [filters, setFilters] = useState({
    skill: '',
    activity: '',
    studentId: '',
    minGpa: '',
    year: ''
  });
  
  // Filter students based on searchQuery (name or ID)
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    
    const query = searchQuery.toLowerCase().trim();
    return students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const studentId = (student.id || '').toString().toLowerCase();
      const course = (student.personalInfo?.course || '').toLowerCase();
      
      return fullName.includes(query) || 
             studentId.includes(query) || 
             course.includes(query);
    });
  }, [students, searchQuery]);
  
  // Modal states
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Function to fetch all unique skills and year levels (unfiltered)
  const fetchAllMetadata = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/students`);
      
      // Extract Skills
      const skillSet = new Set();
      // Extract Student IDs
      const idSet = new Set();
      
      response.data.forEach(student => {
        // Skills
        if (student.skills && Array.isArray(student.skills)) {
          student.skills.forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            if (skillName) skillSet.add(skillName);
          });
        }
        
        // Student IDs
        if (student.id) {
          idSet.add(student.id);
        }
      });
      
      setAllSkills(Array.from(skillSet).sort());
      setAllStudentIds(Array.from(idSet).sort());
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchStudents = async (queryFilters = filters) => {
    setLoading(true);
    try {
      console.log('Applying Filters:', queryFilters);
      const params = new URLSearchParams();
      if (queryFilters.skill) params.append('skill', queryFilters.skill);
      if (queryFilters.activity) params.append('activity', queryFilters.activity);
      if (queryFilters.studentId) params.append('studentId', queryFilters.studentId);
      if (queryFilters.minGpa) params.append('minGpa', queryFilters.minGpa);
      if (queryFilters.year) params.append('year', queryFilters.year);

      const response = await axios.get(`${API_BASE_URL}/api/students?${params.toString()}`);
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAllMetadata(); // Initial fetch for metadata
  }, []);

  const handleFilterChange = (name, value) => {
    // Clear other filters when student ID is selected to ensure only one student shows
    if (name === 'studentId' && value !== '') {
      const singleIdFilters = {
        skill: '',
        activity: '',
        studentId: value,
        minGpa: '',
        year: ''
      };
      setFilters(singleIdFilters);
      fetchStudents(singleIdFilters);
      return;
    }

    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    
    // Immediately fetch with updated filters for select fields
    if (name === 'skill' || name === 'year') {
      fetchStudents(updatedFilters);
    }
  };

  const handleApplyFilters = () => {
    fetchStudents(filters);
  };

  // Remove the useEffect for auto-apply to avoid double calls
  // and potential closure issues
  // and potential closure issues
  /*
  useEffect(() => {
    fetchStudents(filters);
  }, [filters.skill]);
  */

  const handleClearFilters = () => {
    const cleared = { skill: '', activity: '', studentId: '', minGpa: '', year: '' };
    setFilters(cleared);
    fetchStudents(cleared);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/students/${id}`);
      setStudents(prev => prev.filter(s => s.id !== id));
      setDeletingStudent(null);
      fetchAllMetadata(); // Refresh metadata list after delete
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  const handleExportReport = async () => {
    try {
      if (filteredStudents.length === 0) {
        showAlert('No Data', 'No students to export. Please adjust your filters.', 'warning');
        return;
      }

      // Build query parameters from current filters
      const params = new URLSearchParams();
      if (filters.skill) params.append('skill', filters.skill);
      if (filters.activity) params.append('activity', filters.activity);
      if (filters.studentId) params.append('studentId', filters.studentId);
      if (filters.minGpa) params.append('minGpa', filters.minGpa);
      if (filters.year) params.append('year', filters.year);

      // Make request to export endpoint
      const response = await axios.get(`${API_BASE_URL}/api/reports/students-export?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create blob and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      showAlert('Success', `Exported ${filteredStudents.length} students to CSV file!`, 'success');
    } catch (err) {
      console.error('Error exporting students:', err);
      showAlert('Error', 'Failed to export students: ' + (err.response?.data?.message || err.message), 'danger');
    }
  };

  const handleSaveStudent = async (studentData) => {
    // Validate required fields
    if (!studentData.firstName || !studentData.lastName) {
      showAlert('Validation Error', 'Student name is required', 'warning');
      return;
    }
    if (!studentData.personalInfo.email) {
      showAlert('Validation Error', 'Email is required for login', 'warning');
      return;
    }
    if (!studentData.password) {
      showAlert('Validation Error', 'Password is required for login', 'warning');
      return;
    }
    if (!studentData.id) {
      showAlert('Validation Error', 'Student ID is required', 'warning');
      return;
    }

    const title = editingStudent ? 'Confirm Update' : 'Confirm Creation';
    const message = editingStudent 
      ? `Are you sure you want to update ${studentData.firstName} ${studentData.lastName}'s information?`
      : `Are you sure you want to create a new student: ${studentData.firstName} ${studentData.lastName}?`;

    showConfirm(title, message, async () => {
      try {
        if (editingStudent) {
          await axios.put(`${API_BASE_URL}/api/students/${editingStudent.id}`, studentData);
          showAlert('Success', 'Student updated successfully!', 'success');
        } else {
          // Check if student ID already exists
          const existingStudent = students.find(s => s.id === studentData.id);
          if (existingStudent) {
            showAlert('Duplicate ID', `Student ID "${studentData.id}" already exists. Please use a different ID.`, 'warning');
            return;
          }
          await axios.post(`${API_BASE_URL}/api/students`, studentData);
          showAlert('Success', `Student created successfully! They can now login with Email: ${studentData.personalInfo.email}`, 'success');
        }
        
        setIsFormOpen(false);
        setEditingStudent(null);
        fetchStudents(); 
        fetchAllMetadata();
      } catch (err) {
        console.error('Error saving student:', err);
        showAlert('Error', 'Error saving student: ' + (err.response?.data?.message || err.message), 'danger');
      }
    }, editingStudent ? 'info' : 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Student Profiles</h2>
          <p className="text-xs text-gray-400 font-medium mt-1">Manage and track student information</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-bold shadow-lg shadow-green-100"
          >
            <FaDownload /> Export Report
          </button>
          <button 
            onClick={() => { setEditingStudent(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100"
          >
            <FaPlus /> Add Student
          </button>
        </div>
      </div>

      {/* Student Count Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium mb-2">Total Students in System</p>
            <h3 className="text-4xl font-black text-blue-700">{students.length}</h3>
            <p className="text-xs text-blue-500 mt-1">All students loaded and ready</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {students.length === 1000 ? '✅' : '⚠️'}
            </div>
            <p className="text-xs text-blue-600 font-bold mt-2">{students.length}/1000</p>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        availableSkills={allSkills}
        availableStudentIds={allStudentIds}
      />

      {/* Results Count */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
          Showing {filteredStudents.length} Students
          {searchQuery && <span className="text-gray-400 normal-case ml-2">filtered by "{searchQuery}"</span>}
        </span>
        <div className="h-px flex-1 bg-gray-100"></div>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            {/* The parent passes student data as props to the child */}
            <p className="text-gray-400 font-medium">Loading students...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              onEdit={(s) => { setEditingStudent(s); setIsFormOpen(true); }} 
              onDelete={(s) => setDeletingStudent(s)} 
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-gray-200 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No students found</h3>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new student.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentFormModal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingStudent(null); }} 
        onSave={handleSaveStudent}
        student={editingStudent} 
      />
      <DeleteConfirmModal 
        isOpen={!!deletingStudent} 
        onClose={() => setDeletingStudent(null)} 
        onConfirm={() => handleDelete(deletingStudent.id)}
        itemName={`${deletingStudent?.firstName} ${deletingStudent?.lastName}`}
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
