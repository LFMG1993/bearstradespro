import type {Session as SupabaseSession, User as SupabaseUser} from "@supabase/supabase-js";

export type Session = SupabaseSession;
export type User = SupabaseUser;

export interface AuthResponse {
    status: string;
    token: string;
    user: string;
    message?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}