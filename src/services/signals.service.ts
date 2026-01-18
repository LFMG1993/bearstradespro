import { supabase } from '../lib/supabase';
import type { Signal } from '../types';

export const fetchSignals = async (): Promise<Signal[]> => {
    const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) throw new Error(error.message);
    return data as Signal[];
};