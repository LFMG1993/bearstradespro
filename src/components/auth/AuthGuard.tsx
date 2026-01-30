import * as React from 'react';
import {useEffect, useState} from 'react';
import {useAuthStore} from '../../stores/useAuthStore';
import {useNavigate, useLocation} from 'react-router-dom';
import {Lock, LogOut} from 'lucide-react';

export const AuthGuard = ({children}: { children: React.ReactNode }) => {
    const {user, profile, isLoading, initialized, signOut} = useAuthStore();
    const [timeExpired, setTimeExpired] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Rutas públicas que no requieren bloqueo nunca (ej: Login, Landing page pública)
    const publicRoutes = ['/login', '/register', '/forgot-password', '/privacy', '/risk-disclaimer'];

    useEffect(() => {
        // Si ya está logueado o es ruta pública, no hacemos nada
        if (user || publicRoutes.includes(location.pathname)) return;

        // Verificar si ya expiró el tiempo en localStorage (para persistir entre recargas)
        const expiryTime = localStorage.getItem('guest_expiry');
        const now = Date.now();

        if (expiryTime && now > parseInt(expiryTime)) {
            setTimeExpired(true);
        } else {
            // Si no hay tiempo, seteamos 1 minuto desde ahora
            if (!expiryTime) {
                const newExpiry = now + (60 * 1000); // 1 minuto
                localStorage.setItem('guest_expiry', newExpiry.toString());
            }

            // Timer para bloquear en tiempo real
            const timeout = setTimeout(() => {
                setTimeExpired(true);
            }, 60 * 1000); // 1 minuto visual

            return () => clearTimeout(timeout);
        }
    }, [user, location.pathname]);

    // Si está cargando la sesión inicial, mostramos spinner o nada
    if (isLoading || !initialized) return null;

    // 1. BLOQUEO POR SUSCRIPCIÓN VENCIDA
    // Verificamos si el usuario está logueado, tiene fecha de vencimiento y NO está intentando entrar al admin
    if (user && profile?.trial_ends_at && !location.pathname.startsWith('/admin')) {
        const trialEnd = new Date(profile.trial_ends_at);
        const now = new Date();

        if (now > trialEnd) {
            return (
                <div
                    className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                    <div className="bg-gray-800 p-8 rounded-2xl border border-rose-500/30 max-w-md w-full shadow-2xl">
                        <div
                            className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="text-rose-400" size={32}/>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Suscripción Vencida</h2>
                        <p className="text-gray-400 mb-8">
                            Tu periodo de prueba finalizó el {trialEnd.toLocaleDateString()}.<br/>
                            Por favor contacta a soporte para renovar tu acceso a las señales.
                        </p>
                        <button
                            onClick={() => signOut()}
                            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <LogOut size={18}/> Cerrar Sesión
                        </button>
                    </div>
                </div>
            );
        }
    }

    // Si el tiempo expiró y no hay usuario, mostramos el bloqueo
    if (timeExpired && !user && !publicRoutes.includes(location.pathname)) {
        return (
            <div
                className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl">
                    <div
                        className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-emerald-400" size={32}/>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tiempo de vista previa terminado</h2>
                    <p className="text-gray-400 mb-8">
                        Para continuar accediendo a las señales en vivo y la academia, por favor inicia sesión o crea
                        una cuenta gratuita.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition"
                        >
                            Crear Cuenta Gratis
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-6">
                        Obtén 7 días de acceso completo al registrarte.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};