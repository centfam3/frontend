import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'
import { useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import StudentSidebar from '../components/StudentSidebar'
import StudentNavbar from '../components/StudentNavbar'
import Footer from '../components/Footer'
import ProfileModal from '../components/ProfileModal'
import MyAchievements from '../components/MyAchievements'
import EventParticipation from '../components/EventParticipation'
import StudentAnnouncements from '../components/StudentAnnouncements'
import UpcomingEvents from '../components/UpcomingEvents';
import { FaGraduationCap, FaTrophy, FaCalendarAlt, FaBullhorn, FaClock, FaMapPin, FaUser, FaExclamationCircle } from 'react-icons/fa'

const mockNotifications = [
  { id: 1, message: 'Your achievement "Dean\'s List" has been approved', timestamp: '2 hours ago' },
  { id: 2, message: 'New announcement: Mid-year break schedule released', timestamp: '4 hours ago' },
  { id: 3, message: 'Reminder: Enrollment deadline is tomorrow', timestamp: '1 day ago' },
]

export default function StudentDashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])

  // Derive activePage from location
  const activePage = useMemo(() => {
    const path = location.pathname.split('/').pop()
    return path === 'student-dashboard' ? 'home' : path
  }, [location.pathname])

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

  // Fetch dynamic notifications for student (with polling)
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications?userId=${user?.id}&role=student`);
        
        const formattedNotifs = Array.isArray(response.data) 
          ? response.data.map(notif => ({
              ...notif,
              id: notif._id,
              timestamp: new Date(notif.timestamp).toLocaleString(),
            }))
          : [];

        setNotifications(formattedNotifs);
      } catch (error) {
        console.error('Error fetching student notifications:', error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Polling every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);

    return () => clearInterval(intervalId);
  }, [user?.id]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/read-all`, { userId: user?.id, role: 'student' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-orange-50">
      {/* Sidebar */}
      <StudentSidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activePage={activePage}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <StudentNavbar
          notifications={notifications}
          unreadCount={unreadCount}
          user={user}
          onProfileOpen={() => setIsProfileModalOpen(true)}
          onLogout={onLogout}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardHome student={user} onViewProfile={() => setIsProfileModalOpen(true)} />} />
            <Route path="/achievements" element={<MyAchievements student={user} searchQuery={searchQuery} />} />
            <Route path="/events" element={<EventParticipation user={user} searchQuery={searchQuery} />} />
            <Route path="/announcements" element={<StudentAnnouncements student={user} searchQuery={searchQuery} />} />
            <Route path="*" element={<Navigate to="/student-dashboard" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={user}
      />
    </div>
  )
}

function DashboardHome({ student, onViewProfile }) {
  const [announcements, setAnnouncements] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [annResponse, eventsResponse, studentResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/announcements`),
          axios.get(`${API_BASE_URL}/api/events`),
          axios.get(`${API_BASE_URL}/api/students/${student?.id}`)
        ]);

        const allEvents = eventsResponse.data;
        const myEvents = allEvents.filter(event => event.participants && event.participants.includes(student?.id));
        setJoinedEvents(myEvents);
        
        // Set achievements from the student data
        setAchievements(studentResponse.data.achievements || []);

        const studentEventNames = myEvents.map(event => event.name);

        const filteredAnn = annResponse.data.filter(ann => {
          const isPublished = ann.status === 'Published';
          const isTargeted = ann.targetAudience === 'All Students' || studentEventNames.includes(ann.targetAudience);
          return isPublished && isTargeted;
        }).reverse().slice(0, 3);

        setAnnouncements(filteredAnn);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (student?.id) {
      fetchData();
    }
  }, [student?.id]);

  // Get student's actual data, with fallback values
  const firstName = student?.firstName || 'Student';
  const gradeLevelData = student?.academicHistory?.[0];
  const gpaData = gradeLevelData?.gpa || 'N/A';
  const yearLevel = student?.personalInfo?.yearLevel || 'N/A';

  const studentStats = [
    {
      title: 'Latest GPA',
      count: gpaData,
      icon: <FaGraduationCap className="text-2xl text-blue-500" />,
      color: 'bg-blue-50',
      to: '/student-dashboard/achievements',
    },
    {
      title: 'Achievements',
      count: achievements.length,
      icon: <FaTrophy className="text-2xl text-yellow-500" />,
      color: 'bg-yellow-50',
      to: '/student-dashboard/achievements',
    },
    {
      title: 'Joined Events',
      count: joinedEvents.length,
      icon: <FaCalendarAlt className="text-2xl text-green-500" />,
      color: 'bg-green-50',
      to: '/student-dashboard/events',
    },
    {
      title: 'Year Level',
      count: yearLevel,
      icon: <FaUser className="text-2xl text-purple-500" />,
      color: 'bg-purple-50',
      to: '/student-dashboard/announcements',
    },
  ]

  return (
    <div>
      <section className="mb-8 flex justify-between items-start">
        <div className="cursor-pointer" onClick={onViewProfile}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back, {firstName}! 👋</h1>
          <p className="text-gray-600">Student ID: <span className="font-semibold">{student?.id}</span> • Course: <span className="font-semibold text-indigo-600">{student?.personalInfo?.course === 'IT' ? 'IT' : 'CS'}</span> • Year Level: <span className="font-semibold text-purple-600">{student?.personalInfo?.yearLevel || 'N/A'}</span></p>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {studentStats.map((stat, idx) => (
            <div 
              key={idx} 
              onClick={() => stat.to && navigate(stat.to)}
              className={`${stat.color} rounded-xl p-6 border border-gray-200 hover:shadow-md transition cursor-pointer`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-semibold text-gray-700 text-sm">{stat.title}</div>
                {stat.icon}
              </div>
              <p className="text-4xl font-bold text-gray-900">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Achievements</h2>
            <button 
              onClick={() => navigate('/student-dashboard/achievements')}
              className="text-indigo-600 text-sm font-semibold hover:underline"
            >
              View All Achievements
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>
              ))
            ) : achievements.length > 0 ? (
              achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${achievement.category === 'Academic' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                      <FaTrophy />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{achievement.title}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{achievement.category}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt className="text-indigo-400" /> {achievement.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      achievement.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                      achievement.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {achievement.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No achievements recorded yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Joined Events Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Joined Events</h2>
            <button 
              onClick={() => navigate('/student-dashboard/events')}
              className="text-indigo-600 text-sm font-semibold hover:underline"
            >
              View All Events
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl border border-gray-200"></div>
              ))
            ) : joinedEvents.length > 0 ? (
              joinedEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                        Joined
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{event.category}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{event.name}</h3>
                    <div className="space-y-1.5 mt-3">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <FaCalendarAlt className="text-indigo-400" /> {event.date}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <FaMapPin className="text-indigo-400" /> {event.venue || event.location}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/student-dashboard/events')}
                    className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">You haven't joined any events yet.</p>
                <button 
                  onClick={() => navigate('/student-dashboard/events')}
                  className="mt-3 text-indigo-600 text-sm font-bold hover:underline"
                >
                  Browse Available Events
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Latest Announcements Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Latest Announcements</h2>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center bg-white rounded-xl border border-gray-100 animate-pulse">
                <p className="text-gray-400">Loading announcements...</p>
              </div>
            ) : announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className={`p-5 rounded-2xl border transition-all ${ann.category === 'Urgent' ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${ann.category === 'Urgent' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>
                          {ann.category}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(ann.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className={`font-bold ${ann.category === 'Urgent' ? 'text-red-900' : 'text-gray-900'}`}>{ann.title}</h3>
                      <p className={`text-sm mt-2 line-clamp-2 ${ann.category === 'Urgent' ? 'text-red-800' : 'text-gray-600'}`}>{ann.content}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${ann.category === 'Urgent' ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {ann.category === 'Urgent' ? <FaExclamationCircle /> : <FaBullhorn />}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No new announcements at this time.</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Overview Sections */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Email</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{student?.personalInfo?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Gender</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{student?.personalInfo?.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Contact</p>
                  <p className="text-sm font-medium text-gray-700 mt-1">{student?.personalInfo?.contact || 'N/A'}</p>
                </div>
              </div>
            </div>

          {/* Skills List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skills</h3>
            <div className="space-y-2">
              {student?.skills && student.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold border border-indigo-100">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No skills added yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      {student?.nonAcademicActivities && student.nonAcademicActivities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Activities</h2>
          <div className="space-y-3">
            {student.nonAcademicActivities.map((activity, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{activity.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Role: {activity.role} • Year: {activity.year}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-8 text-center">
        <p className="text-gray-700 mb-4">You can view your full profile by clicking on your name and student ID above.</p>
      </section>
    </div>
  )
}
