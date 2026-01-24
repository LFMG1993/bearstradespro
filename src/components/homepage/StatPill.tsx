import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatPill: React.FC<{ label: string; value: string; trend?: 'up' | 'down' }> = ({ label, value, trend }) => {
    const textColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white';

    return (
        <div className="flex flex-col items-center bg-gray-800/40 p-3 rounded-xl border border-gray-700/50 flex-1">
            <span className="text-gray-400 text-xs mb-1">{label}</span>
            <div className="flex items-center gap-1">
                <span className={`${textColor} font-bold text-lg`}>{value}</span>
                {trend === 'up' && <TrendingUp size={14} className="text-emerald-400"/>}
                {trend === 'down' && <TrendingDown size={14} className="text-rose-400"/>}
            </div>
        </div>
    );
};