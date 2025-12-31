import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Analytics} from "./components/general/Analytics.tsx";
import {MainLayout} from "./components/general/MainLayout.tsx";
import HomePage from "./pages/HomePage.tsx";

// Componente temporal para las páginas que aún no hemos creado
const PlaceholderPage = ({title}: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p>Próximamente disponible</p>
    </div>
);

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Analytics/>
                <Routes>
                    {/* El MainLayout envuelve a todas las rutas hijas */}
                    <Route path="/" element={<MainLayout/>}>
                        <Route index element={<HomePage/>}/>
                        <Route path="signals" element={<PlaceholderPage title="Señales"/>}/>
                        <Route path="trade" element={<PlaceholderPage title="Trading"/>}/>
                        <Route path="academy" element={<PlaceholderPage title="Academia"/>}/>
                        <Route path="profile" element={<PlaceholderPage title="Perfil"/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App
