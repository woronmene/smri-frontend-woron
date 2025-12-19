import { Users, School, GraduationCap, TrendingUp, Activity } from 'lucide-react';

const AdminAnalytics = () => {
  const stats = [
    { label: 'Total Schools', value: '42', icon: School, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Students', value: '3,842', icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Active Courses', value: '156', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Avg. Completion', value: '78%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
        <p className="text-gray-500">Global statistics across all organizations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} className="mr-1" /> +12%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for broader insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-cyan-500" />
            Platform Activity
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((height, i) => (
              <div key={i} className="w-full bg-gray-100 rounded-t-lg relative group overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 w-full bg-cyan-500/80 group-hover:bg-cyan-500 transition-colors rounded-t-lg"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Schools</h3>
            <div className="space-y-6">
                {[
                    { name: 'Greenfield High', progress: 92, students: 450 },
                    { name: 'Tech Future Inst.', progress: 88, students: 320 },
                    { name: 'Oakwood Secondary', progress: 85, students: 280 },
                    { name: 'River Valley', progress: 79, students: 190 },
                ].map((school, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-900">{school.name}</span>
                            <span className="text-gray-500">{school.progress}% Completion</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${school.progress}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
