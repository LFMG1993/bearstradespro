import {useEffect, useState} from "react";
import {Toaster} from "react-hot-toast";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Navigate} from 'react-router-dom';
import {useAuthStore} from './stores/useAuthStore';
import {AuthGuard} from './components/auth/AuthGuard';
import {SuperAdminGuard} from "./components/auth/SuperAdminGuard.tsx";
import {Analytics} from "./components/general/Analytics.tsx";
import {MainLayout} from "./components/general/MainLayout.tsx";
import HomePage from "./pages/HomePage.tsx";
import {SignalsPage} from "./pages/SignalsPage.tsx";
import {PerformancePage} from "./pages/PerformancePage.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {PrivacyPage} from "./pages/PrivacyPage.tsx";
import {RiskDisclaimerPage} from "./pages/RiskDisclaimerPage.tsx";
import {PaymentResultPage} from "./pages/PaymentResultPage.tsx";
import {ProfilePage} from "./pages/ProfilePage.tsx";
import {TradingPlanPage} from "./pages/TradingPlanPage.tsx"
import {NotificationsProvider} from "./context/NotificationsContext.tsx";
import AdminLayout from "./components/admin/general/AdminLayout.tsx";
import {AdminDashboard} from "./pages/admin/DashboardPage.tsx";
import {AdminLoginPage} from "./pages/admin/AdminLoginPage.tsx";
import {AdminUsersPage} from "./pages/admin/AdminUsersPage.tsx";
import {AdminPlansPage} from "./pages/admin/AdminPlansPage.tsx";
import {AdminSubscriptionsPage} from "./pages/admin/AdminSubscriptionsPage.tsx";

const PlaceholderPage = ({title}: { title: string }) => (
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

    const [isAdminDomain] = useState(() => {
        const hostname = window.location.hostname;
        if (hostname.startsWith('admin')) return true;
        if (import.meta.env.DEV && window.location.pathname.startsWith('/admin')) return true;
        return false;
    });

    useEffect(() => {
        initializeAuth();
    }, []);


    // 1. APLICACIÓN ADMINISTRATIVA
    if (isAdminDomain) {
        return (
            <QueryClientProvider client={queryClient}>
                <NotificationsProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Redirección raíz: Si entra al dominio admin, va al dashboard */}
                            <Route path="/" element={<Navigate to="/admin" replace />} />
                            {/* Login Administrativo */}
                            <Route path="/admin/login" element={<AdminLoginPage/>}/>
                            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
                            {/* Rutas Protegidas del Admin */}
                            <Route path="/admin" element={<SuperAdminGuard><AdminLayout/></SuperAdminGuard>}>
                                <Route index element={<AdminDashboard/>}/>
                                <Route path="users" element={<AdminUsersPage/>}/>
                                <Route path="plans" element={<AdminPlansPage/>}/>
                                <Route path="subscriptions" element={<AdminSubscriptionsPage/>}/>
                                <Route path="orgs" element={<PlaceholderPage title="Gestión de Organizaciones"/>}/>
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
    return (
        <QueryClientProvider client={queryClient}>
            <NotificationsProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Si alguien intenta entrar a /admin en la app de usuarios, lo mandamos a su dominio correcto */}
                        <Route path="/admin/*" element={<RedirectToAdmin />} />
                        <Route path="/*" element={
                            <AuthGuard>
                                <Analytics/>
                                <Routes>
                                    {/* Rutas Publícas */}
                                    <Route path="/login" element={<LoginPage/>}/>
                                    <Route path="/register" element={<RegisterPage/>}/>
                                    <Route path="/privacy" element={<PrivacyPage/>}/>
                                    <Route path="/risk-disclaimer" element={<RiskDisclaimerPage/>}/>
                                    {/* Rutas de Retorno de Pagos */}
                                    <Route path="/payment/success" element={<PaymentResultPage status="success"/>}/>
                                    <Route path="/payment/failure" element={<PaymentResultPage status="failure"/>}/>
                                    <Route path="/payment/pending" element={<PaymentResultPage status="pending"/>}/>
                                    {/* Zona de Usuario */}
                                    <Route path="/" element={<MainLayout/>}>
                                        <Route index element={<HomePage/>}/>
                                        <Route path="signals" element={<SignalsPage/>}/>
                                        <Route path="trade" element={<TradingPlanPage/>}/>
                                        <Route path="academy" element={<PlaceholderPage title="Academia"/>}/>
                                        <Route path="profile" element={<ProfilePage/>}/>
                                        <Route path="performance" element={<PerformancePage/>}/>
                                    </Route>
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
                        }/>
                    </Routes>
                </BrowserRouter>
            </NotificationsProvider>
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
    return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Redirigiendo al panel administrativo...</div>;
};

export default App
