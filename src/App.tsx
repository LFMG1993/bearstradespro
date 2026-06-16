import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import { AuthGuard } from './components/auth/AuthGuard';
import { SuperAdminGuard } from "./components/auth/SuperAdminGuard.tsx";
import { Analytics } from "./components/general/Analytics.tsx";
import { MainLayout } from "./components/general/MainLayout.tsx";
import LandingPage from "./pages/landing/LandingPage.tsx";
import HomePage from "./pages/HomePage.tsx";
import { SignalsPage } from "./pages/SignalsPage.tsx";
import { PerformancePage } from "./pages/PerformancePage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { PrivacyPage } from "./pages/public/PrivacyPage.tsx";
import { RiskDisclaimerPage } from "./pages/public/RiskDisclaimerPage.tsx";
import { TermsAndConditionsPage } from "./pages/public/TermsAndConditionsPage.tsx";
import { PaymentResultPage } from "./pages/PaymentResultPage.tsx";
import { ProfilePage } from "./pages/ProfilePage.tsx";
import { TradingPlanPage } from "./pages/TradingPlanPage.tsx"
import { PricingPage } from "./pages/public/PricingPage.tsx";
import { CheckoutPage } from "./pages/public/CheckoutPage.tsx";
import { NotificationsProvider } from "./context/NotificationsContext.tsx";
import AdminLayout from "./components/admin/general/AdminLayout.tsx";
import { AdminDashboard } from "./pages/admin/DashboardPage.tsx";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage.tsx";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage.tsx";
import { AdminPlansPage } from "./pages/admin/AdminPlansPage.tsx";
import { AdminSubscriptionsPage } from "./pages/admin/AdminSubscriptionsPage.tsx";
import { AdminOrganizationsPage } from "./pages/admin/AdminOrganizationsPage.tsx";
import { AdminSignalsPage } from "./pages/admin/AdminSignalsPage.tsx";

const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p>Próximamente disponible</p>
    </div>
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * .30,
        },
    },
});

function App() {
    const initializeAuth = useAuthStore(state => state.initializeAuth);

    const [domainType] = useState(() => {
        const hostname = window.location.hostname;
        if (hostname.startsWith('admin')) return 'admin';
        if (hostname.startsWith('app')) return 'app';
        return 'landing';
    });

    useEffect(() => {
        initializeAuth();
    }, []);


    // 1. APLICACIÓN ADMINISTRATIVA
    if (domainType === 'admin') {
        return (
            <QueryClientProvider client={queryClient}>
                <NotificationsProvider>
                    <BrowserRouter>
                        <Analytics />
                        <Routes>
                            {/* Redirección raíz: Si entra al dominio admin, va al dashboard */}
                            <Route path="/" element={<Navigate to="/admin" replace />} />
                            {/* Login Administrativo */}
                            <Route path="/admin/login" element={<AdminLoginPage />} />
                            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                            {/* Rutas Protegidas del Admin */}
                            <Route path="/admin" element={<SuperAdminGuard><AdminLayout /></SuperAdminGuard>}>
                                <Route index element={<AdminDashboard />} />
                                <Route path="users" element={<AdminUsersPage />} />
                                <Route path="plans" element={<AdminPlansPage />} />
                                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                                <Route path="orgs" element={<AdminOrganizationsPage />} />
                                <Route path="signals" element={<AdminSignalsPage />} />
                            </Route>
                            {/* Cualquier ruta desconocida en este dominio va al login admin */}
                            <Route path="*" element={<Navigate to="/admin/login" replace />} />
                        </Routes>
                        <Toaster
                            position="top-right"
                            reverseOrder={false}
                            toastOptions={{
                                style: { background: '#333', color: '#fff' },
                            }}
                        />
                    </BrowserRouter>
                </NotificationsProvider>
            </QueryClientProvider>
        );
    }

    // APLICACIÓN DE USUARIO
    if (domainType === 'app') {
        return (
            <QueryClientProvider client={queryClient}>
                <NotificationsProvider>
                    <BrowserRouter>
                        <Analytics />
                        <Routes>
                            {/* Si alguien intenta entrar a /admin en la app de usuarios, lo mandamos a su dominio correcto */}
                            <Route path="/admin/*" element={<RedirectToAdmin />} />
                            <Route path="/*" element={
                                <AuthGuard>
                                    <Routes>
                                        {/* Rutas Publícas */}
                                        <Route path="/login" element={<LoginPage />} />
                                        <Route path="/register" element={<RegisterPage />} />
                                        <Route path="/privacy" element={<PrivacyPage />} />
                                        <Route path="/risk-disclaimer" element={<RiskDisclaimerPage />} />
                                        <Route path="/terms" element={<TermsAndConditionsPage />} />
                                        <Route path="/pricing" element={<PricingPage />} />
                                        {/* Rutas de Retorno de Pagos */}
                                        <Route path="/payment/success" element={<PaymentResultPage status="success" />} />
                                        <Route path="/payment/failure" element={<PaymentResultPage status="failure" />} />
                                        <Route path="/payment/pending" element={<PaymentResultPage status="pending" />} />
                                        {/* Zona de Usuario */}
                                        <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
                                            <Route index element={<HomePage />} />
                                            <Route path="signals" element={<SignalsPage />} />
                                            <Route path="trade" element={<TradingPlanPage />} />
                                            <Route path="academy" element={<PlaceholderPage title="Academia" />} />
                                            <Route path="profile" element={<ProfilePage />} />
                                            <Route path="performance" element={<PerformancePage />} />
                                        </Route>
                                        <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
                                    </Routes>
                                    <Toaster
                                        position="top-right"
                                        reverseOrder={false}
                                        toastOptions={{
                                            style: {
                                                background: '#333',
                                                color: '#fff',
                                            },
                                        }}
                                    />
                                </AuthGuard>
                            } />
                        </Routes>
                    </BrowserRouter>
                </NotificationsProvider>
            </QueryClientProvider>
        );
    }

    // LANDING PAGE
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Analytics />
                <Routes>
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/risk-disclaimer" element={<RiskDisclaimerPage />} />
                    <Route path="/terms" element={<TermsAndConditionsPage />} />
                    <Route path="*" element={<LandingPage />} />
                </Routes>
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                    toastOptions={{
                        style: { background: '#333', color: '#fff' },
                    }}
                />
            </BrowserRouter>
        </QueryClientProvider>
    );
}

// Componente auxiliar para redirigir al dominio de admin
const RedirectToAdmin = () => {
    useEffect(() => {
        if (import.meta.env.DEV) {
            window.location.href = 'http://admin.localhost:5173';
        } else {
            window.location.href = 'https://admin.bearstrade.org';
        }
    }, []);
    return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Redirigiendo al panel
        administrativo...</div>;
};

export default App
