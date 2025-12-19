'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, PlayCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ModuleAccordion = ({ module, courseId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4  overflow-hidden mb-4 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 cursor-pointer transition-colors text-left"
      >
        <span className="font-semibold text-[20px] text-gray-900">{module.title}</span>
        {isOpen ? <ChevronUp size={30} className="text-gray-500" /> : <ChevronDown size={30} className="text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="divide-y divide-gray-100">
          {module.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
              className="flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors group"
            >
              {lesson.isCompleted ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <PlayCircle size={20} className="text-gray-400 group-hover:text-blue-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  {lesson.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {lesson.introduction}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleAccordion;
