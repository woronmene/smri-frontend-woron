'use client';

import { useContext, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = ({ className, onNavigate }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isTeacher = user?.role === 'teacher' || user?.role === 'school_admin' || user?.role === 'smri_admin' || user?.email?.includes('teacher');
  const isAdmin = user?.role === 'admin' || user?.role === 'school_admin' || user?.role === 'smri_admin' || user?.email?.includes('admin');
  const handleNavigate = onNavigate || (() => {});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/sign-in'); // Redirect to sign-in page
  };

  const menuItems = [
    {
      name: 'My Courses',
      href: '/dashboard',
      icon: '/courses_sidemenue_icon.svg',
      activeIcon: '/courses_sidemenu_icon-dark.svg',
      show: true, 
    },
    {
       name: 'Students',
       href: '/dashboard/students',
       icon: '/students_sidemenu_icon.svg',
       show: isTeacher || isAdmin,
    },
    {
       name: 'Teachers',
       href: '/dashboard/teachers',
       icon: '/user_icon.svg',
       show: ['school_admin', 'smri_admin', 'admin'].includes(user?.role),
    },
    {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: '/analytics_sidemenu_icon.svg',
        show: false,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: '/settings_sidemenu_icon.svg',
      show: true,
    },
  ];

  return (
    <aside
      className={cn(
        'bg-white border-gray-200 min-h-screen flex flex-col font-sans w-64',
        className
      )}
    >
      {/* Logo Section */}
      <div className="p-6">
        <div className="flex items-center gap-2">
           <Image
             src="/smri_logo.svg"
             alt="SMRI Logo"
             width={120}
             height={40}
             className="w-auto h-8"
             priority
           />
        </div>
      </div>

      {/* User Profile Section */}
      <div className="px-4 pb-6">
        <div 
          className="relative" 
          ref={dropdownRef}
        >
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
          >
             <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {/* Fallback image or user avatar */}
                 <Image 
                   src={user?.profileImage || user?.photoURL || user?.avatar || "/placeholder-user.jpg"} 
                   alt={user?.name || user?.fullName || user?.displayName || "User"}
                   width={40}
                   height={40}
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     e.target.style.display = 'none'; 
                   }}
                 />
                 {/* Fallback if image fails or doesn't exist */}
                 {(!user?.profileImage && !user?.photoURL && !user?.avatar) && (
                   <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold">
                     {(user?.name || user?.fullName || user?.displayName || 'U')?.[0]?.toUpperCase()}
                   </div>
                 )}
             </div>
             <div className="flex-1 min-w-0">
               <h3 className="font-semibold text-sm text-gray-900 truncate">{user?.name || user?.fullName || user?.displayName || 'User'}</h3>
               <p className="text-xs text-gray-500 truncate">
                 {(() => {
                   const r = user?.role;
                   if (r === 'admin') return 'Administrator Account';
                   if (r === 'smri_admin') return 'SMRI Admin';
                   if (r === 'school_admin') return 'School Admin';
                   return (r || 'Student Account').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                 })()}
               </p>
             </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-4 flex-1">
        <div className="mb-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Main Menu
        </div>
        
        <nav className="space-y-2">
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = pathname === '/dashboard' && item.href === '/dashboard' 
               ? true 
               : item.href !== '/dashboard' && pathname.startsWith(item.href);

            const iconSrc = (isActive && item.activeIcon) ? item.activeIcon : item.icon;
            
            const imageClasses = item.activeIcon 
               ? "object-contain"
               : cn("object-contain transition-all", isActive ? "brightness-0" : "grayscale opacity-70 group-hover:brightness-0 group-hover:opacity-100");
              
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavigate}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group border',
                  isActive
                    ? 'bg-white border-gray-200 shadow-sm text-black'
                    : 'bg-transparent border-transparent text-gray-500 hover:text-black hover:bg-gray-50'
                )}
              >
                <div className="relative w-5 h-5">
                  <Image 
                      src={iconSrc} 
                      alt={item.name} 
                      fill 
                      className={imageClasses}
                  />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
