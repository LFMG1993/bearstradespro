import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ShieldAlert } from 'lucide-react';

export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/login');
                return;
            }

            // Consultamos si el usuario tiene el rol SUPER_ADMIN
            const { data } = await supabase
                .from('user_roles')
                .select('roles(name)')
                .eq('user_id', user.id)
                .eq('roles.name', 'SUPER_ADMIN') // Buscamos por nombre
                .single();

            if (data) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        };

        checkRole();
    }, [navigate]);

    if (isAuthorized === null) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Verificando credenciales...</div>;
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
                <ShieldAlert size={64} className="text-rose-500 mb-4" />
                <h1 className="text-3xl font-bold mb-2">Acceso Restringido</h1>
                <p className="text-gray-400 mb-6">Esta zona es solo para el personal del sistema.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                >
                    Volver a zona segura
                </button>
            </div>
        );
    }

    return <>{children}</>;
};