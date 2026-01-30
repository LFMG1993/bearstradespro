import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, Gift, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Usamos la URL de tu API (worker)
const API_URL = import.meta.env.VITE_API_URL;
// Necesitas la clave admin secreta
const ADMIN_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY;

export default function AdminSubscriptionPanel() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            // Nota: Lo ideal es llamar a tu endpoint /api/admin/users
            // Pero por rapidez usamos supabase directo aquí si tienes las policies
            const { data, error } = await supabase
                .from('subscriptions')
                .select(`
                    id,
                    user_id,
                    status,
                    current_period_end,
                    plans ( name, code ),
                    profiles ( email, full_name, organization_id ) 
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando usuarios");
        } finally {
            setLoading(false);
        }
    };

    const grantAccess = async (userId: string, days: number, planCode: string) => {
        setProcessing(userId);
        try {
            const response = await fetch(`${API_URL}/api/admin/grant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': ADMIN_KEY // Asegúrate de tener esto en .env
                },
                body: JSON.stringify({ userId, planCode, days })
            });

            const result = await response.json();
            if (!result.success) throw new Error(result.error);

            toast.success(`¡Listo! +${days} días otorgados.`);
            fetchUsers(); // Recargar datos
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setProcessing(null);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Suscripciones</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="bg-gray-900 border border-gray-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-500" size={18}/>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
                    <tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Vence</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando...</td></tr>
                    ) : users.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-800/50">
                            <td className="p-4">
                                <div className="font-bold text-white">{sub.profiles?.full_name || 'Usuario'}</div>
                                <div className="text-xs text-gray-500">{sub.profiles?.email}</div>
                            </td>
                            <td className="p-4">
                                    <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700">
                                        {sub.plans?.name || 'Sin plan'}
                                    </span>
                            </td>
                            <td className="p-4">
                                {new Date(sub.current_period_end) < new Date() ? (
                                    <span className="text-rose-400 text-xs flex items-center gap-1"><ShieldAlert size={14}/> Vencido</span>
                                ) : (
                                    <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle size={14}/> Activo</span>
                                )}
                            </td>
                            <td className="p-4 text-sm text-gray-400">
                                {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-4 flex justify-end gap-2">
                                <button
                                    disabled={!!processing}
                                    onClick={() => grantAccess(sub.user_id, 30, 'pro')}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg flex items-center gap-1 disabled:opacity-50"
                                >
                                    {processing === sub.user_id ? <Loader2 className="animate-spin" size={14}/> : <Gift size={14}/>}
                                    +30d
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}