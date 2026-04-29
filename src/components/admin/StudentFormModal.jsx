import React, { useState } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

export default function StudentFormModal({ isOpen, onClose, onSave, student }) {
  const initialForm = {
    id: '',
    firstName: '',
    lastName: '',
    password: '',
    photo: '',
    personalInfo: {
      birthdate: '',
      gender: 'Male',
      address: '',
      contact: '',
      email: '',
      course: 'IT',
      yearLevel: '1st Year'
    },
    academicHistory: [],
    nonAcademicActivities: [],
    violations: [],
    skills: [],
    affiliations: [],
    achievements: []  // Added: Initialize as empty array
  };

  const [formData, setFormData] = useState(student || initialForm);
  const [newSkill, setNewSkill] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    onConfirm: () => {},
    message: ''
  });

  // Reset form when student prop changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (student) {
        // Merge existing student with initialForm to ensure all fields exist
        setFormData({
          ...initialForm,
          ...student,
          personalInfo: {
            ...initialForm.personalInfo,
            ...(student.personalInfo || {})
          }
        });
      } else {
        setFormData(initialForm);
      }
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value }
    }));
  };

  const handleBaseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generic list item handlers
  const addEntry = (key, template) => {
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], template]
    }));
  };

  const updateEntry = (key, index, field, value) => {
    const newList = [...formData[key]];
    newList[index] = { ...newList[index], [field]: value };
    setFormData(prev => ({ ...prev, [key]: newList }));
  };

  const removeEntry = (key, index) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this entry?',
      onConfirm: () => {
        const newList = [...formData[key]];
        newList.splice(index, 1);
        setFormData(prev => ({ ...prev, [key]: newList }));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Skill handlers
  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClasses = "w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all duration-200";
  const labelClasses = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1";
  const sectionHeaderClasses = "text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 mt-8 first:mt-0";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800">{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Personal Info */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Student ID</label>
                <input name="id" value={formData.id} onChange={handleBaseChange} className={inputClasses} required placeholder="e.g. s001" />
              </div>
              <div>
                <label className={labelClasses}>Password (Login)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleBaseChange} 
                    className={`${inputClasses} pr-10`} 
                    required 
                    placeholder="Create a login password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClasses}>First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleBaseChange} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleBaseChange} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Gender</label>
                <select name="gender" value={formData.personalInfo.gender} onChange={handlePersonalChange} className={inputClasses}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Birthdate</label>
                <input type="date" name="birthdate" value={formData.personalInfo.birthdate} onChange={handlePersonalChange} className={inputClasses} required />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Address</label>
                <input name="address" value={formData.personalInfo.address} onChange={handlePersonalChange} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Contact Number</label>
                <input name="contact" value={formData.personalInfo.contact} onChange={handlePersonalChange} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Email</label>
                <input type="email" name="email" value={formData.personalInfo.email} onChange={handlePersonalChange} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Course</label>
                <select name="course" value={formData.personalInfo.course} onChange={handlePersonalChange} className={inputClasses} required>
                  <option value="IT">IT (Information Technology)</option>
                  <option value="CS">CS (Computer Science)</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Year Level</label>
                <select name="yearLevel" value={formData.personalInfo.yearLevel} onChange={handlePersonalChange} className={inputClasses} required>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          </section>

          {/* Academic History */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Academic History</h3>
              <button type="button" onClick={() => addEntry('academicHistory', { year: '', gradeLevel: 'Grade 7', gpa: '', awards: [] })} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1">
                <FaPlus size={10} /> Add Entry
              </button>
            </div>
            <div className="space-y-4">
              {formData.academicHistory.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                  <button type="button" onClick={() => removeEntry('academicHistory', idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-sm border border-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <FaTrash size={10} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className={labelClasses}>Year</label>
                      <input value={item.year} onChange={(e) => updateEntry('academicHistory', idx, 'year', e.target.value)} className={inputClasses} placeholder="2023-2024" />
                    </div>
                    <div>
                      <label className={labelClasses}>Grade Level</label>
                      <select value={item.gradeLevel} onChange={(e) => updateEntry('academicHistory', idx, 'gradeLevel', e.target.value)} className={inputClasses}>
                        <option value="">Select Grade</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>GPA</label>
                      <input type="number" value={item.gpa} onChange={(e) => updateEntry('academicHistory', idx, 'gpa', e.target.value)} className={inputClasses} placeholder="90" />
                    </div>
                    <div>
                      <label className={labelClasses}>Awards (comma separated)</label>
                      <input value={item.awards.join(', ')} onChange={(e) => updateEntry('academicHistory', idx, 'awards', e.target.value.split(',').map(a => a.trim()))} className={inputClasses} placeholder="With Honors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Non-Academic Activities */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Activities</h3>
              <button type="button" onClick={() => addEntry('nonAcademicActivities', { name: '', role: '', year: '' })} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1">
                <FaPlus size={10} /> Add Entry
              </button>
            </div>
            <div className="space-y-4">
              {formData.nonAcademicActivities.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                  <button type="button" onClick={() => removeEntry('nonAcademicActivities', idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-sm border border-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <FaTrash size={10} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={item.name} onChange={(e) => updateEntry('nonAcademicActivities', idx, 'name', e.target.value)} className={inputClasses} placeholder="Activity Name" />
                    <input value={item.role} onChange={(e) => updateEntry('nonAcademicActivities', idx, 'role', e.target.value)} className={inputClasses} placeholder="Role" />
                    <input value={item.year} onChange={(e) => updateEntry('nonAcademicActivities', idx, 'year', e.target.value)} className={inputClasses} placeholder="Year" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Violations */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Violations</h3>
              <button type="button" onClick={() => addEntry('violations', { description: '', date: '', severity: 'Minor' })} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1">
                <FaPlus size={10} /> Add Entry
              </button>
            </div>
            <div className="space-y-4">
              {formData.violations.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                  <button type="button" onClick={() => removeEntry('violations', idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-sm border border-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <FaTrash size={10} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={item.description} onChange={(e) => updateEntry('violations', idx, 'description', e.target.value)} className={inputClasses} placeholder="Description" />
                    <input type="date" value={item.date} onChange={(e) => updateEntry('violations', idx, 'date', e.target.value)} className={inputClasses} />
                    <select value={item.severity} onChange={(e) => updateEntry('violations', idx, 'severity', e.target.value)} className={inputClasses}>
                      <option value="Minor">Minor</option>
                      <option value="Major">Major</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>
              ))}
              {formData.violations.length === 0 && (
                <div className="flex justify-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="px-6 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100 shadow-sm uppercase tracking-widest transition-all hover:bg-emerald-100 cursor-default">
                    None
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Skills Tags */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Skills</h3>
            <div className="flex gap-2 mb-4">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className={inputClasses} placeholder="Add a skill (e.g. Programming)" />
              <button type="button" onClick={addSkill} className="px-6 bg-indigo-600 text-white rounded-xl font-bold text-xs">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100 flex items-center gap-2">
                  {skill}
                  <FaTimes onClick={() => removeSkill(skill)} className="cursor-pointer hover:text-red-500" />
                </span>
              ))}
            </div>
          </section>

          {/* Affiliations */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Affiliations</h3>
              <button type="button" onClick={() => addEntry('affiliations', { orgName: '', role: '', year: '' })} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1">
                <FaPlus size={10} /> Add Entry
              </button>
            </div>
            <div className="space-y-4">
              {formData.affiliations.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                  <button type="button" onClick={() => removeEntry('affiliations', idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-white text-red-500 rounded-full shadow-sm border border-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <FaTrash size={10} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input value={item.orgName} onChange={(e) => updateEntry('affiliations', idx, 'orgName', e.target.value)} className={inputClasses} placeholder="Organization Name" />
                    <input value={item.role} onChange={(e) => updateEntry('affiliations', idx, 'role', e.target.value)} className={inputClasses} placeholder="Role" />
                    <input value={item.year} onChange={(e) => updateEntry('affiliations', idx, 'year', e.target.value)} className={inputClasses} placeholder="Year" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-4 pt-8 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm">Cancel</button>
            <button type="submit" className="flex-1 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 text-sm flex items-center justify-center gap-2">
              <FaSave /> {student ? 'Update Student' : 'Save Student'}
            </button>
          </div>
        </form>

        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title="Confirm Action"
          message={confirmModal.message}
          type="warning"
          showCancel={true}
        />
      </div>
    </div>
  );
}
