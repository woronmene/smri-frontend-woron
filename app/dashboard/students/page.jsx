'use client';

import { useContext, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { Download, Search, Filter, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentsTable from '@/components/dashboard/students/StudentsTable';
import SchoolList from '@/components/dashboard/students/SchoolList';

// Mock Data for Schools (Admin View)
const MOCK_SCHOOLS = [
  { id: 'SCH001', name: 'Greenfield High School', location: 'New York, NY', studentCount: 145 },
  { id: 'SCH002', name: 'River Valley Academy', location: 'Austin, TX', studentCount: 89 },
  { id: 'SCH003', name: 'Tech Future Institute', location: 'San Francisco, CA', studentCount: 210 },
  { id: 'SCH004', name: 'Oakwood Secondary', location: 'Chicago, IL', studentCount: 167 },
];

// Mock Data Enriched (Teacher View)
const MOCK_STUDENTS_TEACHER = [
  { id: 1, name: 'Faith Johnson', course: 'AI Foundations', progress: 89, lastActive: '2h ago', status: 'In progress', avatar: '/avatars/faith.png' },
  { id: 2, name: 'Daniel Davis', course: 'Machine Learning', progress: 100, lastActive: '1d ago', status: 'Completed', avatar: '/avatars/daniel.png' },
  { id: 3, name: 'Johnny Jackson', course: 'UI/UX Design', progress: 45, lastActive: '3h ago', status: 'In progress', avatar: '/avatars/johnny.png' },
  { id: 4, name: 'Sam Eddie', course: 'Web3 Basics', progress: 15, lastActive: '1w ago', status: 'In progress', avatar: '/avatars/sam.png' },
  { id: 5, name: 'Jane Cooper', course: 'Technical Documentation', progress: 100, lastActive: '2d ago', status: 'Completed', avatar: '/avatars/jane.png' },
  { id: 6, name: 'Sarah Witz', course: 'Data Visualization', progress: 67, lastActive: '4h ago', status: 'In progress', avatar: null },
  { id: 7, name: 'Emmanuel Wilson', course: 'Cloud Fundamentals', progress: 52, lastActive: '6h ago', status: 'In progress', avatar: null },
  { id: 8, name: 'Lydia Sanderson', course: 'No-Code App Building', progress: 75, lastActive: '2d ago', status: 'In progress', avatar: null },
  { id: 9, name: 'Jacob Jones', course: 'Customer Integration', progress: 60, lastActive: '3hr ago', status: 'In progress', avatar: null },
  { id: 10, name: 'David Smith', course: 'Prompt Engineering', progress: 90, lastActive: '6h ago', status: 'In progress', avatar: null },
  { id: 11, name: 'Cody Fisher', course: 'Maths for ML', progress: 100, lastActive: '1d ago', status: 'Completed', avatar: null },
];

export default function StudentsPage() {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('All Students');
  
  // Logic to determine view
  // Use explicit role checks, defaulting to false if user not loaded yet
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');
  // Teachers fall through to the main view, Admins return early with Schools view

  // --------------- ADMIN VIEW: SCHOOL LIST ---------------- //
  if (isAdmin) {
    const filteredSchools = MOCK_SCHOOLS.filter(school =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-8 font-sans pb-12">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h1 className="text-3xl font-bold text-gray-900">Schools Listings</h1>
             <p className="text-gray-500 mt-1">Select a school to view its students.</p>
           </div>
         </div>

         {/* Search Bar for Schools */}
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 text-sm"
            />
          </div>

        <SchoolList schools={filteredSchools} />
      </div>
    );
  }

  // --------------- TEACHER VIEW: STUDENTS LIST ---------------- //
  
  // Filter Logic
  const filteredStudents = MOCK_STUDENTS_TEACHER.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="bg-white hover:bg-gray-50 text-gray-900 border-gray-200 rounded-[100px] px-5 py-3 shadow-sm h-auto font-medium"
          >
            Greener Field High School
            <ChevronDown size={16} className="ml-2 text-gray-400" />
          </Button>
          <Button 
            className="bg-[#3AD0E3] hover:bg-cyan-400 cursor-pointer text-black flex items-center gap-2 rounded-[100px] px-5 py-3 shadow-sm shadow-cyan-500/20 border-none h-auto font-medium"
          >
            <Download size={18} />
            Export Student Data
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100 pb-1">
        {['All Students', 'Top Performers', 'Low Engagement'].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentTab === tab
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search student name or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300 text-sm"
          />
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-[100px] text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm shadow-sm">
          <Filter size={18} />
          Filter Students
        </button>
      </div>

      {/* Table */}
      <StudentsTable students={filteredStudents} />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <span className="text-sm text-gray-900 font-medium">Page 2 of 15</span>
        
        <div className="flex items-center gap-2">
           <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
             <ChevronLeft size={16} />
           </button>
           <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">1</button>
           <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-cyan-400 text-black font-semibold">2</button>
           <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">3</button>
           <span className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
           <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50">15</button>
           <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
             <ChevronRight size={16} />
           </button>
        </div>
      </div>
    </div>
  );
}
