export interface Plan {
    id: string;
    name: string;
    code: string;
    price: number; // Lo queremos como número para cálculos
    currency?: string;
    features: Record<string, any>; // Lo queremos como objeto real
    organizationId: string; // camelCase
    organizationName?: string;
    created_at: string;
}