import {ArrowRight, BookOpen} from 'lucide-react';
import {useQuery} from '@tanstack/react-query';
import {signalsService} from '../services/signals.service';
import {SignalCard} from '../components/homepage/SignalCard';
import {AcademyCard} from '../components/homepage/AcademyCard';
import {StatPill} from '../components/homepage/StatPill';
import type {Course} from '../types';

// Datos mock para cursos (luego mover a servicio)
const courses: Course[] = [
    {id: '1', title: 'Psicotrading 101', duration: '12 min', thumbnail: 'bg-purple-600', level: 'Básico'},
    {id: '2', title: 'Estrategia de Liquidez', duration: '45 min', thumbnail: 'bg-blue-600', level: 'Avanzado'},
];

export default function TradingApp() {
    const {data: activeSignals, isLoading} = useQuery({
        queryKey: ['signals'],
        queryFn: signalsService.getAll
    });

    const signalsList = Array.isArray(activeSignals) ? activeSignals : (activeSignals as any)?.data;

    return (
        <>
            {/* 2. RESUMEN ESTADÍSTICO (Hero Section) */}
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold text-white">Tu Rendimiento</h2>
                    <button className="text-emerald-400 text-xs font-medium flex items-center gap-1">
                        Ver todo <ArrowRight size={12}/>
                    </button>
                </div>
                <div className="flex gap-3">
                    <StatPill label="Win Rate" value="68%" trend="up"/>
                    <StatPill label="Beneficio Mes" value="+$1,240" trend="up"/>
                    <StatPill label="Señales" value="12"/>
                </div>
            </section>

            {/* 3. SEÑALES EN VIVO (Core Value) */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                    <h2 className="text-xl font-bold text-white">Señales en Vivo</h2>
                </div>

                <div className="space-y-1">
                    {isLoading && <p className="text-gray-400 text-sm">Cargando señales...</p>}
                    {Array.isArray(signalsList) ? signalsList.slice(0, 3).map((signal: any) => (
                        <SignalCard key={signal.id} signal={signal}/>
                    )) : (
                        !isLoading && <p className="text-rose-400 text-xs">No se pudieron cargar las señales.</p>
                    )}
                </div>
                <button
                    className="w-full mt-3 py-3 bg-gray-800 text-gray-300 text-sm font-medium rounded-xl border border-gray-700 hover:bg-gray-700 transition">
                    Ver historial cerrado
                </button>
            </section>

            {/* 4. ACADEMIA (Scroll Horizontal) */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4">Academia Trading</h2>
                <div className="flex overflow-x-auto pb-4 -mx-5 px-5 snap-x">
                    {courses.map(course => (
                        <AcademyCard key={course.id} course={course}/>
                    ))}
                    {/* Card "Ver más" */}
                    <div
                        className="min-w-[100px] flex flex-col items-center justify-center bg-gray-800/30 rounded-lg border border-dashed border-gray-700 mr-4 snap-start">
                        <BookOpen className="text-gray-500 mb-2"/>
                        <span className="text-xs text-gray-500">Ver todo</span>
                    </div>
                </div>
            </section>
        </>
    );
}