import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function FacultyFormModal({ isOpen, onClose, onSave, faculty }) {
  const initialForm = {
    facultyid: '',
    fullname: '',
    email: '',
    password: '',
    birthdate: '',
    program: 'BSIT',
    position: 'IT Professor',
    role: 'faculty_admin'
  };

  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (faculty) {
        setFormData({
          facultyid: faculty.facultyid,
          fullname: faculty.fullname,
          email: faculty.email,
          password: '', // Don't pre-fill password for security
          birthdate: faculty.birthdate ? new Date(faculty.birthdate).toISOString().split('T')[0] : '',
          program: faculty.program,
          position: faculty.position,
          role: faculty.role || 'faculty_admin'
        });
      } else {
        setFormData(initialForm);
      }
      setErrors({});
    }
  }, [faculty, isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.facultyid.trim()) newErrors.facultyid = 'Faculty ID is required';
    if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!faculty && !formData.password) newErrors.password = 'Password is required for new faculty';
    if (!formData.birthdate) newErrors.birthdate = 'Birth date is required';
    if (!formData.program) newErrors.program = 'Program is required';
    if (!formData.position) newErrors.position = 'Position is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Only send password if it's provided (for new faculty or password change)
      const dataToSend = { ...formData };
      if (!dataToSend.password && faculty) {
        delete dataToSend.password;
      }
      onSave(dataToSend);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex items-center justify-between border-b border-indigo-700">
          <h2 className="text-2xl font-bold text-white">
            {faculty ? 'Edit Faculty' : 'Add New Faculty'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Faculty ID */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Faculty ID *</label>
            <input
              type="text"
              name="facultyid"
              value={formData.facultyid}
              onChange={handleChange}
              disabled={!!faculty}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                errors.facultyid ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 ${faculty ? 'bg-gray-100' : ''}`}
            />
            {errors.facultyid && <p className="text-red-500 text-sm mt-1">{errors.facultyid}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                errors.fullname ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password {!faculty && '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Birth Date *</label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border transition-all ${
                errors.birthdate ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>}
          </div>

          {/* Program & Position Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Program */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Program *</label>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors.program ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="BSIT">BSIT (Bachelor of Science - IT)</option>
                <option value="BSCS">BSCS (Bachelor of Science - CS)</option>
              </select>
              {errors.program && <p className="text-red-500 text-sm mt-1">{errors.program}</p>}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Position *</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-all ${
                  errors.position ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="IT Professor">IT Professor</option>
                <option value="CS Professor">CS Professor</option>
              </select>
              {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <FaSave size={18} />
              {faculty ? 'Update Faculty' : 'Create Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
