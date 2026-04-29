import React from 'react';
import { FaTimes, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaExclamationTriangle, FaBriefcase, FaUsers, FaClipboardList, FaCheckCircle, FaLaptopCode, FaBookOpen } from 'react-icons/fa';

export default function StudentViewModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Minor': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Major': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Severe': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const sectionHeaderClasses = "text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 mt-8 first:mt-0";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{student.firstName} {student.lastName}</h2>
              <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">{student.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* Login Credentials Info Box */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <FaClipboardList className="text-blue-500" />
              Student Login Credentials
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Student ID</p>
                <p className="text-sm font-semibold text-gray-800">{student.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Email for Login</p>
                <p className="text-sm font-semibold text-gray-800">{student.personalInfo.email}</p>
              </div>
            </div>
            <p className="text-[10px] text-blue-600 mt-3 flex items-center gap-1.5">
              <FaCheckCircle className="text-blue-500" />
              Use Email and Password to login to student dashboard
            </p>
          </div>

          {/* Personal Information */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaUser size={10} /> Gender</p>
                <p className="text-sm font-semibold text-gray-700">{student.personalInfo.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaCalendarAlt size={10} /> Birthdate</p>
                <p className="text-sm font-semibold text-gray-700">{student.personalInfo.birthdate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <FaLaptopCode size={10} /> Course
                </p>
                <p className="text-sm font-semibold text-indigo-700">{student.personalInfo.course === 'IT' ? 'IT (Information Technology)' : 'CS (Computer Science)'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <FaBookOpen size={10} /> Year Level
                </p>
                <p className="text-sm font-semibold text-indigo-700">{student.personalInfo.yearLevel || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaEnvelope size={10} /> Email</p>
                <p className="text-sm font-semibold text-gray-700">{student.personalInfo.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaPhone size={10} /> Contact</p>
                <p className="text-sm font-semibold text-gray-700">{student.personalInfo.contact}</p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaMapMarkerAlt size={10} /> Address</p>
                <p className="text-sm font-semibold text-gray-700">{student.personalInfo.address}</p>
              </div>
            </div>
          </section>

          {/* Documents Section */}
            <section>
                <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Documents</h3>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Medical Certificate</p>
                        {student.medicalCert ? (
                            <a
                                href={`http://localhost:5000/uploads/${student.medicalCert}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition"
                            >
                                <FaClipboardList /> View Certificate
                            </a>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No medical certificate uploaded.</p>
                        )}
                    </div>
                </div>
            </section>

          {/* Academic History */}
          <section>
            <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Academic History</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Academic Year</th>
                    <th className="px-4 py-3">Grade Level</th>
                    <th className="px-4 py-3 text-center">GPA</th>
                    <th className="px-4 py-3">Awards & Recognition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {student.academicHistory.map((item, idx) => (
                    <tr key={idx} className="text-xs font-medium text-gray-600">
                      <td className="px-4 py-3">{item.year}</td>
                      <td className="px-4 py-3">{item.gradeLevel}</td>
                      <td className="px-4 py-3 text-indigo-600 font-bold">{item.gpa}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.awards.map((award, i) => (
                            <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-[10px] border border-yellow-100">{award}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Non-Academic Activities */}
            <section>
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Activities</h3>
              <div className="space-y-3">
                {student.nonAcademicActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FaTrophy size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{activity.name}</p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{activity.role} • {activity.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Violations */}
            <section>
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Violations</h3>
              <div className="space-y-3">
                {student.violations.map((v, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border flex items-start gap-4 ${getSeverityColor(v.severity)}`}>
                    <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{v.description}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{v.severity} • {v.date}</p>
                    </div>
                  </div>
                ))}
                {student.violations.length === 0 && (
                  <div className="flex justify-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <span className="px-6 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100 shadow-sm uppercase tracking-widest transition-all hover:bg-emerald-100 cursor-default">
                      None
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skills */}
            <section>
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Skills</h3>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold border border-indigo-100">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Affiliations */}
            <section>
              <h3 className={sectionHeaderClasses}><span className="w-8 h-px bg-indigo-100"></span> Affiliations</h3>
              <div className="space-y-3">
                {student.affiliations.map((aff, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center flex-shrink-0">
                      <FaUsers size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{aff.orgName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{aff.role} • {aff.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
