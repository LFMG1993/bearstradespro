export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    organization_id: string;
    roles?: string[]; // Nombres de roles para facilitar UI
    phone?: string;
    trial_ends_at?: string;
    plan_type?: string;
    avatar_url?: string;
}