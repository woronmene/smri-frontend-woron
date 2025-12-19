import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, School } from 'lucide-react';
import { useState } from 'react';

const SchoolsDrawer = ({ isOpen, onClose, schools, currentSchool, onSelectSchool }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Switch School</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSchools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => onSelectSchool(school)}
                  className={`w-full p-4 rounded-xl text-left transition-all border ${
                    currentSchool?.id === school.id
                      ? 'bg-cyan-50 border-cyan-200 ring-1 ring-cyan-500/20'
                      : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-lg ${
                      currentSchool?.id === school.id ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <School size={20} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        currentSchool?.id === school.id ? 'text-cyan-900' : 'text-gray-900'
                      }`}>{school.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{school.studentCount} Students • {school.location}</p>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredSchools.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <School className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No schools found</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SchoolsDrawer;
