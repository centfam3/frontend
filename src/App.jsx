import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import FacultyDashboard from './page/FacultyDashboard'
import StudentDashboard from './page/StudentDashboard'
import ConfirmModal from './components/admin/ConfirmModal'
import API_BASE_URL from './config'

function AppContent() {
  const [user, setUser] = useState(null); // Global user state
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Alert Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger'
  });

  const showAlert = (title, message, type = 'danger') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type
    });
  };

  // Restore user session from sessionStorage on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        console.log('User session restored from sessionStorage:', userData)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        sessionStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = async (email, password) => {
    try {
      console.log('Logging in with:', { email, password });
      const response = await axios.post(`${API_BASE_URL}/api/login`, { 
        email, 
        password
      });
      console.log('Login response:', response.data);
      const { role: returnedRole, user: userData } = response.data;
      
      const userWithRole = { ...userData, role: returnedRole }
      setUser(userWithRole)
      // Store user session in sessionStorage for tab-specific session
      sessionStorage.setItem('user', JSON.stringify(userWithRole))
      
      if (returnedRole === 'admin') {
        console.log('Admin user detected, navigating to /dashboard');
        navigate('/dashboard');
      } else if (returnedRole === 'faculty_admin') {
        console.log('Faculty admin user detected, navigating to /dashboard');
        navigate('/dashboard');
      } else if (returnedRole === 'faculty') {
        console.log('Faculty user detected, navigating to /dashboard');
        navigate('/dashboard');
      } else if (returnedRole === 'student') {
        console.log('Student user detected, navigating to /student-dashboard');
        navigate('/student-dashboard');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Invalid email or password';
      showAlert('Login Failed', errorMsg, 'danger');
      console.error('Login error:', err);
    }
  }

  const handleLogout = () => {
    setUser(null)
    sessionStorage.removeItem('user')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-600 to-orange-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    )
  }
  
  //PART 1: CLIENT SIDE ROUTING
  return (
    <>
    <Routes>
      {/* Home redirect logic based on role */}
      <Route 
        path="/" 
        element={
          !user ? (
            <LoginPage onLogin={handleLogin} />
          ) : user.role === 'admin' || user.role === 'faculty_admin' || user.role === 'faculty' ? (
            <Navigate to="/dashboard" replace />
          ) : user.role === 'student' ? (
            <Navigate to="/student-dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Auth routes */}
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Admin routes */}
      {/* User is passed as a prop to main pages: */}
      <Route 
        path="/dashboard/*" 
        element={
          user?.role === 'admin' || user?.role === 'faculty_admin' || user?.role === 'faculty' ? (
            <FacultyDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Student routes */}
      <Route 
        path="/student-dashboard/*" 
        element={
          user?.role === 'student' ? (
            <StudentDashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    <ConfirmModal 
      isOpen={modalConfig.isOpen}
      onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      onConfirm={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      title={modalConfig.title}
      message={modalConfig.message}
      type={modalConfig.type}
      showCancel={false}
      confirmText="OK"
    />
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
