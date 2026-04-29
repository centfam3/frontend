import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { FaCalendarAlt, FaBullhorn, FaExclamationCircle } from 'react-icons/fa';

function AnnouncementCard({ announcement }) {
  const categoryColor = {
    General: 'bg-blue-100 text-blue-700 border-blue-200',
    'Event Update': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Urgent: 'bg-red-100 text-red-700 border-red-200',
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className={`bg-white border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 ${announcement.category === 'Urgent' ? 'border-red-100 shadow-red-50/50 shadow-md' : 'border-gray-100 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${announcement.category === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {announcement.category === 'Urgent' ? <FaExclamationCircle /> : <FaBullhorn />}
          </div>
          <div>
            <h3 className={`text-lg font-bold leading-tight mb-1 ${announcement.category === 'Urgent' ? 'text-red-900' : 'text-gray-900'}`}>{announcement.title}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <FaCalendarAlt className="opacity-70" />
              {formatDate(announcement.date)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${categoryColor[announcement.category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
          {announcement.category}
        </span>
      </div>
      <div className={`text-sm leading-relaxed p-4 rounded-xl ${announcement.category === 'Urgent' ? 'bg-red-50/50 text-red-800' : 'bg-gray-50 text-gray-600'}`}>
        {announcement.content}
      </div>
    </div>
  )
}

export default function StudentAnnouncements({ student, searchQuery = '' }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // Fetch announcements and events in parallel
        const [annResponse, eventsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/announcements`),
          axios.get(`${API_BASE_URL}/api/events`)
        ]);

        // Get events student is registered for
        const studentEvents = eventsResponse.data
          .filter(event => event.participants && event.participants.includes(student?.id))
          .map(event => event.name);

        // Filter only published announcements for students
        const filteredAnnouncements = annResponse.data.filter(ann => {
          const isPublished = ann.status === 'Published';
          const isTargeted = ann.targetAudience === 'All Students' || studentEvents.includes(ann.targetAudience);
          return isPublished && isTargeted;
        }).reverse();

        setAnnouncements(filteredAnnouncements);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [student?.id]);

  const filteredAnnouncements = announcements.filter(ann => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return ann.title.toLowerCase().includes(query) || 
           ann.content.toLowerCase().includes(query) ||
           ann.category.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Announcements</h1>
        <p className="text-slate-500 font-medium">Stay updated with the latest news and announcements from the administration</p>
      </div>

      <div className="space-y-6">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        ) : (
          <div className="p-16 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBullhorn className="text-slate-200 text-3xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No matching announcements found</h3>
            <p className="text-slate-400 font-medium mt-1">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  )
}
