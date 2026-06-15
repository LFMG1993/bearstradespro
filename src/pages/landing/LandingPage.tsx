import {LandingHeader} from '../../components/landing/LandingHeader';
import {LandingFooter} from '../../components/landing/LandingFooter';
import {SEO} from '../../components/general/SEO';
import {ShieldCheck, BarChart, GraduationCap, Zap} from 'lucide-react';

const HeroSection = () => {
    const appUrl = import.meta.env.DEV ? 'http://app.localhost:5173' : 'https://app.bearstrade.org';
    return (
        <section
            className="relative text-[var(--foreground)] text-center py-40 px-4 bg-[var(--background-muted)] overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10 container mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                    Opera con la <span className="text-[var(--primary)]">Precisión de un Profesional</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--foreground-muted)] mb-8">
                    Recibe señales de trading en tiempo real, gestiona tu riesgo y eleva tu operativa al siguiente nivel
                    con nuestra plataforma todo en uno.
                </p>
                <a href={`${appUrl}/register`}
                   className="bg-[var(--primary)] hover:opacity-90 text-white font-bold py-4 px-10 rounded-lg transition text-lg shadow-lg shadow-emerald-500/20">
                    Comienza tu Prueba Gratis
                </a>
            </div>
        </section>
    );
};

const FeaturesSection = () => {
    const features = [
        {
            icon: Zap,
            title: "Señales en Tiempo Real",
            description: "Recibe notificaciones push instantáneas con puntos de entrada y salida claros."
        },
        {
            icon: ShieldCheck,
            title: "Gestión de Riesgo",
            description: "Calcula tu lotaje y gestiona tu plan de trading de forma automática."
        },
        {
            icon: BarChart,
            title: "Análisis de Rendimiento",
            description: "Audita tu progreso con estadísticas detalladas y transparentes."
        },
        {
            icon: GraduationCap,
            title: "Academia Integrada",
            description: "Aprende desde cero con nuestro contenido educativo exclusivo para miembros."
        },
    ];

    return (
        <section className="py-20 px-4 bg-[var(--background)]">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map(feature => (
                        <div key={feature.title} className="bg-[var(--background-muted)] p-6 rounded-xl border border-[var(--border)] text-center">
                            <feature.icon className="mx-auto h-12 w-12 text-[var(--primary)] mb-4" />
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{feature.title}</h3>
                            <p className="text-[var(--foreground-muted)] text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingPage = () => {
    return (
        <div className="bg-[var(--background)] min-h-screen">
            <SEO
                title="Plataforma de Señales de Trading y Educación Financiera"
                description="Únete a Bears Trades Pro y recibe señales de trading en tiempo real, gestiona tu riesgo y accede a nuestra academia. Comienza tu prueba gratis."
            />
            <LandingHeader/>
            <main>
                <HeroSection/>
                <FeaturesSection/>
            </main>
            <LandingFooter/>
        </div>
    );
};

export default LandingPage;