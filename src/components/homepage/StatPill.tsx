import React from 'react';
import {TrendingUp, TrendingDown} from 'lucide-react';

export const StatPill: React.FC<{ label: string; value: string; trend?: 'up' | 'down' }> = ({label, value, trend}) => {
    const textColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white';

    return (
        <div
            className="flex flex-col items-center justify-center bg-gray-800/40 p-2 sm:p-3 rounded-xl border border-gray-700/50 flex-1 min-w-0">
            <span className="text-gray-400 text-[10px] sm:text-xs mb-1 truncate w-full text-center">
                {label}
            </span>
            <div className="flex items-center justify-center gap-0.5 sm:gap-1 w-full">
                <span className={`${textColor} font-bold text-sm sm:text-lg tracking-tight whitespace-nowrap`}>
                    {value}
                </span>
                <div className="shrink-0">
                    {trend === 'up' && <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400"/>}
                    {trend === 'down' && <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400"/>}
                </div>
            </div>
        </div>
    );
};