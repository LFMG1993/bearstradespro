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