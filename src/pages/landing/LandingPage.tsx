import { useState } from 'react';
import { LandingHeader } from '../../components/landing/LandingHeader';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { SEO } from '../../components/general/SEO';
import { ShieldCheck, BarChart, GraduationCap, Zap, ChevronDown, ChevronUp, Users, Wallet, TrendingUp, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
    const { t } = useTranslation();
    const appUrl = import.meta.env.DEV ? 'http://app.localhost:5173' : 'https://app.bearstrade.org';
    return (
        <section className="relative text-[var(--foreground)] text-center py-40 px-4 bg-[var(--background-muted)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] to-[var(--background-muted)] opacity-90"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 container mx-auto">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                    {t('landing.hero.title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-emerald-300">{t('landing.hero.title_highlight')}</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--foreground-muted)] mb-10 leading-relaxed">
                    {t('landing.hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <a href={`${appUrl}/register`}
                        className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary)] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-lg">
                        {t('landing.hero.cta')}
                    </a>
                </div>
            </div>
        </section>
    );
};

const FeaturesSection = () => {
    const { t } = useTranslation();
    const features = [
        { icon: Zap, title: t('landing.features.signals_title'), description: t('landing.features.signals_desc') },
        { icon: ShieldCheck, title: t('landing.features.risk_title'), description: t('landing.features.risk_desc') },
        { icon: BarChart, title: t('landing.features.kardex_title'), description: t('landing.features.kardex_desc') },
        { icon: GraduationCap, title: t('landing.features.academy_title'), description: t('landing.features.academy_desc') },
    ];

    return (
        <section className="py-24 px-4 bg-[var(--background)]">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">{t('landing.features.title')}</h2>
                    <div className="w-24 h-1 bg-[var(--primary)] mx-auto rounded-full"></div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-[var(--background-muted)] p-8 rounded-2xl border border-[var(--border)] text-center hover:-translate-y-2 transition-transform duration-300 shadow-xl shadow-black/5">
                            <div className="w-16 h-16 mx-auto bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-6">
                                <feature.icon className="h-8 w-8 text-[var(--primary)]" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">{feature.title}</h3>
                            <p className="text-[var(--foreground-muted)] text-sm leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const AIBeginnerSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 px-4 bg-[var(--background)] relative overflow-hidden">
            {/* Elemento de diseño de fondo para IA */}
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[var(--primary)]/5 to-transparent pointer-events-none"></div>
            
            <div className="container mx-auto">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 relative">
                        {/* Gráfico decorativo de IA / Principiantes */}
                        <div className="relative w-full max-w-md mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-[var(--primary)] rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
                            <div className="bg-[var(--background-muted)] rounded-2xl border border-[var(--border)] shadow-2xl p-6 relative z-10 backdrop-blur-sm">
                                <div className="flex items-center gap-4 mb-6 border-b border-[var(--border)] pb-4">
                                    <div className="w-12 h-12 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                        <Zap className="text-[var(--primary)] w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-[var(--foreground-muted)]">Asistente IA BearsTrades</div>
                                        <div className="font-bold text-[var(--foreground)]">Señal Validada</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                                        <span className="text-[var(--foreground-muted)] text-sm">Par de Divisas</span>
                                        <span className="font-bold text-[var(--foreground)]">EUR/USD</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                                        <span className="text-[var(--foreground-muted)] text-sm">Probabilidad Éxito</span>
                                        <span className="font-bold text-emerald-500">87%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-[var(--background)] p-3 rounded-xl border border-[var(--border)]">
                                        <span className="text-[var(--foreground-muted)] text-sm">Riesgo Sugerido</span>
                                        <span className="font-bold text-rose-400">1.00%</span>
                                    </div>
                                </div>
                                <button className="w-full mt-6 bg-[var(--primary)] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition">
                                    Copiar y Ejecutar
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="lg:w-1/2">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold text-sm mb-6 border border-blue-500/20">
                            {t('landing.ai_beginner.badge')}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-6 leading-tight">
                            {t('landing.ai_beginner.title')}
                        </h2>
                        <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed">
                            {t('landing.ai_beginner.subtitle')}
                        </p>
                        <div className="space-y-6">
                            {[
                                { icon: Zap, title: t('landing.ai_beginner.point1_title'), desc: t('landing.ai_beginner.point1_desc') },
                                { icon: ShieldCheck, title: t('landing.ai_beginner.point2_title'), desc: t('landing.ai_beginner.point2_desc') },
                                { icon: GraduationCap, title: t('landing.ai_beginner.point3_title'), desc: t('landing.ai_beginner.point3_desc') }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[var(--foreground)]">{item.title}</h4>
                                        <p className="text-[var(--foreground-muted)]">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const B2BSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 px-4 bg-[var(--background-muted)] border-y border-[var(--border)] relative overflow-hidden">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold text-sm mb-6 border border-[var(--primary)]/20">
                            Software B2B
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-6 leading-tight">
                            {t('landing.b2b.title')}
                        </h2>
                        <p className="text-lg text-[var(--foreground-muted)] mb-8 leading-relaxed">
                            {t('landing.b2b.subtitle')}
                        </p>
                        <div className="space-y-6">
                            {[
                                { icon: Settings, title: t('landing.b2b.point1_title'), desc: t('landing.b2b.point1_desc') },
                                { icon: Wallet, title: t('landing.b2b.point2_title'), desc: t('landing.b2b.point2_desc') },
                                { icon: Users, title: t('landing.b2b.point3_title'), desc: t('landing.b2b.point3_desc') }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-[var(--primary)]" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-[var(--foreground)]">{item.title}</h4>
                                        <p className="text-[var(--foreground-muted)]">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:w-1/2 relative">
                        {/* Gráfico decorativo de Dashboard B2B */}
                        <div className="bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
                                <div className="font-bold text-[var(--foreground)]">Panel Administrativo</div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-20 rounded-xl bg-gradient-to-r from-[var(--primary)]/20 to-blue-500/20 border border-[var(--border)]"></div>
                                <div className="flex gap-4">
                                    <div className="h-32 w-1/2 rounded-xl bg-[var(--background-muted)] border border-[var(--border)]"></div>
                                    <div className="h-32 w-1/2 rounded-xl bg-[var(--background-muted)] border border-[var(--border)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const B2CSection = () => {
    const { t } = useTranslation();
    return (
        <section className="py-24 px-4 bg-[var(--background)]">
            <div className="container mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-6">
                        {t('landing.b2c.title')}
                    </h2>
                    <p className="text-lg text-[var(--foreground-muted)]">
                        {t('landing.b2c.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { val: t('landing.b2c.stat1_value'), label: t('landing.b2c.stat1_label'), icon: ShieldCheck },
                        { val: t('landing.b2c.stat2_value'), label: t('landing.b2c.stat2_label'), icon: TrendingUp },
                        { val: t('landing.b2c.stat3_value'), label: t('landing.b2c.stat3_label'), icon: BarChart }
                    ].map((stat, i) => (
                        <div key={i} className="bg-[var(--background-muted)] rounded-3xl p-8 text-center border border-[var(--border)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <stat.icon className="w-12 h-12 mx-auto text-[var(--primary)] mb-6" />
                            <div className="text-5xl font-black text-[var(--foreground)] mb-4">{stat.val}</div>
                            <p className="text-[var(--foreground-muted)] font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQSection = () => {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = Array.from({ length: 10 }).map((_, i) => ({
        q: t(`landing.faq.q${i + 1}`),
        a: t(`landing.faq.a${i + 1}`)
    }));

    // FAQ Schema Generation para SEO
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <section className="py-24 px-4 bg-[var(--background-muted)] border-t border-[var(--border)]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">{t('landing.faq.title')}</h2>
                    <div className="w-24 h-1 bg-[var(--primary)] mx-auto rounded-full"></div>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300">
                            <button
                                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            >
                                <span className="font-bold text-[var(--foreground)] pr-8">{faq.q}</span>
                                {openIndex === idx ? (
                                    <ChevronUp className="w-5 h-5 text-[var(--primary)] shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-[var(--foreground-muted)] shrink-0" />
                                )}
                            </button>
                            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <p className="text-[var(--foreground-muted)] leading-relaxed">{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingPage = () => {
    const { t } = useTranslation();

    const faqs = Array.from({ length: 10 }).map((_, i) => ({
        q: t(`landing.faq.q${i + 1}`),
        a: t(`landing.faq.a${i + 1}`)
    }));

    const customSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <div className="bg-[var(--background)] min-h-screen">
            <SEO
                title="Plataforma de Señales de Trading y Educación Financiera"
                description="Bears Trades Pro: La solución tecnológica definitiva para Traders y Academias. Gestión de riesgo, señales de forex e índices sintéticos, cobros automatizados y más."
                customSchema={customSchema}
            />
            <LandingHeader />
            <main>
                <HeroSection />
                <FeaturesSection />
                <AIBeginnerSection />
                <B2BSection />
                <B2CSection />
                <FAQSection />
            </main>
            <LandingFooter />
        </div>
    );
};

export default LandingPage;