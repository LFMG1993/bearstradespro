import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Zap, TrendingUp, PlayCircle, User } from 'lucide-react';

export const MobileDock = () => {
    return (
        // CAMBIOS IMPORTANTES EN EL className:
        // 1. Quitamos 'left-0 right-0' (que estira todo).
        // 2. Agregamos 'w-full max-w-2xl' (para coincidir con tu Layout).
        // 3. Agregamos 'left-1/2 -translate-x-1/2' (para centrarlo en PC).
        <nav className="fixed bottom-0 z-50 w-full max-w-2xl left-1/2 -translate-x-1/2
                        bg-gray-900/90 backdrop-blur-xl border-t border-gray-800
                        pb-safe pt-2 px-6">

            <div className="flex justify-between items-center h-16">
                <NavIcon to="/" icon={<BarChart2 size={24} />} label="Inicio" />
                <NavIcon to="/signals" icon={<Zap size={24} />} label="Señales" />

                {/* Botón Central Flotante */}
                <div className="relative -top-6">
                    <NavLink to="/trade"
                             className={({isActive}) => `
                            w-14 h-14 rounded-full flex items-center justify-center 
                            shadow-lg shadow-emerald-500/40 transform transition-all duration-300
                            hover:scale-105 active:scale-95
                            ${isActive ? 'bg-emerald-400 text-gray-900 ring-4 ring-emerald-500/30' : 'bg-emerald-500 text-gray-900'}
                        `}>
                        <TrendingUp size={28} />
                    </NavLink>
                </div>

                <NavIcon to="/academy" icon={<PlayCircle size={24} />} label="Academia" />
                <NavIcon to="/profile" icon={<User size={24} />} label="Perfil" />
            </div>
        </nav>
    );
};

const NavIcon = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex flex-col items-center justify-center w-12 gap-1 transition-all duration-200 group ${
                isActive
                    ? 'text-emerald-400 translate-y-[-2px]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg py-1'
            }`
        }
    >
        {/* El icono reacciona al estado activo llenándose o cambiando grosor si usas variantes de Lucide,
            por ahora mantenemos el cambio de color simple */}
        {({ isActive }) => (
            <>
                {icon}
                <span className={`text-[10px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                     {label}
                 </span>
            </>
        )}
    </NavLink>
);