import { useMemo, useState, useEffect } from 'react';
import { fetchSignalsByMonth } from '../services/signals.service';
import { calculateSymbolStats } from '../utils/stats';
import { Trophy, Activity, ArrowLeft, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Signal } from '../types';

export const PerformancePage = () => {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Hook que se dispara cada vez que `selectedDate` cambia
    useEffect(() => {
        const loadSignalsForMonth = async () => {
            setIsLoading(true);
            try {
                const data = await fetchSignalsByMonth(selectedDate);
                setSignals(data);
            } catch (error) {
                console.error("Error al cargar señales del mes:", error);
                setSignals([]); // Limpiar en caso de error
            } finally {
                setIsLoading(false);
            }
        };
        loadSignalsForMonth();
    }, [selectedDate]); // La dependencia clave: se re-ejecuta al cambiar el mes


    // Funciones para navegar entre meses
    const changeMonth = (offset: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + offset);
            return newDate;
        });
    };

    // Formatear fecha: "Enero 2026"
    const formattedDate = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(selectedDate);
    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    const isCurrentMonth = new Date().getMonth() === selectedDate.getMonth() && new Date().getFullYear() === selectedDate.getFullYear();
    const symbolStats = useMemo(() => calculateSymbolStats(signals, selectedDate), [signals, selectedDate]);

    if (isLoading) return <div className="text-white text-center p-10">Calculando métricas...</div>;

    // Encontramos el mejor (el primero de la lista ya ordenada)
    const bestPerformer = symbolStats.length > 0 ? symbolStats[0] : null;

    return (
        <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-24 space-y-6">

            {/* Header con botón de volver */}
            <div className="flex items-center gap-3">
                <Link to="/" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-white">Rendimiento por Par</h2>
                    <p className="text-gray-400 text-xs">Análisis detallado de operaciones</p>
                </div>
            </div>

            {/* SELECTOR DE FECHA */}
            <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded-xl border border-gray-700/50">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition">
                    <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2 text-white font-bold">
                    <Calendar size={16} className="text-emerald-400" />
                    <span>{displayDate}</span>
                </div>

                <button
                    onClick={() => changeMonth(1)}
                    disabled={isCurrentMonth}
                    className={`p-2 rounded-lg transition ${isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}>
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* 1. TARJETA DEL MVP (MEJOR RENDIMIENTO) */}
            {bestPerformer && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/40 to-gray-900 border border-emerald-500/30 p-6">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy size={100} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="text-yellow-400" size={20} />
                            <span className="text-emerald-400 font-bold text-sm tracking-wider">MVP DE {displayDate.toUpperCase().split(' ')[0]}</span>
                        </div>

                        <h3 className="text-3xl font-bold text-white mb-1">{bestPerformer.symbol}</h3>

                        <div className="flex items-end gap-3 mt-4">
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-xs">Win Rate</span>
                                <span className="text-4xl font-bold text-white">{bestPerformer.winRate}%</span>
                            </div>
                            <div className="h-8 w-px bg-gray-700 mx-2"></div>
                            <div className="flex flex-col pb-1">
                                <span className="text-gray-400 text-xs">Beneficio</span>
                                <span className={`font-mono font-bold ${bestPerformer.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                     {bestPerformer.netProfit >= 0 ? '+' : ''}${bestPerformer.netProfit.toFixed(2)}
                                 </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. LISTA DE RANKING (LEADERBOARD) */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={18} className="text-blue-400" />
                    Ranking Global
                </h3>

                <div className="grid gap-3">
                    {symbolStats.map((stat, index) => (
                        <div key={stat.symbol} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800/60 transition">

                            {/* Columna Izquierda: Ranking y Nombre */}
                            <div className="flex items-center gap-4">
                                <span className={`text-lg font-bold w-6 text-center ${index < 3 ? 'text-white' : 'text-gray-600'}`}>
                                    #{index + 1}
                                </span>
                                <div>
                                    <h4 className="text-white font-bold">{stat.symbol}</h4>
                                    <span className="text-xs text-gray-500">{stat.totalTrades} operaciones</span>
                                </div>
                            </div>

                            {/* Columna Derecha: Win Rate y Barra */}
                            <div className="flex flex-col items-end w-32">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-bold ${stat.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {stat.winRate}%
                                    </span>
                                    <span className="text-xs text-gray-500">WR</span>
                                </div>
                                {/* Barra de progreso visual */}
                                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${stat.winRate >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                        style={{ width: `${stat.winRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {symbolStats.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No hay operaciones cerradas en {displayDate}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};