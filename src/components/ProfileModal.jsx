import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaExclamationTriangle, FaBriefcase, FaUsers, FaBook, FaArrowLeft, FaEdit, FaSave, FaTimes as FaX, FaClipboardList, FaCheckCircle, FaLaptopCode, FaBookOpen, FaPlus, FaTrash } from 'react-icons/fa';

export default function ProfileModal({ isOpen, onClose, student }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [formData, setFormData] = useState(null);

  const fetchStudentData = async () => {
    if (!student?.id) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/students/${student.id}`);
      const studentData = response.data;
      setFormData({
        id: studentData?.id || '',
        firstName: studentData?.firstName || '',
        lastName: studentData?.lastName || '',
        password: studentData?.password || '',
        photo: studentData?.photo || '',
        medicalCert: studentData?.medicalCert || '',
        personalInfo: {
          email: studentData?.personalInfo?.email || '',
          gender: studentData?.personalInfo?.gender || '',
          birthdate: studentData?.personalInfo?.birthdate || '',
          contact: studentData?.personalInfo?.contact || '',
          address: studentData?.personalInfo?.address || '',
          course: studentData?.personalInfo?.course || 'IT',
          yearLevel: studentData?.personalInfo?.yearLevel || '1st Year'
        },
        academicHistory: studentData?.academicHistory || [],
        nonAcademicActivities: studentData?.nonAcademicActivities || [],
        violations: studentData?.violations || [],
        skills: studentData?.skills || [],
        affiliations: studentData?.affiliations || []
      });
    } catch (error) {
      console.error("Failed to fetch latest student data:", error);
      // Fallback to initial student prop if fetch fails
      setFormData({
        id: student?.id || '',
        firstName: student?.firstName || '',
        lastName: student?.lastName || '',
        password: student?.password || '',
        photo: student?.photo || '',
        medicalCert: student?.medicalCert || '',
        personalInfo: {
          email: student?.personalInfo?.email || '',
          gender: student?.personalInfo?.gender || '',
          birthdate: student?.personalInfo?.birthdate || '',
          contact: student?.personalInfo?.contact || '',
          address: student?.personalInfo?.address || '',
          course: student?.personalInfo?.course || 'IT',
          yearLevel: student?.personalInfo?.yearLevel || '1st Year'
        },
        academicHistory: student?.academicHistory || [],
        nonAcademicActivities: student?.nonAcademicActivities || [],
        violations: student?.violations || [],
        skills: student?.skills || [],
        affiliations: student?.affiliations || []
      });
    }
  };

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentData();
    }
  }, [isOpen, student]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const handleAddItem = (section, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], defaultItem]
    }));
  };

  const handleRemoveItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleMedicalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, medicalCert: file }));
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // First, upload the photo if it's a new file
      let photoFileName = formData.photo;
      if (formData.photo instanceof File) {
        const photoFormData = new FormData();
        photoFormData.append('photo', formData.photo);

        const photoResponse = await fetch(`http://localhost:5000/api/students/${student.id}/upload-photo`, {
          method: 'POST',
          body: photoFormData,
        });

        const photoData = await photoResponse.json();
        if (!photoResponse.ok) {
          throw new Error(photoData.message || 'Failed to upload photo');
        }
        photoFileName = photoData.photo;
      }

      // Upload medical certificate if it's a new file
      let medicalCertFileName = formData.medicalCert;
      if (formData.medicalCert instanceof File) {
        const medicalFormData = new FormData();
        medicalFormData.append('medicalCert', formData.medicalCert);

        const medicalResponse = await fetch(`http://localhost:5000/api/students/${student.id}/upload-medical`, {
          method: 'POST',
          body: medicalFormData,
        });

        const medicalData = await medicalResponse.json();
        if (!medicalResponse.ok) {
          throw new Error(medicalData.message || 'Failed to upload medical certificate');
        }
        medicalCertFileName = medicalData.medicalCert;
      }

      // Then, update the rest of the student data
      const updatedData = { ...formData, photo: photoFileName, medicalCert: medicalCertFileName };

      const response = await fetch(`http://localhost:5000/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      const data = await response.json();
      if (response.ok) {
        // Update sessionStorage with the new data, making sure to preserve the role
        const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
        const updatedUser = { ...data, role: currentUser.role || 'student' };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditMode(false);
        // Reload page after a brief delay to show the updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: 'Error saving profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      password: student?.password || '',
      personalInfo: {
        email: student?.personalInfo?.email || '',
        gender: student?.personalInfo?.gender || '',
        birthdate: student?.personalInfo?.birthdate || '',
        contact: student?.personalInfo?.contact || '',
        address: student?.personalInfo?.address || '',
        course: student?.personalInfo?.course || 'IT',
        yearLevel: student?.personalInfo?.yearLevel || '1st Year'
      },
      academicHistory: student?.academicHistory || [],
      nonAcademicActivities: student?.nonAcademicActivities || [],
      violations: student?.violations || [],
      skills: student?.skills || [],
      affiliations: student?.affiliations || []
    });
    setIsEditMode(false);
    setSaveMessage(null);
  };

  const sectionHeaderClasses = "text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 mt-8 first:mt-0";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-hidden animate-fadeIn">
      <div className="bg-slate-50 rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-scaleIn border border-white/20">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold overflow-hidden shadow-inner border border-indigo-100">
              {formData.photo ? (
                <img 
                  src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : `http://localhost:5000/uploads/${formData.photo}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span>{formData.firstName?.[0]}{formData.lastName?.[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{formData.firstName} {formData.lastName}</h1>
              <p className="text-[10px] text-indigo-500 font-black tracking-[0.2em] uppercase mt-0.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                {student.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50"
              >
                <FaEdit size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-emerald-200/50 disabled:opacity-50"
                >
                  <FaSave size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all font-bold flex items-center gap-2"
                >
                  <FaX size={14} /> Cancel
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all ml-2"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Save Message */}
          {saveMessage && (
            <div className={`mb-8 p-5 rounded-[1.5rem] flex items-center justify-between animate-fadeIn ${
              saveMessage.type === 'success' 
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border border-rose-100 text-rose-800'
            }`}>
              <span className="font-bold text-sm flex items-center gap-3">
                {saveMessage.type === 'success' ? <FaCheckCircle className="text-emerald-500" /> : <FaExclamationTriangle className="text-rose-500" />}
                {saveMessage.text}
              </span>
              <button onClick={() => setSaveMessage(null)} className="p-2 hover:bg-black/5 rounded-full transition-all"><FaX size={12} /></button>
            </div>
          )}

          <div className="space-y-10">
            {/* Login Credentials Box */}
            <div className="p-6 bg-white border border-indigo-50 rounded-[2rem] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-110 duration-700"></div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 relative">
                <FaClipboardList className="text-indigo-300" />
                Login Credentials
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Student ID</p>
                  <p className="text-base font-black text-slate-800">{student.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email for Login</p>
                  <p className="text-base font-black text-slate-800">{formData.personalInfo?.email}</p>
                </div>
              </div>
              <p className="text-[10px] text-indigo-500 mt-5 flex items-center gap-2 font-bold relative bg-indigo-50 w-fit px-4 py-1.5 rounded-full">
                <FaCheckCircle size={10} />
                Use Email and Password to login to student dashboard
              </p>
            </div>

            {/* Personal Information */}
            <section>
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Personal Information</h3>
              
              {isEditMode && (
                <div className="mb-8 p-6 bg-white border border-indigo-50 rounded-[2rem] shadow-sm">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Update Profile Photo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 border-2 border-dashed border-indigo-100 flex items-center justify-center overflow-hidden shadow-inner">
                      {formData.photo ? (
                        <img src={formData.photo instanceof File ? URL.createObjectURL(formData.photo) : `http://localhost:5000/uploads/${formData.photo}`} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FaUser size={28} className="text-indigo-200" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all cursor-pointer file:uppercase file:tracking-widest"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">Recommended: Square JPG or PNG, max 2MB</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isEditMode ? '' : 'bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm'}`}>
                {isEditMode ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                      <select
                        name="personalInfo.gender"
                        value={formData.personalInfo?.gender || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 shadow-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Birthdate</label>
                      <input
                        type="date"
                        name="personalInfo.birthdate"
                        value={formData.personalInfo?.birthdate || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Course</label>
                      <select
                        name="personalInfo.course"
                        value={formData.personalInfo?.course || 'IT'}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-sm text-indigo-700 shadow-sm"
                      >
                        <option value="IT">IT (Information Technology)</option>
                        <option value="CS">CS (Computer Science)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Year Level</label>
                      <select
                        name="personalInfo.yearLevel"
                        value={formData.personalInfo?.yearLevel || '1st Year'}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-black text-sm text-indigo-700 shadow-sm"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input
                        type="email"
                        name="personalInfo.email"
                        value={formData.personalInfo?.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                      <input
                        type="tel"
                        name="personalInfo.contact"
                        value={formData.personalInfo?.contact || ''}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 shadow-sm"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete Address</label>
                      <textarea
                        name="personalInfo.address"
                        value={formData.personalInfo?.address || ''}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-700 shadow-sm resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><FaUser size={10} className="text-slate-300" /> Gender</p>
                      <p className="text-sm font-black text-slate-700">{formData.personalInfo?.gender || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><FaCalendarAlt size={10} className="text-slate-300" /> Birthdate</p>
                      <p className="text-sm font-black text-slate-700">{formData.personalInfo?.birthdate || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2.5">
                        <FaLaptopCode size={10} /> Course
                      </p>
                      <p className="text-sm font-black text-indigo-700">{formData.personalInfo?.course === 'IT' ? 'IT (Information Technology)' : 'CS (Computer Science)'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2.5">
                        <FaBookOpen size={10} /> Grade Level
                      </p>
                      <p className="text-sm font-black text-indigo-700">{formData.personalInfo?.yearLevel || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><FaEnvelope size={10} className="text-slate-300" /> Email</p>
                      <p className="text-sm font-black text-slate-700">{formData.personalInfo?.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><FaPhone size={10} className="text-slate-300" /> Contact</p>
                      <p className="text-sm font-black text-slate-700">{formData.personalInfo?.contact || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5"><FaMapMarkerAlt size={10} className="text-slate-300" /> Address</p>
                      <p className="text-sm font-black text-slate-700">{formData.personalInfo?.address || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Documents Section */}
            <section>
                <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Documents</h3>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    {isEditMode ? (
                        <div>
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 block">Upload Medical Certificate</label>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        onChange={handleMedicalFileChange}
                                        className="text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all cursor-pointer file:uppercase file:tracking-widest"
                                    />
                                    {formData.medicalCert && typeof formData.medicalCert === 'string' && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Current file: <a href={`http://localhost:5000/uploads/${formData.medicalCert}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{formData.medicalCert}</a>
                                        </p>
                                    )}
                                     {formData.medicalCert instanceof File && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            New file: {formData.medicalCert.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Medical Certificate</p>
                            {formData.medicalCert ? (
                                <a
                                    href={`http://localhost:5000/uploads/${formData.medicalCert}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition"
                                >
                                    <FaClipboardList /> View Certificate
                                </a>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No medical certificate uploaded.</p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Academic History */}
            <section>
              <div className="flex items-center justify-between mt-8 mb-5">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-8 h-px bg-indigo-100"></span> Academic History
                </h3>
                {isEditMode && (
                  <button
                    onClick={() => handleAddItem('academicHistory', { year: '', gradeLevel: '', gpa: '', awards: [] })}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all shadow-sm border border-indigo-100"
                  >
                    <FaPlus size={12} />
                  </button>
                )}
              </div>
              <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm bg-white">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Academic Year</th>
                      <th className="px-8 py-5">Grade Level</th>
                      <th className="px-8 py-5 text-center">GPA</th>
                      <th className="px-8 py-5">Awards & Recognition</th>
                      {isEditMode && <th className="px-8 py-5 text-center w-24">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {formData.academicHistory.map((item, idx) => (
                      <tr key={idx} className="text-xs font-black text-slate-600 hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.year}
                              onChange={(e) => handleArrayChange('academicHistory', idx, 'year', e.target.value)}
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                              placeholder="2023-2024"
                            />
                          ) : item.year}
                        </td>
                        <td className="px-8 py-5">
                          {isEditMode ? (
                            <select
                              value={item.gradeLevel}
                              onChange={(e) => handleArrayChange('academicHistory', idx, 'gradeLevel', e.target.value)}
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                            >
                              <option value="">Select Grade</option>
                              <option value="Grade 7">Grade 7</option>
                              <option value="Grade 8">Grade 8</option>
                              <option value="Grade 9">Grade 9</option>
                              <option value="Grade 10">Grade 10</option>
                              <option value="Grade 11">Grade 11</option>
                              <option value="Grade 12">Grade 12</option>
                            </select>
                          ) : item.gradeLevel}
                        </td>
                        <td className="px-8 py-5 text-center">
                          {isEditMode ? (
                            <input
                              type="text"
                              value={item.gpa}
                              onChange={(e) => handleArrayChange('academicHistory', idx, 'gpa', e.target.value)}
                              className="w-20 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-center font-bold"
                              placeholder="1.00"
                            />
                          ) : <span className="text-indigo-600 font-black">{item.gpa}</span>}
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-2">
                            {isEditMode ? (
                              <input
                                type="text"
                                value={item.awards?.join(', ')}
                                onChange={(e) => handleArrayChange('academicHistory', idx, 'awards', e.target.value.split(',').map(s => s.trim()))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                                placeholder="Dean's List, etc."
                              />
                            ) : (
                              item.awards?.map((award, i) => (
                                <span key={i} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] border border-amber-100 font-black shadow-sm">{award}</span>
                              ))
                            )}
                          </div>
                        </td>
                        {isEditMode && (
                          <td className="px-8 py-5 text-center">
                            <button onClick={() => handleRemoveItem('academicHistory', idx)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><FaTrash size={14} /></button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Activities */}
              <section>
                <div className="flex items-center justify-between mt-8 mb-5">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-px bg-indigo-100"></span> Activities
                  </h3>
                  {isEditMode && (
                    <button
                      onClick={() => handleAddItem('nonAcademicActivities', { name: '', role: '', year: '' })}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                    >
                      <FaPlus size={12} />
                    </button>
                  )}
                </div>
                <div className="space-y-5">
                  {formData.nonAcademicActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                        <FaTrophy size={18} />
                      </div>
                      <div className="flex-1">
                        {isEditMode ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={activity.name}
                              onChange={(e) => handleArrayChange('nonAcademicActivities', idx, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                              placeholder="Activity Name"
                            />
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={activity.role}
                                onChange={(e) => handleArrayChange('nonAcademicActivities', idx, 'role', e.target.value)}
                                className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl text-[10px] font-bold"
                                placeholder="Role"
                              />
                              <input
                                type="text"
                                value={activity.year}
                                onChange={(e) => handleArrayChange('nonAcademicActivities', idx, 'year', e.target.value)}
                                className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl text-[10px] font-bold"
                                placeholder="Year"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-black text-slate-800 leading-tight">{activity.name}</p>
                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1.5">{activity.role} • {activity.year}</p>
                          </>
                        )}
                      </div>
                      {isEditMode && (
                        <button onClick={() => handleRemoveItem('nonAcademicActivities', idx)} className="p-2 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.nonAcademicActivities.length === 0 && <p className="text-xs text-slate-400 italic text-center py-10 bg-white rounded-[2rem] border border-dashed border-slate-200">No activities recorded.</p>}
                </div>
              </section>

              {/* Violations */}
              <section>
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-8 mb-5 flex items-center gap-2">
                  <span className="w-8 h-px bg-indigo-100"></span> Violations
                </h3>
                <div className="space-y-5">
                  {formData.violations.map((v, idx) => {
                    const getSeverityColor = (severity) => {
                      switch (severity) {
                        case 'Minor': return 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-50/50';
                        case 'Major': return 'bg-orange-50 text-orange-700 border-orange-100 shadow-orange-50/50';
                        case 'Severe': return 'bg-rose-50 text-rose-700 border-rose-100 shadow-rose-50/50';
                        default: return 'bg-slate-50 text-slate-700 border-slate-100';
                      }
                    };
                    return (
                      <div key={idx} className={`p-5 rounded-[2rem] border flex items-start gap-5 shadow-sm transition-all ${getSeverityColor(v.severity)}`}>
                        <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/40">
                          <FaExclamationTriangle size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black leading-tight">{v.description}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1.5">{v.severity} • {v.date}</p>
                        </div>
                      </div>
                    );
                  })}
                  {formData.violations.length === 0 && (
                    <div className="flex justify-center py-6 bg-white rounded-[2rem] border border-dashed border-slate-200">
                      <span className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100 shadow-sm uppercase tracking-widest transition-all hover:bg-emerald-100 cursor-default">
                        None
                      </span>
                    </div>
                  )}
                  {!isEditMode && formData.violations.length === 0 && (
                    <div className="flex items-center justify-center gap-3 p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm">
                      <FaCheckCircle size={14} className="animate-bounce" /> Good Standing - Clean Record
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Skills */}
              <section>
                <div className="flex items-center justify-between mt-8 mb-5">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-px bg-indigo-100"></span> Skills
                  </h3>
                  {isEditMode && (
                    <button
                      onClick={() => handleAddItem('skills', '')}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                    >
                      <FaPlus size={12} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                  {formData.skills.map((skill, idx) => (
                    <div key={idx} className="group relative">
                      {isEditMode ? (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 shadow-sm transition-all hover:border-indigo-300">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...formData.skills];
                              newSkills[idx] = e.target.value;
                              setFormData(prev => ({ ...prev, skills: newSkills }));
                            }}
                            className="bg-transparent text-[10px] font-black text-indigo-600 outline-none w-24 uppercase tracking-widest"
                          />
                          <button onClick={() => handleRemoveItem('skills', idx)} className="text-indigo-300 hover:text-rose-500 transition-colors"><FaTimes size={10} /></button>
                        </div>
                      ) : (
                        <span className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100 transition-all hover:bg-indigo-100 uppercase tracking-widest shadow-sm">
                          {skill}
                        </span>
                      )}
                    </div>
                  ))}
                  {formData.skills.length === 0 && <p className="text-[10px] text-slate-400 font-bold py-2 uppercase tracking-widest">No skills added yet.</p>}
                </div>
              </section>

              {/* Affiliations */}
              <section>
                <div className="flex items-center justify-between mt-8 mb-5">
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-8 h-px bg-indigo-100"></span> Affiliations
                  </h3>
                  {isEditMode && (
                    <button
                      onClick={() => handleAddItem('affiliations', { orgName: '', role: '', year: '' })}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm"
                    >
                      <FaPlus size={12} />
                    </button>
                  )}
                </div>
                <div className="space-y-5">
                  {formData.affiliations.map((aff, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-5 bg-white rounded-[2rem] border border-slate-100 group hover:shadow-md transition-all shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 border border-slate-100">
                        <FaUsers size={18} />
                      </div>
                      <div className="flex-1">
                        {isEditMode ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={aff.orgName}
                              onChange={(e) => handleArrayChange('affiliations', idx, 'orgName', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold"
                              placeholder="Organization Name"
                            />
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={aff.role}
                                onChange={(e) => handleArrayChange('affiliations', idx, 'role', e.target.value)}
                                className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl text-[10px] font-bold"
                                placeholder="Role"
                              />
                              <input
                                type="text"
                                value={aff.year}
                                onChange={(e) => handleArrayChange('affiliations', idx, 'year', e.target.value)}
                                className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl text-[10px] font-bold"
                                placeholder="Year"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-black text-slate-800 leading-tight">{aff.orgName}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5">{aff.role} • {aff.year}</p>
                          </>
                        )}
                      </div>
                      {isEditMode && (
                        <button onClick={() => handleRemoveItem('affiliations', idx)} className="p-2 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.affiliations.length === 0 && <p className="text-xs text-slate-400 italic text-center py-10 bg-white rounded-[2rem] border border-dashed border-slate-200">No affiliations recorded.</p>}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
