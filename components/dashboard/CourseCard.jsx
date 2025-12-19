import Link from 'next/link';
import Image from 'next/image';
import { Clock, CheckCircle, MoreVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

const CourseCard = ({ course, isAdmin, isStudent, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  // Determine link destination
  const href = (isAdmin && course.status === 'draft') 
    ? `/dashboard/courses/create?courseId=${course.id}` 
    : `/dashboard/courses/${course.id}`;

  // Helper to get a consistent color based on char code of title
  const getColor = (str) => {
      const colors = [
          'bg-blue-100 text-blue-600',
          'bg-purple-100 text-purple-600',
          'bg-emerald-100 text-emerald-600', 
          'bg-orange-100 text-orange-600',
          'bg-cyan-100 text-cyan-600',
          'bg-indigo-100 text-indigo-600'
      ];
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
  }

  const iconColorClass = getColor(course.title || 'Course');
  const progress = course.progress || 0;
  
  // Status Logic
  let statusColor = 'bg-blue-50 text-blue-700';
  let statusText = 'In Progress';
  if (course.status === 'completed' || (isStudent && progress === 100)) {
      statusColor = 'bg-emerald-50 text-emerald-700';
      statusText = 'Completed';
  } else if (course.status === 'draft') {
      statusColor = 'bg-gray-100 text-gray-700';
      statusText = 'Draft';
  }

  return (
    <Link
      href={href}
      className="block group h-full relative"
      onClick={() => setShowMenu(false)}
    >
      <div className="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all p-5 sm:p-6 h-full flex flex-col justify-between relative">
        
        {isAdmin && onDelete && (
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1.5 rounded-full bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all"
                >
                    <MoreVertical size={16} />
                </button>
                
                {showMenu && (
                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-200 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete(course.id);
                                setShowMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        )}

        <div>
            {/* Icon/Thumbnail Header */}
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6 overflow-hidden relative ${
                !course.thumbnail ? iconColorClass : 'bg-gray-100'
              }`}
            >
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M11.25 4.533A9.707 9.707 0 006 3.066c.097.38.169.782.206 1.198a9.7 9.7 0 00-2.617 1.839L3.434 5.92C1.047 7.7.07 10.983.82 13.886c.66 2.553 2.927 4.545 5.56 4.908a9.71 9.71 0 002.869-.406 9.708 9.708 0 002-2.197 9.708 9.708 0 002 2.197 9.71 9.71 0 002.87.406c2.632-.363 4.9-2.355 5.56-4.908.75-2.903-.228-6.186-2.615-7.965l-.155-.184a9.7 9.7 0 00-2.617-1.84 9.707 9.707 0 00.206-1.198 9.706 9.706 0 00-5.25 1.467z" />
                  </svg>
                )}
            </div>
            
            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                {course.title}
            </h3>
            <p className="text-gray-500 text-sm mb-4 sm:mb-6 line-clamp-3 leading-relaxed">
                {course.description}
            </p>
        </div>

        {/* Footer / Status */}
        <div className="space-y-3">
             {/* Progress Pill / Status Badge */}
             {isStudent ? (
                // STUDENT VIEW
                <>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                        <span>{statusText}</span>
                        {course.status !== 'draft' && <span>• {progress}%</span>}
                    </div>

                    {/* Progress Bar (Visual bottom border effect) */}
                    {course.status !== 'draft' && (
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${course.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-400'}`}
                                style={{ width: `${Math.max(progress, 5)}%` }}
                            />
                        </div>
                    )}
                </>
             ) : (
                 // ADMIN/TEACHER VIEW
                 <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                     <span className={`text-xs px-2 py-1 rounded font-medium ${
                         course.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-cyan-50 text-cyan-700'
                     }`}>
                         {course.status === 'draft' ? 'Draft' : 'Published'}
                     </span>
                     {/* View Course removed as per design */}
                 </div>
             )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
