import React from 'react';
import { Zap } from 'lucide-react';
import type { Signal } from '../../types';

export const SignalCard: React.FC<{ signal: Signal }> = ({ signal }) => {
    const isLong = signal.type === 'BUY';

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl p-4 mb-3 shadow-lg relative overflow-hidden">
            {/* Indicador lateral de color */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLong ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            <div className="flex justify-between items-start mb-2 pl-2">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        {signal.pair}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {signal.type} {signal.entry_price}x
            </span>
                    </h3>
                    {/* Nota: Asegúrate de que tu tipo Signal tenga timeAgo o calcúlalo aquí */}
                    <p className="text-gray-400 text-xs mt-1">Entrada: <span className="text-gray-200">{signal.entry_price}</span></p>
                </div>
                <div className="text-right">
                    {signal.status === 'ACTIVE' ? (
                        <div className={`text-xl font-bold ${signal.result_pips > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {signal.result_pips > 0 ? '+' : ''}{signal.result_pips} pips
                        </div>
                    ) : (
                        <div className="text-yellow-400 text-sm font-semibold flex items-center gap-1">
                            <Zap size={14} /> {signal.status}
                        </div>
                    )}
                </div>
            </div>

            {/* Barra de progreso visual (Simulada) */}
            {signal.status === 'ACTIVE' && (
                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2 ml-2 pr-2">
                    <div
                        className={`h-1.5 rounded-full ${signal.result_pips > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: '50%' }} // Aquí podrías calcular el % real basado en TP/SL
                    />
                </div>
            )}
        </div>
    );
};