import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart2, Zap, TrendingUp, PlayCircle, User } from 'lucide-react';

export const MobileDock = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 pb-safe pt-2 px-6 z-50">
            <div className="flex justify-between items-center h-16">
                <NavIcon to="/" icon={<BarChart2 size={24} />} label="Inicio" />
                <NavIcon to="/signals" icon={<Zap size={24} />} label="Señales" />

                {/* Botón Central Destacado (Floating Action) */}
                <div className="relative -top-6">
                    <NavLink to="/trade" className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-gray-900 shadow-lg shadow-emerald-500/40 transform transition active:scale-95">
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
            `flex flex-col items-center justify-center w-12 gap-1 transition-colors ${
                isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'
            }`
        }
    >
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
);