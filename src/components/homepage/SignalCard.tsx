import React from 'react';
import { TrendingUp, TrendingDown, Target, ShieldAlert, DollarSign } from 'lucide-react';
import type { Signal } from '../../types';

export const SignalCard: React.FC<{ signal: Signal }> = ({ signal }) => {
    const isBuy = signal.signal_type === 'BUY';
    const isWon = signal.status === 'WON';
    const isLost = signal.status === 'LOST';
    const isActive = signal.status === 'ACTIVE';

    // Colores dinámicos según estado
    let borderColor = 'border-gray-700';
    let bgColor = 'bg-gray-800/50';
    let statusColor = 'text-gray-400';

    if (isWon) {
        borderColor = 'border-emerald-500/50';
        bgColor = 'bg-emerald-900/20';
        statusColor = 'text-emerald-400';
    } else if (isLost) {
        borderColor = 'border-rose-500/50';
        bgColor = 'bg-rose-900/20';
        statusColor = 'text-rose-400';
    } else {
        // Active
        borderColor = isBuy ? 'border-emerald-500/30' : 'border-rose-500/30';
    }

    return (
        <div className={`relative rounded-xl border ${borderColor} ${bgColor} p-4 mb-3 transition-all duration-300`}>

            {/* Encabezado: Par y Tipo */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {isBuy ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">{signal.symbol}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {signal.signal_type} @ {signal.price}
                        </span>
                    </div>
                </div>

                {/* Estado Actual */}
                <div className="text-right">
                    <div className={`text-sm font-bold flex items-center justify-end gap-1 ${statusColor}`}>
                        {isActive && <span className="relative flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>}
                        {signal.status}
                    </div>
                    {signal.updated_at && !isActive && (
                        <span className="text-xs text-gray-500">Cerrada hace poco</span>
                    )}
                </div>
            </div>

            {/* Grid de Datos: TP, SL, Profit */}
            <div className="grid grid-cols-3 gap-2 mt-2 bg-gray-900/40 p-2 rounded-lg border border-gray-700/30">
                {/* Take Profit */}
                <div className="flex flex-col items-center border-r border-gray-700/50">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Target size={10} /> TP (Meta)
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{signal.take_profit}</span>
                </div>

                {/* Stop Loss */}
                <div className="flex flex-col items-center border-r border-gray-700/50">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <ShieldAlert size={10} /> SL (Riesgo)
                    </span>
                    <span className="text-rose-400 font-mono font-bold text-sm">{signal.stop_loss}</span>
                </div>

                {/* Ganancia Estimada */}
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <DollarSign size={10} /> Potencial
                    </span>
                    <span className="text-yellow-400 font-mono font-bold text-sm">
                        ${signal.estimated_profit?.toFixed(2) || '---'}
                    </span>
                </div>
            </div>
        </div>
    );
};