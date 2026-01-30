export interface AdminUser {
    id: string;
    fullName: string;
    email: string;
    organization: string;
    organizationId?: string;
    plan: string;
    planCode?: string;
    status: 'active' | 'trialing' | 'expired';
    expiresAt: string | null;
    phone?: string;
    avatar?: string;
    joinedAt: string;
}