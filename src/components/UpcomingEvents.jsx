import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaClock, FaMapPin, FaChevronRight, FaSpinner } from 'react-icons/fa';

const UpcomingEvents = ({ onViewAll }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const sortedEvents = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);
      } catch (err) {
        setError('Failed to fetch events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = event.endDate && event.endTime ? new Date(`${event.endDate}T${event.endTime}`) : startDate;

    if (now < startDate) {
      return { text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= startDate && now <= endDate) {
      return { text: 'Ongoing', color: 'bg-green-100 text-green-800 animate-pulse' };
    } else {
      return { text: 'Finished', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-white rounded-2xl shadow-lg">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
        <p className="ml-4 text-lg font-semibold text-gray-700">Loading Events...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 bg-red-50 text-red-700 rounded-2xl shadow-lg">{error}</div>;
  }

  const activeEvents = events.filter(event => {
    const status = getEventStatus(event);
    return status.text !== 'Finished';
  });

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-slate-800">Upcoming & Ongoing Events</h2>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-sm font-bold rounded-full">{activeEvents.length}</span>
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-indigo-600 text-sm font-semibold hover:underline cursor-pointer"
          >
            View All
          </button>
        )}
      </div>
      <div className="space-y-5">
        {activeEvents.length > 0 ? (
          activeEvents.map(event => {
            const status = getEventStatus(event);

            return (
              <div key={event.id} className="grid grid-cols-12 gap-6 items-center p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                <div className="col-span-3">
                  <p className="text-sm font-bold text-indigo-600">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-slate-500">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                </div>
                <div className="col-span-6 border-l-2 border-slate-200 pl-6">
                  <p className="font-bold text-slate-800">{event.name}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1.5"><FaClock /> {event.time} - {event.endTime}</span>
                    <span className="flex items-center gap-1.5"><FaMapPin /> {event.venue}</span>
                  </div>
                </div>
                <div className="col-span-3 flex justify-end items-center gap-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${status.color}`}>
                        {status.text}
                    </span>
                    <button className="p-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-indigo-500 hover:text-white transition-colors">
                        <FaChevronRight size={12} />
                    </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-slate-500 py-8">No upcoming events found.</p>
        )}
      </div>
    </div>
  );
};

export default UpcomingEvents;
