import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CoursePublishedSuccess({ onBackToCourses, onClose }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
           {/* Assuming Logo component or Image exists, matching screenshot placeholder for now */}
           <Image src="/SMRI_logo.svg" alt="SMRI" width={100} height={32} className="h-8 w-auto" />
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full flex flex-col items-center">
            {/* Success Emoji/Icon */}
            <div className="text-6xl mb-6 animate-bounce">
                🎉
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Your Course Has<br/>Been Successfully<br/>Created!
            </h1>
            
            {/* Subtitle */}
            <p className="text-gray-500 text-lg mb-10">
                Great job! Your course is now live and ready for learners to explore.
            </p>
            
            {/* Action Button */}
            <Button 
                onClick={onBackToCourses}
                className="w-full sm:w-auto min-w-[200px] h-12 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-lg"
            >
                Back to Courses
            </Button>
        </div>
      </div>
    </div>
  );
}
