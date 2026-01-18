import {Outlet} from 'react-router-dom';
import {Bell} from 'lucide-react';
import {MobileDock} from './MobileDock';

export const MainLayout = () => {
    return (
        // 1. WRAPPER EXTERNO (El fondo de la pantalla en PC)
        // En móvil es invisible, en PC se ve gris oscuro llenando los lados vacíos.
        <div
            className="min-h-screen bg-[#0B1120] font-sans text-gray-100 flex justify-center selection:bg-emerald-500/30">

            {/* 2. APP SHELL (El "Teléfono Virtual")
               - max-w-2xl: Límite de anchura (aprox 672px).
               - w-full: En móvil ocupa todo.
               - shadow-2xl: Le da profundidad en escritorio.
               - border-x: Líneas sutiles a los lados en escritorio.
            */}
            <div
                className="w-full max-w-2xl bg-gray-900 min-h-screen relative shadow-2xl shadow-black border-x border-gray-800/50">

                {/* HEADER */}
                <header
                    className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-5 py-4 flex justify-between items-center transition-all duration-300">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 ring-2 ring-gray-800">
                            TS
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Bienvenido</p>
                            <h1 className="text-sm font-bold text-white">Trader Pro</h1>
                        </div>
                    </div>

                    <button
                        className="relative p-2.5 bg-gray-800/80 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition active:scale-95 border border-gray-700/50">
                        <Bell size={20}/>
                        <span
                            className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
                    </button>
                </header>

                {/* CONTENIDO (Outlet) */}
                {/* pb-32: Damos buen espacio abajo para que el Dock no tape el último elemento */}
                <main className="px-5 pt-6 pb-32 space-y-8">
                    <Outlet/>
                </main>
                <MobileDock/>
            </div>
        </div>
    );
};