import { Users, BookOpen, UserCheck, AlertCircle, TrendingUp } from 'lucide-react';

const TeacherAnalytics = () => {
    const stats = [
      { label: 'Total Students', value: '145', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Avg. Class Progress', value: '68%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Assignments Submitted', value: '1,024', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Action Needed', value: '3', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];
  
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Performance</h2>
          <p className="text-gray-500">Analytics for Greenfield High School.</p>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity / Progress */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Progress Overview</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-600">Module 1: Introduction</span>
                            <span className="text-sm font-bold text-gray-900">95%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-600">Module 2: Advanced Concepts</span>
                            <span className="text-sm font-bold text-gray-900">72%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-600">Module 3: Case Studies</span>
                            <span className="text-sm font-bold text-gray-900">45%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-gray-600">Module 4: Final Assessment</span>
                            <span className="text-sm font-bold text-gray-900">12%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-gray-300 h-2 rounded-full" style={{ width: '12%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* At Risk Students */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Required</h3>
                 <div className="space-y-4">
                    {[
                        { name: 'Diana Ross', issue: 'Inactive (7 days)', color: 'text-red-600', bg: 'bg-red-50' },
                        { name: 'Charlie Brown', issue: 'Low Score (30%)', color: 'text-orange-600', bg: 'bg-orange-50' },
                        { name: 'Mike Ross', issue: 'Overdue Assignment', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                    ].map((student, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                                {student.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm">{student.name}</h4>
                                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-md font-medium ${student.bg} ${student.color}`}>
                                    {student.issue}
                                </span>
                            </div>
                        </div>
                    ))}
                 </div>
                 <button className="w-full mt-6 py-2 text-sm text-cyan-600 font-medium hover:bg-cyan-50 rounded-lg transition-colors">
                    View All Students
                 </button>
            </div>
        </div>
      </div>
    );
  };
  
  export default TeacherAnalytics;
