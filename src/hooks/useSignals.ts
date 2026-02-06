import {useEffect} from 'react';
import {useQuery, useQueryClient, keepPreviousData} from '@tanstack/react-query';
import {supabase} from '../lib/supabase';
import {fetchSignals, fetchSignalsPaginated} from '../services/signals.service';
import {useAuthStore} from '../stores/useAuthStore';
import type {Signal} from '../types';

export const useSignals = () => {
    const queryClient = useQueryClient();
    const {profile} = useAuthStore();
    const organizationId = profile?.organization_id;

    const QUERY_KEY = ['signals', organizationId];

    const {data: signals = [], isLoading, error} = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => fetchSignals(organizationId),
        staleTime: 1000 * 60 * .30,
        refetchOnWindowFocus: true,
        enabled: !!organizationId,
    });

    // SUSCRIPCIÓN REALTIME
    useEffect(() => {
        if (!organizationId) return;
        const channel = supabase
            .channel(`signals-org-${organizationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'signals',
                    filter: `organization_id=eq.${organizationId}`
                },
                (payload) => {
                    queryClient.setQueryData<Signal[]>(QUERY_KEY, (oldData) => {
                        const newSignal = payload.new as Signal;
                        return oldData ? [newSignal, ...oldData] : [newSignal];
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'signals',
                    filter: `organization_id=eq.${organizationId}`
                },
                (payload) => {
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
    }, [queryClient, organizationId]);

    return {signals, isLoading, error};
};

export const usePaginatedSignals = (page: number, pageSize: number, symbol?: string) => {
    const QUERY_KEY = ['signals', 'paginated', page, pageSize, symbol];

    const {data, isLoading, error} = useQuery({
        queryKey: QUERY_KEY,
        queryFn: () => fetchSignalsPaginated(page, pageSize, symbol),
        placeholderData: keepPreviousData,
    });

    return {
        signals: data?.data || [],
        totalCount: data?.count || 0,
        isLoading,
        error
    };
};