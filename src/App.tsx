import {useEffect} from "react";
import {Toaster} from "react-hot-toast";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useAuthStore} from './stores/useAuthStore';
import {AuthGuard} from './components/auth/AuthGuard';
import {Analytics} from "./components/general/Analytics.tsx";
import {MainLayout} from "./components/general/MainLayout.tsx";
import HomePage from "./pages/HomePage.tsx";
import {SignalsPage} from "./pages/SignalsPage.tsx";
import {PerformancePage} from "./pages/PerformancePage.tsx";
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {PrivacyPage} from "./pages/PrivacyPage.tsx";
import {RiskDisclaimerPage} from "./pages/RiskDisclaimerPage.tsx";
import {ProfilePage} from "./pages/ProfilePage.tsx";
import {TradingPlanPage} from "./pages/TradingPlanPage.tsx"
import {NotificationsProvider} from "./context/NotificationsContext.tsx";

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
            // Si falla una petición, reintentar solo 1 vez
            retry: 1,
            // Mantener datos en caché por 5 minutos antes de considerarlos "viejos"
            staleTime: 1000 * 60 * 5,
        },
    },
});

function App() {
    const initializeAuth = useAuthStore(state => state.initializeAuth);

    useEffect(() => {
        initializeAuth();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <NotificationsProvider>
                <BrowserRouter>
                    <AuthGuard>
                        <Analytics/>
                        <Routes>
                            <Route path="/login" element={<LoginPage/>}/>
                            <Route path="/register" element={<RegisterPage/>}/>
                            <Route path="/privacy" element={<PrivacyPage/>}/>
                            <Route path="/risk-disclaimer" element={<RiskDisclaimerPage/>}/>
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
                </BrowserRouter>
            </NotificationsProvider>
        </QueryClientProvider>
    );
}

export default App
