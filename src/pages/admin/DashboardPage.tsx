import { useEffect, useState } from 'react';
import { Users, CreditCard, TrendingUp, Building2, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubs: 0,
        totalOrgs: 0,
        recentUsers: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Total Usuarios
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

                // 2. Suscripciones Activas
                const { count: subsCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');

                // 3. Organizaciones
                const { count: orgsCount } = await supabase.from('organizations').select('*', { count: 'exact', head: true });

                // 4. Últimos usuarios registrados
                const { data: recent } = await supabase
                    .from('profiles')
                    .select('email, full_name, created_at, organization_id')
                    .order('created_at', { ascending: false })
                    .limit(5);

                setStats({
                    totalUsers: usersCount || 0,
                    activeSubs: subsCount || 0,
                    totalOrgs: orgsCount || 0,
                    recentUsers: recent || []
                });
            } catch (e) {
                console.error("Error cargando stats", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-white">Cargando métricas...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard General</h1>
                <p className="text-gray-400">Visión global del ecosistema Bearstrades</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Usuarios Totales"
                    value={stats.totalUsers}
                    icon={Users}
                    color="bg-blue-500/10 text-blue-500"
                />
                <StatCard
                    title="Suscripciones Activas"
                    value={stats.activeSubs}
                    icon={CreditCard}
                    color="bg-emerald-500/10 text-emerald-500"
                />
                <StatCard
                    title="Organizaciones"
                    value={stats.totalOrgs}
                    icon={Building2}
                    color="bg-purple-500/10 text-purple-500"
                />
                <StatCard
                    title="Señales del Mes"
                    value="124" // Hardcoded o traer de BD
                    icon={TrendingUp}
                    color="bg-rose-500/10 text-rose-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabla Recientes */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white">Usuarios Recientes</h2>
                        <Link to="/admin/users" className="text-sm text-emerald-400 hover:text-emerald-300">Ver todos</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                            <tr>
                                <th className="p-3 rounded-l-lg">Usuario</th>
                                <th className="p-3">Email</th>
                                <th className="p-3 rounded-r-lg">Registro</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                            {stats.recentUsers.map((user, i) => (
                                <tr key={i} className="text-sm text-gray-300 hover:bg-gray-800/30 transition">
                                    <td className="p-3 font-medium text-white">{user.full_name || 'Sin nombre'}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3 text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
                    <div className="space-y-3">
                        <QuickAction
                            to="/admin/subscriptions"
                            label="Gestionar Suscripciones"
                            desc="Otorgar días, cambiar planes"
                            icon={CreditCard}
                        />
                        <QuickAction
                            to="/admin/orgs"
                            label="Nueva Organización"
                            desc="Dar de alta una academia"
                            icon={Building2}
                        />
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition text-left group">
                            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">Ver Logs del Sistema</div>
                                <div className="text-xs text-gray-500">Revisar errores recientes</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componentes auxiliares para mantener limpio el código
const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const QuickAction = ({ to, label, desc, icon: Icon }: any) => (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition group">
        <div className="p-2 bg-gray-700 text-gray-300 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition">
            <Icon size={20} />
        </div>
        <div>
            <div className="text-sm font-medium text-white">{label}</div>
            <div className="text-xs text-gray-500">{desc}</div>
        </div>
    </Link>
);