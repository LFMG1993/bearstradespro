import React from 'react';
import { PlayCircle } from 'lucide-react';
import type { Course } from '../../types';

export const AcademyCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="min-w-[160px] bg-gray-800/80 rounded-lg overflow-hidden border border-gray-700 mr-4 snap-start">
        <div className={`h-24 ${course.thumbnail} flex items-center justify-center relative bg-gray-700`}>
            <PlayCircle className="text-white/80 w-10 h-10" />
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 rounded">
        {course.duration}
      </span>
        </div>
        <div className="p-3">
            <h4 className="text-gray-100 text-sm font-semibold leading-tight mb-1 truncate">{course.title}</h4>
            <span className="text-xs text-gray-400 border border-gray-600 px-1.5 py-0.5 rounded">{course.level}</span>
        </div>
    </div>
);