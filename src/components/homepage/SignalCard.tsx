import React, { useState } from 'react';
import {
    TrendingUp, TrendingDown, Target, ShieldAlert,
    Layers, ExternalLink, CheckCheck
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Signal } from '../../types';
import { journalService } from '../../services/journal.service';
import { useTradingPlan } from '../../hooks/useTradingPlan';

export const SignalCard: React.FC<{ signal: Signal }> = ({ signal }) => {
    // 1. Obtenemos la configuración de riesgo del usuario
    const { calculations } = useTradingPlan();

    // 2. Estado visual
    const [copied, setCopied] = useState(false);

    const isBuy = signal.signal_type === 'BUY';
    const isWon = signal.status === 'WON';
    const isLost = signal.status === 'LOST';
    const isActive = signal.status === 'ACTIVE';

    // 3. Mutación para registrar en Bitácora
    const logTradeMutation = useMutation({
        mutationFn: () => journalService.logTrade(
            signal.id,
            calculations.riskAmount,
            calculations.rewardAmount
        ),
        onError: (error) => {
            console.error("Error registrando trade:", error);
        }
    });

    // 4. Lógica Maestra: Copiar + Registrar + Redirigir
    const handleTradeClick = async () => {
        // A. Copiar al portapapeles
        const textToCopy = `
        Operación: ${signal.signal_type} ${signal.symbol}
        Precio: ${signal.price}
        TP: ${signal.take_profit}
        SL: ${signal.stop_loss}
        `.trim();

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            toast.success("Copiado. Abriendo MT5...");
            setTimeout(() => setCopied(false), 3000);

            // B. Registrar en Base de Datos (Si hay riesgo configurado)
            if (calculations.riskAmount > 0) {
                logTradeMutation.mutate();
            }

            // C. Abrir App
            window.location.href = 'metatrader5://';

        } catch (err) {
            toast.error("Error al copiar");
        }
    };

    // Estilos dinámicos
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
        borderColor = isBuy ? 'border-emerald-500/30' : 'border-rose-500/30';
    }

    return (
        <div className={`relative rounded-xl border ${borderColor} ${bgColor} p-4 mb-3 transition-all duration-300 group`}>

            {/* Encabezado */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {isBuy ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">{signal.symbol}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {signal.signal_type}
                            </span>
                            <span className="text-gray-400 text-xs font-mono">@ {signal.price}</span>
                        </div>
                    </div>
                </div>

                {/* Botón de Acción */}
                {isActive ? (
                    <button
                        onClick={handleTradeClick}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg
                            ${copied
                            ? 'bg-emerald-500 text-white shadow-emerald-900/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                        }`}
                    >
                        {copied ? <CheckCheck size={14} /> : <ExternalLink size={14} />}
                        {copied ? 'Copiado' : 'Operar'}
                    </button>
                ) : (
                    <div className={`text-sm font-bold flex items-center gap-1 ${statusColor}`}>
                        {signal.status}
                    </div>
                )}
            </div>

            {/* Grid de Datos */}
            <div className="grid grid-cols-3 divide-x divide-gray-700/50 mt-2 bg-gray-900/40 rounded-lg border border-gray-700/30 overflow-hidden">
                <div
                    onClick={() => { navigator.clipboard.writeText(signal.take_profit.toString()); toast.success('TP Copiado'); }}
                    className="flex flex-col items-center p-2 hover:bg-white/5 cursor-pointer active:bg-white/10"
                >
                    <span className="text-[10px] text-gray-400 font-bold mb-1 flex items-center gap-1"><Target size={10} /> TP</span>
                    <span className="text-white font-mono font-bold text-lg leading-none">{Math.round(signal.take_profit)}</span>
                    {/* Muestra ganancia potencial basada en EL PLAN DEL USUARIO */}
                    <span className="text-emerald-400 text-xs font-medium mt-1">
                         +${calculations.rewardAmount > 0 ? calculations.rewardAmount.toFixed(0) : signal.estimated_profit?.toFixed(0)}
                     </span>
                </div>

                <div
                    onClick={() => { navigator.clipboard.writeText(signal.stop_loss.toString()); toast.success('SL Copiado'); }}
                    className="flex flex-col items-center p-2 hover:bg-white/5 cursor-pointer active:bg-white/10"
                >
                    <span className="text-[10px] text-gray-400 font-bold mb-1 flex items-center gap-1"><ShieldAlert size={10} /> SL</span>
                    <span className="text-white font-mono font-bold text-lg leading-none">{Math.round(signal.stop_loss)}</span>
                    <span className="text-rose-400 text-xs font-medium mt-1">
                         -${calculations.riskAmount > 0 ? calculations.riskAmount.toFixed(0) : signal.estimated_loss?.toFixed(0)}
                    </span>
                </div>

                <div className="flex flex-col items-center justify-center p-2">
                    <span className="text-[10px] text-gray-400 font-bold mb-1 flex items-center gap-1"><Layers size={10} /> Lotaje</span>
                    <span className="text-yellow-400 font-mono font-bold text-lg leading-none">{signal.lotage}</span>
                </div>
            </div>
        </div>
    );
};