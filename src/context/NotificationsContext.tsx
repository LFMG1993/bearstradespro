import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../lib/supabase';
import toast from 'react-hot-toast';
import {TrendingUp} from 'lucide-react';

// Tipos
export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'NEW_SIGNAL' | 'UPDATE_SIGNAL' | 'INFO';
    timestamp: Date;
    read: boolean;
}

interface NotificationsContextType {
    notifications: AppNotification[];
    unreadCount: number;
    markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // Calculamos no leídas
    const unreadCount = notifications.filter(n => !n.read).length;

    const addNotification = (n: AppNotification) => {
        setNotifications(prev => {
            const newList = [n, ...prev];
            return newList.slice(0, 5); // Mantenemos solo las últimas 5
        });
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    useEffect(() => {
        // Suscripción a la tabla 'signals'
        const channel = supabase
            .channel('realtime-signals')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'signals'},
                (payload) => {
                    const {eventType, new: newRecord, old: oldRecord} = payload;

                    // 1. CASO: NUEVA SEÑAL
                    if (eventType === 'INSERT') {
                        const message = `${newRecord.signal_type} en ${newRecord.symbol} @ ${newRecord.price}`;

                        // A. Disparar Toast
                        toast.custom((t) => (
                            <div
                                className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-emerald-500/50`}>
                                <div className="flex-1 w-0 p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-0.5">
                                            <TrendingUp
                                                className="h-10 w-10 text-emerald-400 p-2 bg-emerald-500/20 rounded-full"/>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-white">¡Nueva Señal Detectada!</p>
                                            <p className="mt-1 text-sm text-gray-400">{message}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ), {duration: 4000});

                        // B. Guardar en historial
                        addNotification({
                            id: crypto.randomUUID(),
                            title: 'Nueva Señal',
                            message: message,
                            type: 'NEW_SIGNAL',
                            timestamp: new Date(),
                            read: false
                        });
                    }

                    // 2. CASO: ACTUALIZACIÓN (WON/LOST)
                    if (eventType === 'UPDATE' && newRecord.status !== oldRecord.status) {
                        const isWon = newRecord.status === 'WON';
                        const title = isWon ? 'Take Profit Alcanzado 🎯' : 'Stop Loss Tocado 🛡️';

                        // A. Disparar Toast
                        if (isWon) toast.success(`${newRecord.symbol} cerró en GANANCIA`, {icon: '💰'});
                        else toast(`${newRecord.symbol} cerró en PÉRDIDA`, {icon: '⚠️'});

                        // B. Guardar en historial
                        addNotification({
                            id: crypto.randomUUID(),
                            title: title,
                            message: `La operación en ${newRecord.symbol} ha finalizado como ${newRecord.status}.`,
                            type: 'UPDATE_SIGNAL',
                            timestamp: new Date(),
                            read: false
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <NotificationsContext.Provider value={{notifications, unreadCount, markAllAsRead}}>
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) throw new Error('useNotifications debe usarse dentro de NotificationsProvider');
    return context;
};