export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    default_trial_days: number;
    owner_id?: string;
    created_at?: string;
    updated_at?: string;
    mp_access_token?: string;
    mp_public_key?: string;
    mp_webhook_secret?: string;
    resend_api_key?: string;
    resend_from_email?: string;
    default_plan_code?: string;
    youtube_channel_id?: string;
}

export interface CreateOrganizationInput {
    name: string;
    slug: string;
    logo_url?: string;
    default_trial_days?: number;
    owner_id?: string;
    mp_access_token?: string;
    mp_public_key?: string;
    mp_webhook_secret?: string;
    resend_api_key?: string;
    resend_from_email?: string;
    default_plan_code: string;
    youtube_channel_id?: string;
}

export interface UpdateOrganizationInput {
    name?: string;
    slug?: string;
    logo_url?: string;
    default_trial_days?: number;
    owner_id?: string;
    mp_access_token?: string;
    mp_public_key?: string;
    mp_webhook_secret?: string;
    resend_api_key?: string;
    resend_from_email?: string;
    default_plan_code?: string;
    youtube_channel_id?: string;
}