import {useState, useEffect, useRef} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Bell, LogInIcon, X} from 'lucide-react';
import {MobileDock} from './MobileDock';
import {useAuthStore} from '../../stores/useAuthStore';
import {useNotifications} from '../../context/NotificationsContext';
import {PushNotificationToggler} from "./PushNotificationToggler.tsx";
import {InstallPWA} from "./InstallPWA.tsx";
import {UpdatePWA} from "./UpdatePWA.tsx";
import bearsBlack from '../../assets/bears_black.gif';

export const MainLayout = () => {
    const {user, profile} = useAuthStore();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Notificaciones
    const {unreadCount, notifications, markAllAsRead} = useNotifications();
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotif(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lógica del Timer (tu código original intacto)
    useEffect(() => {
        if (user) return;
        const updateTimer = () => {
            const expiry = localStorage.getItem('guest_expiry');
            if (expiry) {
                const remaining = Math.max(0, Math.ceil((parseInt(expiry) - Date.now()) / 1000));
                setTimeLeft(remaining);
            }
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [user]);

    const handleHeaderClick = () => {
        if (!user) navigate('/login');
    };

    const toggleNotifications = () => {
        if (!showNotif) {
            markAllAsRead(); // Marcar como leídas al abrir
        }
        setShowNotif(!showNotif);
    };

    return (
        <div
            className="min-h-screen bg-[#0B1120] font-sans text-gray-100 flex justify-center selection:bg-emerald-500/30">
            <div
                className="w-full max-w-2xl bg-gray-900 min-h-screen relative shadow-2xl shadow-black border-x border-gray-800/50">

                {/* HEADER */}
                <header
                    className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-5 py-4 flex justify-between items-center transition-all duration-300">

                    {/* Perfil (Tu código original) */}
                    <div onClick={handleHeaderClick}
                         className={`flex items-center gap-3 ${!user ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}>
                        <div
                            className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20 ring-2 ring-gray-800 overflow-hidden">
                            {user ? <img src={bearsBlack} alt="Avatar" className="w-full h-full object-cover"/> :
                                <LogInIcon size={18}/>}
                            {!user && timeLeft !== null && timeLeft > 0 && (
                                <div
                                    className="absolute -bottom-1 -right-2 bg-amber-500 text-gray-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-gray-900 animate-pulse">{timeLeft}s</div>
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{user ? 'Bienvenido' : 'Modo Invitado'}</p>
                            <h1 className="text-sm font-bold text-white flex items-center gap-1">{user ? (profile?.full_name?.split(' ')[0] || 'Trader') : 'Iniciar Sesión'}</h1>
                        </div>
                    </div>

                    {/* CAMPANA DE NOTIFICACIONES */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={toggleNotifications}
                            className="relative p-2.5 bg-gray-800/80 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition active:scale-95 border border-gray-700/50"
                        >
                            <Bell size={20}/>
                            {unreadCount > 0 && (
                                <span
                                    className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[8px] font-bold text-white">
                                </span>
                            )}
                        </button>

                        {/* DROPDOWN DE NOTIFICACIONES */}
                        {showNotif && (
                            <div
                                className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div
                                    className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actividad
                                        Reciente</h3>
                                    <button onClick={() => setShowNotif(false)}><X size={14}
                                                                                   className="text-gray-500 hover:text-white"/>
                                    </button>
                                </div>

                                <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                                    <PushNotificationToggler/>
                                </div>

                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 text-sm">
                                            <Bell size={24} className="mx-auto mb-2 opacity-20"/>
                                            No hay notificaciones
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div key={notif.id}
                                                 className="p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition last:border-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span
                                                        className={`text-xs font-bold ${notif.type === 'NEW_SIGNAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {notif.title}
                                                    </span>
                                                    <span className="text-[10px] text-gray-600">
                                                        {notif.timestamp.toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-300 leading-relaxed">{notif.message}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="px-5 pt-6 pb-32 space-y-8">
                    <Outlet/>
                </main>
                <MobileDock/>
                <InstallPWA/>
                <UpdatePWA/>
            </div>
        </div>
    );
};