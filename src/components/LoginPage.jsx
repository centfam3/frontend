import { useState } from 'react'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdLightbulbOutline } from 'react-icons/md'
import pnclogo from '../assets/pnclogo.png'
import ccslogo from '../assets/ccslogo.png'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    if (onLogin) {
      onLogin(email, password)
    }
    console.log('Login attempt:', { email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome!!!</h1>
            <p className="text-gray-600 text-lg">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Helper Box */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1.5">
                <MdLightbulbOutline className="text-blue-500" />
                Login Tips
              </p>
              <p className="text-[11px] text-blue-600 mt-1">
                <strong>Students:</strong> Use your email and password created by admin<br/>
                <strong>Admin:</strong> admin@pnc.edu / admin123
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
                Email Address
              </label>
              <div className="relative">
                <MdEmail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-3">
                Password
              </label>
              <div className="relative">
                <MdLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-orange-600 hover:text-orange-700 font-medium transition">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 ease-in-out shadow-sm hover:shadow-md mt-8"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Logos */}
      <div className="hidden md:w-1/2 md:flex items-center justify-center bg-gradient-to-br from-orange-50 via-orange-100 to-orange-150 p-8">
        <div className="flex flex-col items-center space-y-16">
          {/* School Logo */}
          <div className="flex flex-col items-center">
            <img src={pnclogo} alt="School Logo" className="h-40 w-40 object-contain mb-4" />
            <p className="text-center text-gray-800 font-bold text-base">
              Pamantasan ng <br /> Cabuyao
            </p>
          </div>

          {/* Department Logo */}
          <div className="flex flex-col items-center">
            <img src={ccslogo} alt="Department Logo" className="h-40 w-40 object-contain mb-4" />
            <p className="text-center text-gray-800 font-bold text-base">
              College of <br /> Computer Studies
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
