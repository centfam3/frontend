import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'
import EventCard from './EventCard'

export default function EventParticipation({ user, searchQuery = '' }) {
  const [activeTab, setActiveTab] = useState('available')
  const [availableEvents, setAvailableEvents] = useState([])
  const [pendingEvents, setPendingEvents] = useState([])
  const [assignedEvents, setAssignedEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    try {
      const eventsRes = await axios.get(`${API_BASE_URL}/api/events`);
      const allEvents = eventsRes.data;

      const available = allEvents.filter(event =>
        !event.participants?.includes(user?.id) && !event.pendingRequests?.includes(user?.id)
      );

      const pending = allEvents.filter(event =>
        event.pendingRequests?.includes(user?.id) && !event.participants?.includes(user?.id)
      );

      const assigned = allEvents.filter(event =>
        event.participants?.includes(user?.id)
      );

      setAvailableEvents(available);
      setPendingEvents(pending);
      setAssignedEvents(assigned);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setAvailableEvents([]);
      setPendingEvents([]);
      setAssignedEvents([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEvents();
    }
  }, [user?.id]);

  const handleEventUpdated = () => {
    fetchEvents();
  };

  const filterBySearch = (events) => {
    if (!searchQuery) return events;
    return events.filter(e => 
      (e.name || e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.venue || e.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const displayedAvailable = filterBySearch(availableEvents);
  const displayedPending = filterBySearch(pendingEvents);
  const displayedAssigned = filterBySearch(assignedEvents);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Participation</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'available'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Available Events
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Requests {displayedPending.length > 0 && `(${displayedPending.length})`}
        </button>
        <button
          onClick={() => setActiveTab('assigned')}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === 'assigned'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Assigned Events
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 font-medium">Loading events...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'available' ? (
            displayedAvailable.length > 0 ? (
              displayedAvailable.map((event) => (
                <EventCard key={event.id} event={event} isAssigned={false} user={user} hasPending={false} onEventUpdated={handleEventUpdated} />
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500 font-medium">No available events found</p>
                <p className="text-gray-400 text-sm mt-1">Check back soon for upcoming events!</p>
              </div>
            )
          ) : activeTab === 'pending' ? (
            displayedPending.length > 0 ? (
              displayedPending.map((event) => (
                <EventCard key={event.id} event={event} isAssigned={false} user={user} hasPending={true} onEventUpdated={handleEventUpdated} />
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500 font-medium">No pending requests found</p>
                <p className="text-gray-400 text-sm mt-1">Your request approvals will appear here!</p>
              </div>
            )
          ) : (
            displayedAssigned.length > 0 ? (
              displayedAssigned.map((event) => (
                <EventCard key={event.id} event={event} isAssigned={true} user={user} hasPending={false} onEventUpdated={handleEventUpdated} />
              ))
            ) : (
              <div className="col-span-2 p-12 text-center bg-white rounded-lg border border-gray-100">
                <p className="text-gray-500 font-medium">No assigned events found</p>
                <p className="text-gray-400 text-sm mt-1">Browse available events to join!</p>
              </div>
            )
          )}
        </div>
      )}


    </div>
  )
}