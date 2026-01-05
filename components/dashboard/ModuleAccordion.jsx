'use client';

import { useState } from 'react';
import { ChevronDown, PlayCircle, CheckCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ModuleAccordion = ({ module, courseId, completedLessonIds }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4 overflow-hidden mb-4 bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 cursor-pointer transition-colors text-left"
      >
        <span className="font-semibold text-[20px] text-gray-900">
          {module.title}
        </span>
        <ChevronDown
          size={30}
          className={cn(
            'text-gray-500 transition-transform duration-300 ease-out',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}
        />
      </button>

      <div
        className={cn(
          'divide-y divide-gray-100 transition-all duration-300 ease-out',
          isOpen ? 'max-h-auto opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {module.lessons.map((lesson) => {
          const isCompleted =
            completedLessonIds &&
            typeof completedLessonIds.has === 'function' &&
            completedLessonIds.has(lesson.id);

          return (
            <Link
              key={lesson.id}
              href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                {lesson.videoUrl ? (
                  <PlayCircle
                    size={20}
                    className="text-gray-400 group-hover:text-blue-600"
                  />
                ) : (
                  <FileText
                    size={20}
                    className="text-gray-400 group-hover:text-blue-600"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                    {lesson.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {lesson.introduction}
                  </p>
                </div>
              </div>

              {isCompleted && (
                <CheckCircle
                  size={20}
                  className="text-emerald-500 flex-shrink-0"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleAccordion;
