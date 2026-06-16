export interface Plan {
    id: string;
    name: string;
    code: string;
    description?: string;
    price: number;
    currency?: string;
    interval: string;
    interval_count: number;
    features: Record<string, any>;
    organizationId: string;
    organizationName?: string;
    created_at: string;
}