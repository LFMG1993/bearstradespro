import { useMemo } from 'react'; // <--- IMPORTANTE
import { ArrowRight, BookOpen } from 'lucide-react';
import { useSignals } from "../hooks/useSignals.ts";
import { SignalCard } from '../components/homepage/SignalCard';
import { AcademyCard } from '../components/homepage/AcademyCard';
import { StatPill } from '../components/homepage/StatPill';
import { calculateMonthlyStats } from '../utils/stats'; // <--- Importamos la lógica
import type { Course } from '../types';

// Datos mock para cursos (esto sigue igual)
const courses: Course[] = [
    {id: '1', title: 'Psicotrading 101', duration: '12 min', thumbnail: 'bg-purple-600', level: 'Básico'},
    {id: '2', title: 'Estrategia de Liquidez', duration: '45 min', thumbnail: 'bg-blue-600', level: 'Avanzado'},
];

export default function TradingApp() {
    const { signals, isLoading } = useSignals();

    // 1. CALCULAMOS LAS ESTADÍSTICAS EN VIVO
    // useMemo evita recalcular en cada render si 'signals' no ha cambiado
    const stats = useMemo(() => calculateMonthlyStats(signals), [signals]);

    // Formateador de dinero
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-24 space-y-8">

            {/* 2. RESUMEN ESTADÍSTICO (DINÁMICO) */}
            <section>
                <div className="flex justify-between items-end mb-4 px-1">
                    <h2 className="text-xl font-bold text-white">Rendimiento Mensual</h2>
                    <button className="text-emerald-400 text-xs font-medium flex items-center gap-1 hover:text-emerald-300 transition">
                        Ver todo <ArrowRight size={12}/>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {/* WIN RATE */}
                    <StatPill
                        label="Win Rate"
                        value={`${stats.winRate}%`}
                        trend={stats.winRate >= 50 ? 'up' : 'down'}
                    />

                    {/* BENEFICIO NETO */}
                    <StatPill
                        label="Beneficio"
                        value={formatMoney(stats.netProfit)}
                        trend={stats.trend as 'up' | 'down'}
                    />

                    {/* TOTAL SEÑALES */}
                    <StatPill
                        label="Señales"
                        value={stats.totalSignals.toString()}
                        // Sin tendencia específica para el conteo, o puedes poner 'up' si hay actividad
                    />
                </div>
            </section>

            {/* 3. SEÑALES EN VIVO */}
            <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="relative">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping absolute opacity-75"></div>
                        <div className="w-2 h-2 bg-rose-500 rounded-full relative"></div>
                    </div>
                    <h2 className="text-xl font-bold text-white">Señales en Vivo</h2>
                </div>

                <div className="space-y-3 min-h-[200px]">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-xs animate-pulse">Sincronizando mercado...</p>
                        </div>
                    )}

                    {!isLoading && signals.length === 0 && (
                        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700 mx-1">
                            <p className="text-gray-400 text-sm">Sin actividad reciente</p>
                            <p className="text-gray-600 text-xs mt-1">El bot está escaneando oportunidades</p>
                        </div>
                    )}

                    {/* Mostramos solo las últimas 3 */}
                    {signals.slice(0, 3).map((signal) => (
                        <SignalCard key={signal.id} signal={signal}/>
                    ))}
                </div>

                <button
                    className="w-full mt-4 py-3 bg-gray-800/80 text-gray-300 text-sm font-medium rounded-xl border border-gray-700 hover:bg-gray-700 hover:text-white transition active:scale-[0.98]">
                    Ver historial completo
                </button>
            </section>

            {/* 4. ACADEMIA */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4 px-1">Academia Trading</h2>
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 snap-x scrollbar-hide">
                    {courses.map(course => (
                        <div key={course.id} className="snap-start shrink-0 first:pl-0">
                            <AcademyCard course={course}/>
                        </div>
                    ))}
                    <div className="min-w-[100px] flex flex-col items-center justify-center bg-gray-800/30 rounded-lg border border-dashed border-gray-700 mr-4 snap-start cursor-pointer hover:bg-gray-800/50 transition shrink-0 ml-3">
                        <BookOpen className="text-gray-500 mb-2"/>
                        <span className="text-xs text-gray-500">Ver todo</span>
                    </div>
                </div>
            </section>
        </div>
    );
}