'use client';

import React from 'react';
import TipTapEditor from '@/components/dashboard/TipTapEditor';

export default function LessonContentRenderer({ content }) {
  return (
    <div className="lesson-content">
      <TipTapEditor content={content} editable={false} />
    </div>
  );
}
