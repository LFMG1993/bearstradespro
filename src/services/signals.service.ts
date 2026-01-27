import { supabase } from '../lib/supabase';
import type { Signal } from '../types';

export const createSignal = async (signal: Partial<Signal>) => {
    const { data, error } = await supabase
        .from('signals')
        .insert(signal)
        .select()
        .single();

    if (error) {
        // Si RLS bloquea la inserción, Supabase devuelve un error específico
        if (error.code === '42501') { // Código Postgres para permisos insuficientes
            throw new Error('No tienes permisos para realizar esta acción (Bloqueado por seguridad).');
        }
        throw new Error(error.message);
    }
    return data;
};

export const fetchSignals = async (): Promise<Signal[]> => {
    const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

    if (error) throw new Error(error.message);
    return data as Signal[];
};

// Nueva función para paginación eficiente en el servidor
export const fetchSignalsByMonth = async (date: Date): Promise<Signal[]> => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    // Primer día del mes seleccionado
    const startDate = new Date(year, month, 1).toISOString();
    // Último día del mes seleccionado (truco: día 0 del mes siguiente)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
        .from('signals')
        .select('*')
        .gte('created_at', startDate) // gte = Greater Than or Equal
        .lte('created_at', endDate)   // lte = Less Than or Equal
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Signal[];
};

// Nueva función para paginación eficiente en el servidor
export const fetchSignalsPaginated = async (page: number, pageSize: number): Promise<{ data: Signal[], count: number }> => {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from('signals')
        .select('*', { count: 'exact' }) // Solicitamos el conteo total real
        .order('created_at', { ascending: false })
        .range(from, to); // Supabase solo devuelve este rango

    if (error) throw new Error(error.message);
    return { data: data as Signal[], count: count || 0 };
};