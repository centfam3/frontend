import { MdSchool, MdFavoriteBorder } from 'react-icons/md'

export default function Footer() {
  return (
    <div className="h-10 bg-white border-t border-orange-100 px-6 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-1.5 text-xs text-black">
        <MdSchool size={14} className="text-orange-500" />
        <span>ProfilingSystem — College of Computer Studies</span>
      </div>

      {/* Center */}
      <div className="text-xs text-gray-500">
        A.Y. 2025–2026
        <span className="mx-1">·</span>
        2nd Semester
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 text-xs text-black">
        <MdFavoriteBorder size={12} className="text-orange-500" />
        <span>2026 All rights reserved</span>
      </div>
    </div>
  )
}
