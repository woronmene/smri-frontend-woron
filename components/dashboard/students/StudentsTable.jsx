import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';

const StudentsTable = ({ students }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-left">
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100">Course</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100">Progress</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100">Last Active</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100">Status</th>
              <th className="py-4 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-100 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => (
              <tr 
                key={student.id} 
                className="hover:bg-gray-50/60 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-100">
                        {student.avatar ? (
                            <Image 
                                src={student.avatar} 
                                alt={student.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-cyan-50 text-cyan-600 text-xs font-bold">
                                {student.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 border-l border-gray-100">
                   <span className="text-sm text-gray-600">{student.course}</span>
                </td>
                <td className="py-4 px-6 border-l border-gray-100">
                   <span className="text-sm text-gray-600">{student.progress}%</span>
                </td>
                <td className="py-4 px-6 border-l border-gray-100">
                   <span className="text-sm text-gray-500">{student.lastActive}</span>
                </td>
                <td className="py-4 px-6 border-l border-gray-100">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                    student.status === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="py-4 px-6 border-l border-gray-100 text-right">
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {students.length === 0 && (
        <div className="p-12 text-center text-gray-500 text-sm">
          No students found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default StudentsTable;
