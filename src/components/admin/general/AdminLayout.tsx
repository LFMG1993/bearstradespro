import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, CreditCard, LogOut } from 'lucide-react';
import { authService } from '../../../services/auth.service';

export default function AdminLayout() {
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Building2, label: 'Organizaciones', path: '/admin/orgs' },
        { icon: CreditCard, label: 'Planes & Subs', path: '/admin/subscriptions' },
        { icon: Users, label: 'Usuarios Globales', path: '/admin/users' },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-emerald-400 tracking-wider">
                        BEARSTRADES
                        <span className="block text-xs text-slate-500 font-normal mt-1">SUPER ADMIN</span>
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                    isActive
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'hover:bg-slate-900 text-slate-400 hover:text-white'
                                }`}
                            >
                                <item.icon size={18} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => authService.logout()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="flex-1 overflow-y-auto bg-slate-950 p-8">
                <Outlet />
            </main>
        </div>
    );
}