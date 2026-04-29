import { useState, useEffect } from 'react';
import { MdClose, MdFileDownload } from 'react-icons/md';
import { FaUser, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';
import axios from 'axios';

export default function ParticipantsViewModal({ isOpen, onClose, event }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch participant details when modal opens
  useEffect(() => {
    if (!isOpen || !event) return;
    
    const fetchParticipants = async () => {
      if (!event.participants || event.participants.length === 0) {
        setParticipants([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch all students
        const response = await axios.get('http://localhost:5000/api/students');
        const allStudents = response.data;

        // Filter students that are in the event's participants array
        const eventParticipants = allStudents.filter(student => 
          event.participants.includes(student.id)
        );

        // Map to display format
        const participantList = eventParticipants.map(student => ({
          id: student.id,
          name: student.firstName && student.lastName ? `${student.firstName} ${student.lastName}` : student.name || 'Unknown',
          email: student.personalInfo?.email || student.email || 'N/A',
          phone: student.personalInfo?.phone || student.phone || 'N/A',
          registeredDate: new Date(),
        }));

        setParticipants(participantList);
      } catch (error) {
        console.error('Error fetching participants:', error);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [isOpen, event]);

  // Don't render if modal isn't open or event doesn't exist
  if (!isOpen || !event) return null;

  const handleDownloadList = () => {
    // Create CSV content
    const headers = ['Student ID', 'Name', 'Email', 'Phone', 'Registration Date'];
    const rows = participants.map(p => [
      p.id || 'N/A',
      p.name || 'N/A',
      p.email || 'N/A',
      p.phone || 'N/A',
      p.registeredDate ? new Date(p.registeredDate).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name}-participants.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Event Participants</h2>
            <p className="text-sm text-gray-500 mt-1">{event.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 font-medium">Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUser className="text-gray-300 text-2xl" />
              </div>
              <p className="text-gray-500 font-medium">No participants yet</p>
              <p className="text-gray-400 text-sm mt-1">Participants will appear here when they register</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {participants.map((participant, idx) => (
                <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                      {participant.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800 truncate">{participant.name || 'Unknown'}</h3>
                        {participant.id && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-bold flex-shrink-0">
                            {participant.id}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        {participant.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaEnvelope size={12} className="text-gray-400" />
                            <span className="truncate">{participant.email}</span>
                          </div>
                        )}
                        {participant.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaPhone size={12} className="text-gray-400" />
                            <span>{participant.phone}</span>
                          </div>
                        )}
                        {participant.registeredDate && (
                          <div className="text-xs text-gray-500">
                            Registered: {new Date(participant.registeredDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-bold text-indigo-600">{participants.length}</span> / {event.maxParticipants || '∞'} participants
          </div>
          <div className="flex gap-3">
            {participants.length > 0 && (
              <button
                onClick={handleDownloadList}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-semibold text-sm transition-all"
              >
                <MdFileDownload size={16} />
                Download List
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-semibold text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
