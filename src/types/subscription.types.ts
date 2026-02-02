export interface Subscription {
    user_id: string;
    user_full_name: string;
    user_email: string;
    user_avatar?: string;
    plan_name: string;
    plan_code: string;
    organization_name: string;
    status: 'active' | 'trialing' | 'expired' | 'canceled' | 'past_due';
    payment_provider: 'mercadopago' | 'manual' | 'system';
    current_period_end: string | null;
    trial_ends_at: string | null;
    created_at: string;
    external_id?: string;
}