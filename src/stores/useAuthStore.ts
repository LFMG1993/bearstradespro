import {create} from 'zustand';
import {supabase} from '../lib/supabase';
import type {UserProfile, User, Session} from '../types';

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    initialized: boolean;

    // Acciones
    initializeAuth: () => Promise<void>;
    signOut: () => Promise<void>;
    setProfile: (profile: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    profile: null,
    isLoading: true,
    initialized: false,

    initializeAuth: async () => {
        // 1. Obtener sesión actual
        const {data: {session}} = await supabase.auth.getSession();

        if (session?.user) {
            // 2. Si hay usuario, buscar su perfil extendido
            const {data: profile, error} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = 0 rows, lo cual es un estado válido si el trigger falló
                console.error("Error al obtener el perfil en el inicio:", error);
            }

            set({session, user: session.user, profile, isLoading: false, initialized: true});
        } else {
            set({session: null, user: null, profile: null, isLoading: false, initialized: true});
        }

        // 3. Escuchar cambios en tiempo real (Login/Logout en otras pestañas o providers)
        supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentSession = get().session;
            // Solo actualizamos si la sesión cambió realmente para evitar loops
            if (session?.user?.id !== currentSession?.user?.id) {
                if (session?.user) {
                    const {data: profile, error} = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (error && error.code !== 'PGRST116') {
                        console.error("Error al obtener el perfil en cambio de estado de auth:", error);
                    }

                    set({session, user: session.user, profile, isLoading: false});
                } else {
                    set({session: null, user: null, profile: null, isLoading: false});
                }
            }
        });
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({session: null, user: null, profile: null});
    },

    setProfile: (profile: UserProfile) => {
        set({profile});
    },
}));