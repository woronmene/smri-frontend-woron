'use client';

import { useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Download, Search, Filter, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentsTable from '@/components/dashboard/students/StudentsTable';
import SchoolsDrawer from '@/components/dashboard/students/SchoolsDrawer';

// Mock Data (Replicated for demo)
const MOCK_SCHOOLS = [
  { id: 'SCH001', name: 'Greenfield High School', location: 'New York, NY', studentCount: 145 },
  { id: 'SCH002', name: 'River Valley Academy', location: 'Austin, TX', studentCount: 89 },
  { id: 'SCH003', name: 'Tech Future Institute', location: 'San Francisco, CA', studentCount: 210 },
  { id: 'SCH004', name: 'Oakwood Secondary', location: 'Chicago, IL', studentCount: 167 },
];

const MOCK_STUDENTS = {
  SCH001: [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      course: 'Introduction to SMRI',
      progress: 75,
      lastActive: '2023-11-20T10:00:00',
      status: 'In Progress',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      course: 'Advanced Learning Strategies',
      progress: 100,
      lastActive: '2023-11-19T14:30:00',
      status: 'Completed',
    },
  ],
  SCH002: [
    {
      id: 3,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      course: 'Digital Literacy Fundamentals',
      progress: 30,
      lastActive: '2023-11-21T09:15:00',
      status: 'In Progress',
    },
  ],
  SCH003: [
    {
      id: 4,
      name: 'Diana Ross',
      email: 'diana@example.com',
      course: 'Introduction to SMRI',
      progress: 0,
      lastActive: '2023-11-15T16:45:00',
      status: 'Not Started',
    },
  ],
  SCH004: [
    {
      id: 5,
      name: 'Ethan Hunt',
      email: 'ethan@example.com',
      course: 'Advanced Learning Strategies',
      progress: 90,
      lastActive: '2023-11-21T11:20:00',
      status: 'In Progress',
    },
  ],
};

export default function SchoolStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.schoolId; 
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSchool = MOCK_SCHOOLS.find(s => s.id === schoolId) || MOCK_SCHOOLS[0];
  const students = MOCK_STUDENTS[schoolId] || [];

  const handleSchoolSelect = (school) => {
    setIsDrawerOpen(false);
    router.push(`/dashboard/students/${school.id}`);
  };



  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Progress', 'Last Active'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(s => `"${s.name}","${s.email}",${s.progress},"${s.lastActive}"`).join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSchool.name.replace(/\s+/g, '_')}_students.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with School Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDrawerOpen(true)}
          className="bg-white hover:bg-gray-50 text-gray-900 cursor-pointer border-gray-200 rounded-[100px] px-5 py-3 shadow-sm h-auto font-medium"
          >
            {currentSchool.name}
          </button>
        </div>
        <Button 
          variant="outline" 
          className="bg-[#3AD0E3] hover:bg-cyan-400 cursor-pointer text-black flex items-center gap-2 rounded-[100px] px-5 py-3 shadow-sm shadow-cyan-500/20 border-none h-auto font-medium"
          onClick={handleExport}
        >
          <Download size={18} className="mr-2" />
          Export Student Data
        </Button>
      </div>

       {/* Filters & Search */}
       {/* <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-0 text-sm"
          />
        </div>
        <div className="w-[1px] h-8 bg-gray-200"></div>
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-2">
          <Filter size={18} />
          Filter
        </button>
      </div> */}

      {/* Table */}
      <StudentsTable students={filteredStudents} />

      {/* Schools Drawer */}
      <SchoolsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        schools={MOCK_SCHOOLS}
        currentSchool={currentSchool}
        onSelectSchool={handleSchoolSelect}
      />
    </div>
  );
}
