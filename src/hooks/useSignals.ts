import { useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { fetchSignals, fetchSignalsPaginated } from '../services/signals.service';
import type { Signal } from '../types';

export const useSignals = () => {
    const queryClient = useQueryClient();
    const QUERY_KEY = ['signals'];

    // 1. GESTIÓN DE ESTADO CON TANSTACK QUERY
    // Esto maneja loading, error, cache y reintentos automáticamente.
    const { data: signals = [], isLoading, error } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: fetchSignals,
        staleTime: 1000 * 60 * 5, // Consideramos la data "fresca" por 5 min (el realtime se encarga de lo nuevo)
    });

    // 2. SUSCRIPCIÓN REALTIME (Inyecta datos directo a la caché)
    useEffect(() => {
        const channel = supabase
            .channel('public:signals')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'signals' },
                (payload) => {
                    // ACTUALIZACIÓN OPTIMISTA:
                    // En vez de recargar todo (invalidateQueries), inyectamos la nueva señal manualmente.
                    queryClient.setQueryData<Signal[]>(QUERY_KEY, (oldData) => {
                        const newSignal = payload.new as Signal;
                        return oldData ? [newSignal, ...oldData] : [newSignal];
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'signals' },
                (payload) => {
                    // ACTUALIZACIÓN DE ESTADO (WON/LOST):
                    // Buscamos la señal en la caché y la actualizamos quirúrgicamente.
                    queryClient.setQueryData<Signal[]>(QUERY_KEY, (oldData) => {
                        if (!oldData) return [];
                        return oldData.map((signal) =>
                            signal.id === payload.new.id ? (payload.new as Signal) : signal
                        );
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]); // Dependencia segura

    return { signals, isLoading, error };
};

// Nuevo Hook para la Tabla con Paginación de Servidor
export const usePaginatedSignals = (page: number, pageSize: number) => {
    const QUERY_KEY = ['signals', 'paginated', page, pageSize];

    const { data, isLoading, error } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => fetchSignalsPaginated(page, pageSize),
        placeholderData: keepPreviousData, // Mantiene la data anterior mientras carga la nueva (evita parpadeos)
    });

    return {
        signals: data?.data || [],
        totalCount: data?.count || 0,
        isLoading,
        error
    };
};