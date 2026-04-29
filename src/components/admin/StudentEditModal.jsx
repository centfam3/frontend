import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';

export default function StudentEditModal({ isOpen, onClose, onSave, student }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guardian: '',
    guardianContact: '',
    hobbies: '',
    medicalInfo: '',
    skills: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        guardian: student.guardian || '',
        guardianContact: student.guardianContact || '',
        hobbies: Array.isArray(student.hobbies) ? student.hobbies.join(', ') : '',
        medicalInfo: student.medicalInfo || '',
        skills: Array.isArray(student.skills) ? student.skills.join(', ') : '',
      });
    }
  }, [student]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedStudent = {
      ...student,
      ...formData,
      hobbies: formData.hobbies.split(',').map(h => h.trim()).filter(h => h !== ''),
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
    };
    onSave(updatedStudent);
    onClose();
  };

  const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-gray-300";
  const labelClasses = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Student Profile</h2>
            <p className="text-xs text-gray-400 font-medium">Student ID: <span className="text-indigo-600 font-bold">{student?.id}</span></p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {student?.isProfileComplete === false && (
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-200">
                <FaSave size={14} />
              </div>
              <div>
                <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Incomplete Profile</p>
                <p className="text-[10px] text-orange-600 font-medium">This student has not yet completed their onboarding information.</p>
              </div>
            </div>
          )}

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-indigo-100"></span> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className={inputClasses} required placeholder="Enter student's full name" />
              </div>
              <div>
                <label className={labelClasses}>Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputClasses} required placeholder="student@example.com" />
              </div>
              <div>
                <label className={labelClasses}>Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} required placeholder="+1 234 567 8901" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-indigo-100"></span> Guardian Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>Guardian Name</label>
                <input name="guardian" value={formData.guardian} onChange={handleChange} className={inputClasses} required placeholder="Full name of guardian" />
              </div>
              <div>
                <label className={labelClasses}>Guardian Contact</label>
                <input name="guardianContact" value={formData.guardianContact} onChange={handleChange} className={inputClasses} required placeholder="+1 234 567 8902" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-indigo-100"></span> Interests & Skills
            </h3>
            <div className="space-y-6">
              <div>
                <label className={labelClasses}>Skills (comma separated)</label>
                <input name="skills" value={formData.skills} onChange={handleChange} className={inputClasses} placeholder="React, Tailwind, Node.js" />
              </div>
              <div>
                <label className={labelClasses}>Hobbies (comma separated)</label>
                <input name="hobbies" value={formData.hobbies} onChange={handleChange} className={inputClasses} placeholder="Photography, Hiking" />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-indigo-100"></span> Health Records
            </h3>
            <div>
              <label className={labelClasses}>Medical Information</label>
              <textarea name="medicalInfo" value={formData.medicalInfo} onChange={handleChange} rows="3" className={inputClasses} placeholder="Allergies, chronic conditions, etc."></textarea>
            </div>
          </section>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FaSave /> Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
