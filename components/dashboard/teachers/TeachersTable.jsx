import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Shield } from 'lucide-react';
import Image from 'next/image';

const ActionMenu = ({ onMakeAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-10 py-1 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              onMakeAdmin();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Shield className="h-4 w-4 text-cyan-600" />
            Make School Admin
          </button>
        </div>
      )}
    </div>
  );
};

const TeachersTable = ({ teachers, onMakeAdmin }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-left">
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100">Email</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100">Role</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100">Status</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teachers.map((teacher) => (
              <tr 
                key={teacher.id} 
                className="hover:bg-gray-50/60 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-100">
                        {teacher.avatar ? (
                            <Image 
                                src={teacher.avatar} 
                                alt={teacher.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600 text-xs font-bold">
                                {teacher.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{teacher.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 border-l border-gray-100">
                   <span className="text-sm text-gray-600">{teacher.email}</span>
                </td>
                <td className="py-4 px-6 border-l border-gray-100">
                   <span className="text-sm text-gray-600 capitalize">{teacher.role || 'Teacher'}</span>
                </td>
                <td className="py-4 px-6 border-l border-gray-100">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                    teacher.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-gray-50 text-gray-700 border border-gray-100'
                  }`}>
                    {teacher.status || 'Active'}
                  </span>
                </td>
                <td className="py-4 px-6 border-l border-gray-100 text-right overflow-visible">
                  <ActionMenu onMakeAdmin={() => onMakeAdmin && onMakeAdmin(teacher.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {teachers.length === 0 && (
        <div className="p-12 text-center text-gray-500 text-sm">
          No teachers found.
        </div>
      )}
    </div>
  );
};

export default TeachersTable;
