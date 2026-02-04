import {useState, useEffect} from 'react';
import {Bell, BellOff, Loader2, CheckCircle2} from 'lucide-react';
import {useAuthStore} from '../../stores/useAuthStore';
import {subscribeToPush} from '../../hooks/usePushNotifications';
import toast from 'react-hot-toast';

export const PushNotificationToggler = () => {
    const {user} = useAuthStore();
    const [status, setStatus] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setStatus(Notification.permission);
        }
    }, []);

    const handleSubscribe = async () => {
        if (!user) return toast.error("Debes iniciar sesión");

        setLoading(true);
        try {
            await subscribeToPush(user.id);
            setStatus('granted');
            toast.success("¡Dispositivo vinculado exitosamente!");
        } catch (error: any) {
            console.error(error);
            toast.error("No se pudo activar. Revisa los permisos del navegador.");
            if (Notification.permission === 'denied') setStatus('denied');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'granted') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-400">
                <CheckCircle2 size={14}/>
                <span>Notificaciones Activas</span>
            </div>
        );
    }

    if (status === 'denied') {
        return (
            <div
                className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-bold text-rose-400">
                <BellOff size={14}/>
                <span>Bloqueadas por navegador</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 size={14} className="animate-spin"/> : <Bell size={14}/>}
            {loading ? 'Activando...' : 'Activar Notificaciones Push'}
        </button>
    );
};