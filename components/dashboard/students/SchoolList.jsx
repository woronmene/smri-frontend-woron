import { School, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SchoolList = ({ schools }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => (
        <Link 
          key={school.id} 
          href={`/dashboard/students/${school.id}`}
          className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-cyan-500 hover:shadow-md transition-all duration-200 block"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
              <School size={24} />
            </div>
            {/* <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
              ID: {school.id}
            </div> */}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
            {school.name}
          </h3>
          
          {/* <div className="flex items-center text-gray-500 text-sm mb-6">
            <span className="truncate">{school.location}</span>
          </div> */}
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-gray-600">
              {/* <Users size={16} /> */}
              <span className="text-sm font-medium">{school.studentCount} Students</span>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SchoolList;
