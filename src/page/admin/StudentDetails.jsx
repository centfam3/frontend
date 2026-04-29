import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { FaArrowLeft, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaExclamationTriangle, FaClipboardList, FaCheckCircle, FaLaptopCode, FaBookOpen, FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [activeAchievementTab, setActiveAchievementTab] = useState('Academic');
  const [addingAchievement, setAddingAchievement] = useState(false);

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

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/students/${id}`);
        setStudent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Student not found or error fetching data');
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleAddAchievement = async (formData) => {
    try {
      setAddingAchievement(true);
      console.log('📝 Submitting achievement:', formData);
      const response = await axios.post(`${API_BASE_URL}/api/students/${id}/achievements`, formData);
      
      console.log('✅ Response received:', response.data);
      console.log('   Achievements in response:', response.data.achievements);
      console.log('   Response keys:', Object.keys(response.data));
      
      setStudent(response.data);
      setIsAchievementModalOpen(false);
      
      // Manually refetch to ensure fresh data
      setTimeout(async () => {
        try {
          const freshResponse = await axios.get(`${API_BASE_URL}/api/students/${id}`);
          setStudent(freshResponse.data);
        } catch (err) {
          console.error('Error refetching:', err);
        }
      }, 500);
      
      showAlert('Success', 'Achievement added successfully!', 'success');
    } catch (error) {
      console.error('Error adding achievement:', error);
      showAlert('Error', 'Error adding achievement: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setAddingAchievement(false);
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    showConfirm('Confirm Delete', 'Are you sure you want to delete this achievement?', async () => {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/students/${id}/achievements/${achievementId}`);
        setStudent(response.data);
        showAlert('Success', 'Achievement deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting achievement:', error);
        showAlert('Error', 'Error deleting achievement: ' + (error.response?.data?.message || error.message), 'danger');
      }
    }, 'danger');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-400 font-medium">Loading student details...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="text-red-500 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{error || 'Student not found'}</h3>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 mx-auto transition-all"
        >
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  const studentAchievements = student.achievements || [];
  const academicAchievements = studentAchievements.filter(a => a.category === 'Academic');
  const sportsAchievements = studentAchievements.filter(a => a.category === 'Sports');
  const displayedAchievements = activeAchievementTab === 'Academic' ? academicAchievements : sportsAchievements;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Minor': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Major': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Severe': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAchievementStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sectionHeaderClasses = "text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 mt-8 first:mt-0";

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Achievement Modal */}
      {isAchievementModalOpen && (
        <AchievementFormModal
          onClose={() => setIsAchievementModalOpen(false)}
          onSave={handleAddAchievement}
          isSubmitting={addingAchievement}
          showAlert={showAlert}
        />
      )}

      {/* Header with Back Button */}
      <div className="bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100"
            title="Back to List"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold shadow-sm shadow-indigo-100">
              {student.photo ? (
                <img src={`${API_BASE_URL}/uploads/${student.photo}`} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <FaUser className="text-3xl" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">{student.firstName} {student.lastName}</h2>
              <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mt-0.5">{student.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Login Credentials Info Box */}
        <div className="mb-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
          <p className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
            <FaClipboardList className="text-blue-500" />
            Student Login Credentials
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Student ID</p>
              <p className="text-base font-bold text-gray-800">{student.id}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Email for Login</p>
              <p className="text-base font-bold text-gray-800">{student.personalInfo?.email}</p>
            </div>
          </div>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-4 flex items-center gap-1.5">
            <FaCheckCircle className="text-blue-500" />
            Use Email and Password to login to student dashboard
          </p>
        </div>

        {/* Personal Information */}
        <section>
          <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaUser size={10} /> Gender</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.gender || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaCalendarAlt size={10} /> Birthdate</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.birthdate || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <FaLaptopCode size={10} /> Course
              </p>
              <p className="text-sm font-bold text-indigo-700">{student.personalInfo?.course === 'IT' ? 'IT (Information Technology)' : 'CS (Computer Science)'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <FaBookOpen size={10} /> Year Level
              </p>
              <p className="text-sm font-bold text-indigo-700">{student.personalInfo?.yearLevel || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaEnvelope size={10} /> Email</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaPhone size={10} /> Contact</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.contact || 'N/A'}</p>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaMapMarkerAlt size={10} /> Address</p>
              <p className="text-sm font-bold text-gray-700">{student.personalInfo?.address || 'N/A'}</p>
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Documents</h3>
            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Medical Certificate</p>
                    {student.medicalCert ? (
                        <a
                            href={`${API_BASE_URL}/uploads/${student.medicalCert}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200 transition shadow-sm"
                        >
                            <FaClipboardList /> View Certificate
                        </a>
                    ) : (
                        <p className="text-sm text-gray-400 italic bg-white p-4 rounded-xl border border-gray-100 inline-block">No medical certificate uploaded.</p>
                    )}
                </div>
            </div>
        </section>

        {/* Academic History */}
        <section>
          <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Academic History</h3>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Academic Year</th>
                  <th className="px-6 py-4">Grade Level</th>
                  <th className="px-6 py-4 text-center">GPA</th>
                  <th className="px-6 py-4">Awards & Recognition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {student.academicHistory?.map((item, idx) => (
                  <tr key={idx} className="text-sm font-bold text-gray-600 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">{item.year}</td>
                    <td className="px-6 py-4">{item.gradeLevel}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                        {item.gpa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.awards?.map((award, i) => (
                          <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-black border border-yellow-100 uppercase tracking-tighter">{award}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!student.academicHistory || student.academicHistory.length === 0) && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">No academic history records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Non-Academic Activities */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Activities</h3>
            <div className="space-y-3">
              {student.nonAcademicActivities?.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <FaTrophy size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{activity.name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{activity.role} • {activity.year}</p>
                  </div>
                </div>
              ))}
              {(!student.nonAcademicActivities || student.nonAcademicActivities.length === 0) && (
                <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 italic">No activities recorded.</p>
                </div>
              )}
            </div>
          </section>

          {/* Violations */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Violations</h3>
            <div className="space-y-3">
              {student.violations?.map((v, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-4 shadow-sm transition-all hover:shadow-md ${getSeverityColor(v.severity)}`}>
                  <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">{v.description}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{v.severity} • {v.date}</p>
                  </div>
                </div>
              ))}
              {(!student.violations || student.violations.length === 0) && (
                <div className="flex flex-col items-center justify-center py-10 bg-emerald-50/30 rounded-2xl border border-dashed border-emerald-100">
                  <span className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black border border-emerald-100 shadow-sm uppercase tracking-widest transition-all hover:bg-emerald-100 cursor-default">
                    Clean Record
                  </span>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-3">No violations recorded</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Skills Section */}
        <section>
          <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Skills & Expertise</h3>
          <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <div className="flex flex-wrap gap-2.5">
              {student.skills?.map((skill, idx) => (
                <span key={idx} className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 shadow-sm hover:border-indigo-300 transition-all cursor-default">
                  {typeof skill === 'string' ? skill : skill.name || skill}
                </span>
              ))}
              {(!student.skills || student.skills.length === 0) && (
                <p className="text-sm text-gray-400 italic">No skills listed.</p>
              )}
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Achievements</h3>
            <button
              onClick={() => setIsAchievementModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md"
            >
              <FaPlus size={14} /> Add Achievement
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setActiveAchievementTab('Academic')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeAchievementTab === 'Academic'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Academic ({academicAchievements.length})
            </button>
            <button
              onClick={() => setActiveAchievementTab('Sports')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                activeAchievementTab === 'Sports'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sports ({sportsAchievements.length})
            </button>
          </div>

          {/* Achievement List */}
          <div className="space-y-3">
            {displayedAchievements.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400 italic">No {activeAchievementTab.toLowerCase()} achievements recorded.</p>
              </div>
            ) : (
              displayedAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      achievement.category === 'Academic' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <FaTrophy size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-gray-800">{achievement.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getAchievementStatusColor(achievement.status)}`}>
                          {achievement.status}
                        </span>
                      </div>
                      {achievement.description && (
                        <p className="text-xs text-gray-600 mb-1">{achievement.description}</p>
                      )}
                      <p className="text-[10px] text-gray-400 font-medium">{achievement.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Achievement"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

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

function AchievementFormModal({ onClose, onSave, isSubmitting, showAlert }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    date: '',
    description: '',
    status: 'approved'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showAlert('Validation Error', 'Please enter an achievement title', 'warning');
      return;
    }
    if (!formData.date) {
      showAlert('Validation Error', 'Please select a date', 'warning');
      return;
    }
    onSave(formData);
    // Reset form after submission
    setFormData({
      title: '',
      category: 'Academic',
      date: '',
      description: '',
      status: 'approved'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Add Achievement</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <FaTimes size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Achievement Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition"
              placeholder="e.g., Dean's List Award"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition"
              >
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition resize-none"
              placeholder="Describe the achievement..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}