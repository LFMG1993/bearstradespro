import { Outlet } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { MobileDock } from './MobileDock';

export const MainLayout = () => {
    return (
        <div className="bg-gray-900 min-h-screen font-sans text-gray-100 pb-24 selection:bg-emerald-500/30">
            {/* 1. HEADER GLOBAL */}
            <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 px-5 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                        TS
                    </div>
                    <div>
                        <p className="text-xs text-gray-400">Bienvenido,</p>
                        <h1 className="text-sm font-bold text-white">Trader Pro</h1>
                    </div>
                </div>
                <button className="relative p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white transition">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-gray-900"></span>
                </button>
            </header>

            {/* 2. CONTENIDO DINÁMICO (PÁGINAS) */}
            <main className="px-5 pt-6 space-y-8">
                <Outlet />
            </main>

            {/* 3. NAVEGACIÓN INFERIOR */}
            <MobileDock />
        </div>
    );
};