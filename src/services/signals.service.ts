import api from '../api/axios';
import type { Signal } from '../types';

export const signalsService = {
    getAll: async (): Promise<Signal[]> => {
        const { data } = await api.get<Signal[]>('/signals');
        return data;
    }
};