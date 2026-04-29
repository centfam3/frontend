import { useState } from 'react';
import API_BASE_URL from '../config';
import { MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { FaUser, FaEnvelope, FaIdCard, FaCalendar, FaBook, FaBriefcase } from 'react-icons/fa';
import ConfirmModal from './admin/ConfirmModal';

export default function FacultyProfile({ user, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    facultyid: user?.facultyid || '',
    birthdate: user?.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '',
    program: user?.program || '',
    position: user?.position || '',
  });
  const [displayUser, setDisplayUser] = useState(user);
  
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSave = async () => {
    try {
      const facultyId = user.facultyid || user.id;
      if (!facultyId) {
        showAlert('Error', 'Faculty ID is missing', 'danger');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/faculty/${facultyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the local display user and call parent callback
        const updatedUser = { ...user, ...formData };
        setDisplayUser(updatedUser);
        
        // Call parent's onProfileUpdate callback to update navbar and header
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser);
        }
        
        setIsEditing(false);
        showAlert('Success', 'Profile updated successfully!', 'success');
      } else {
        console.error('Update error:', data);
        showAlert('Update Failed', `Failed to update profile: ${data.message || 'Unknown error'}`, 'danger');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert('Error', `Error updating profile: ${error.message}`, 'danger');
    }
  };

  const handleCancel = () => {
    setFormData({
      fullname: displayUser?.fullname || '',
      email: displayUser?.email || '',
      facultyid: displayUser?.facultyid || '',
      birthdate: displayUser?.birthdate ? new Date(displayUser.birthdate).toISOString().split('T')[0] : '',
      program: displayUser?.program || '',
      position: displayUser?.position || '',
    });
    setIsEditing(false);
  };

  const ProfileField = ({ icon, label, value, name, editable = false }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center text-orange-600">
          {icon}
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
          {isEditing && editable ? (
            name === 'program' || name === 'position' ? (
              <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              >
                {name === 'program' && (
                  <>
                    <option value="">Select Program</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
                  </>
                )}
                {name === 'position' && (
                  <>
                    <option value="">Select Position</option>
                    <option value="IT Professor">IT Professor</option>
                    <option value="CS Professor">CS Professor</option>
                  </>
                )}
              </select>
            ) : (
              <input
                type={name === 'birthdate' ? 'date' : 'text'}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                disabled={name === 'email' || name === 'facultyid'}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            )
          ) : (
            <p className="mt-2 text-gray-800 font-medium text-lg">{value}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-5xl font-bold">
              {displayUser?.fullname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{displayUser?.fullname}</h1>
              <p className="text-orange-100 text-lg mt-1">{displayUser?.position}</p>
              <p className="text-orange-50 text-sm mt-1">Faculty ID: {displayUser?.facultyid}</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <MdEdit size={20} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileField 
          icon={<FaUser size={20} />}
          label="Full Name"
          value={formData.fullname}
          name="fullname"
          editable={true}
        />
        <ProfileField 
          icon={<FaEnvelope size={20} />}
          label="Email"
          value={formData.email}
          name="email"
          editable={false}
        />
        <ProfileField 
          icon={<FaIdCard size={20} />}
          label="Faculty ID"
          value={formData.facultyid}
          name="facultyid"
          editable={false}
        />
        <ProfileField 
          icon={<FaCalendar size={20} />}
          label="Date of Birth"
          value={formData.birthdate ? new Date(formData.birthdate).toLocaleDateString() : 'N/A'}
          name="birthdate"
          editable={true}
        />
        <ProfileField 
          icon={<FaBook size={20} />}
          label="Program"
          value={formData.program}
          name="program"
          editable={true}
        />
        <ProfileField 
          icon={<FaBriefcase size={20} />}
          label="Position"
          value={formData.position}
          name="position"
          editable={true}
        />
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-4 justify-end">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 bg-gray-300 text-gray-700 hover:bg-gray-400 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <MdCancel size={20} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-orange-600 text-white hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <MdSave size={20} />
            Save Changes
          </button>
        </div>
      )}

      {/* Additional Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold text-gray-700">Role:</span> {user?.role === 'faculty_admin' ? 'Faculty with Admin Access' : 'Faculty'}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Member Since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </div>
          <div>
            <span className="font-semibold text-gray-700">Last Updated:</span> {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Permissions Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">Your Permissions</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span> Manage Students
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span> Manage Events
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span> Assign Events
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span> Create Announcements
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500 font-bold">✓</span> View Reports
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-500 font-bold">✗</span> Manage Faculty Members
          </li>
        </ul>
      </div>

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
