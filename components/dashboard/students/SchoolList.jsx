import { School, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const SchoolList = ({ schools, onSelectSchool }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => {
        // Handle backend vs mock field names
        const id = school.school_id || school.id;
        const studentCount =
          school.studentCount ??
          school.student_size ??
          school.studentCount ??
          0;

        const Content = (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                <School size={24} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-cyan-600 transition-colors">
              {school.name}
            </h3>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-sm font-medium">
                  {studentCount} Students
                </span>
              </div>
              <ArrowRight
                size={18}
                className="text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all"
              />
            </div>
          </>
        );

        if (onSelectSchool) {
          return (
            <div
              key={id}
              onClick={() => onSelectSchool(school)}
              className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-cyan-500 hover:shadow-md transition-all duration-200 block cursor-pointer"
            >
              {Content}
            </div>
          );
        }

        return (
          <Link
            key={id}
            href={`/dashboard/students/${id}`}
            className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-cyan-500 hover:shadow-md transition-all duration-200 block"
          >
            {Content}
          </Link>
        );
      })}
    </div>
  );
};

export default SchoolList;
