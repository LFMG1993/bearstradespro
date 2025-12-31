import api from '../api/axios';
import type { AuthResponse, LoginCredentials } from '../types';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        // POST /api/login
        const { data } = await api.post<AuthResponse>('/login', credentials);

        // Si el login es exitoso, guardamos el token
        if (data.status === 'success' && data.token) {
            localStorage.setItem('token', data.token);
            // Opcional: Guardar info del usuario
            localStorage.setItem('user', data.user);
        }

        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};