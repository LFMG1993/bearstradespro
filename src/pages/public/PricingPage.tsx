import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Star, Zap, ArrowLeft } from 'lucide-react';
import { publicService } from '../../services/public.service';
import type { Plan } from '../../types';
import { useAuthStore } from '../../stores/useAuthStore';

export const PricingPage = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [billingCycle, setBillingCycle] = useState<number>(12);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { profile } = useAuthStore();

    // ID de la organización. Prioridad: Perfil logueado > Default Env
    const orgId = profile?.organization_id || import.meta.env.VITE_DEFAULT_ORG_ID;

    // Diccionario para traducir características técnicas a legibles
    const featureNames: Record<string, string> = {
        welltrader: "Acceso a WellTrader",
        deriv: "Conexión con Deriv",
        bridge: "Soporte Bridge Markets",
        signals: "Señales en Tiempo Real",
        academy: "Acceso a la Academia",
        support: "Soporte Prioritario"
    };

    // Lógica para calcular descuentos dinámicos basados en el plan mensual base
    const monthlyPlan = plans.find(p => p.interval_count === 1);
    const baseMonthlyPrice = monthlyPlan?.price || 0;

    const getDiscountInfo = (months: number) => {
        if (!baseMonthlyPrice) return { percent: 0, savedAmount: 0, theoreticalPrice: 0 };
        const targetPlan = plans.find(p => (p.interval === 'year' ? 12 : p.interval_count) === months);
        if (!targetPlan) return { percent: 0, savedAmount: 0, theoreticalPrice: 0 };

        const theoreticalPrice = baseMonthlyPrice * months;
        const savedAmount = theoreticalPrice - targetPlan.price;
        const percent = Math.round((savedAmount / theoreticalPrice) * 100);
        return { percent, savedAmount, theoreticalPrice };
    };

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const data = await publicService.getPlans(orgId);
                const sortedPlans = data.sort((a: Plan, b: Plan) => a.price - b.price);
                setPlans(sortedPlans);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (orgId) {
            loadPlans();
        } else {
            setError("No se pudo determinar la academia (Organización no configurada).");
            setLoading(false);
        }
    }, [orgId]);

    const handleSelectPlan = (plan: Plan) => {
        if (profile) {
            // Usuario autenticado -> Checkout directo
            navigate('/checkout', { state: { plan } });
        } else {
            // Usuario no autenticado -> Registro primero
            // Le pasamos el plan seleccionado para que RegisterPage sepa a dónde mandarlo después
            navigate('/register', { state: { plan, redirectTo: '/checkout' } });
        }
    };

    // Filtrar planes según el ciclo seleccionado
    const filteredPlans = plans.filter(p => {
        const months = p.interval === 'year' ? 12 : p.interval_count;
        return months === billingCycle;
    });

    if (loading) return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
            <div className="text-[var(--foreground-muted)] animate-pulse">Cargando planes...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
            <div className="text-rose-500 text-center">Error: {error}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--background)] px-4 py-6 font-sans">
            <div className="max-w-md mx-auto mb-6">
                <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition mb-4">
                    <ArrowLeft size={20}/> Volver
                </button>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Elige tu Plan</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">Desbloquea todo el potencial de la plataforma.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-md mx-auto mb-8">
                <div className="bg-[var(--background-muted)] p-1.5 rounded-xl border border-[var(--border)] flex items-center shadow-sm relative">
                    <button
                        onClick={() => setBillingCycle(1)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${billingCycle === 1 ? 'bg-slate-700 text-[var(--foreground)] shadow' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                    >
                        Mensual
                    </button>
                    <button
                        onClick={() => setBillingCycle(12)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 relative ${billingCycle === 12 ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md scale-105 z-10' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                    >
                        Anual
                        {/* Badge de descuento */}
                        {getDiscountInfo(12).percent > 0 && (
                            <span className="absolute -top-2 -right-2 bg-emerald-500 text-[var(--primary-foreground)] text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">
                                -{getDiscountInfo(12).percent}%
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setBillingCycle(6)}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 relative ${billingCycle === 6 ? 'bg-slate-700 text-[var(--foreground)] shadow' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                    >
                        Semestral
                        {getDiscountInfo(6).percent > 0 && (
                            <span className="absolute -top-2 -right-2 bg-emerald-500 text-[var(--primary-foreground)] text-[9px] px-1.5 py-0.5 rounded-full shadow-sm">
                                -{getDiscountInfo(6).percent}%
                            </span>
                        )}
                    </button>
                </div>
            </div>

            { /* Planes */}
            <div className="max-w-md mx-auto space-y-6 pb-12">
                {filteredPlans.length === 0 ? (
                    <div className="text-center py-12 text-[var(--foreground-muted)] bg-[var(--background-muted)] rounded-2xl border border-[var(--border)] border-dashed">
                        No hay planes disponibles para este ciclo.
                    </div>
                ) : filteredPlans.map((plan) => {
                    const rawFeatures = (plan.features as any)?.access || [];
                    const featuresList = rawFeatures.length > 0
                        ? rawFeatures.map((f: string) => featureNames[f] || f)
                        : ['Acceso a la academia', 'Señales en vivo', 'Gestión de Riesgo'];

                    const isPro = plan.code.toLowerCase().includes('pro') || plan.code.toLowerCase().includes('premium');
                    const isLongTerm = plan.interval_count > 1;
                    const isBestValue = isPro && isLongTerm;
                    const monthlyEquivalent = plan.price / plan.interval_count;
                    const theoreticalFullPrice = baseMonthlyPrice * plan.interval_count;
                    const savings = theoreticalFullPrice - plan.price;

                    return (
                        <div
                            key={plan.id}
                            className={`relative bg-[var(--background-muted)] rounded-2xl p-6 border flex flex-col transition-transform active:scale-[0.98] 
                                 ${isBestValue ? 'border-[var(--primary)] shadow-xl shadow-[var(--primary)]/20 scale-105 z-10' : 'border-[var(--border)]'}
                             `}
                        >
                            {isBestValue && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Star size={12} fill="currentColor"/> Mejor Valor
                                </div>
                            )}
                            {!isBestValue && plan.code.includes('super') && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-[var(--primary-foreground)] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    <Zap size={12} fill="currentColor"/> Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    {isLongTerm && savings > 0 && (
                                        <span className="text-sm text-[var(--foreground-muted)] line-through decoration-[var(--foreground-muted)] decoration-2 mr-1">
                                             ${theoreticalFullPrice}
                                         </span>
                                    )}
                                    <span className="text-3xl font-bold text-[var(--foreground)]">${plan.price}</span>
                                    <span className="text-sm text-[var(--foreground-muted)]">
                                        / {plan.interval.startsWith('month') && plan.interval_count === 1 ? 'mes' : `${plan.interval_count} meses`}
                                    </span>
                                </div>
                                {isLongTerm && (
                                    <div className="mt-2 flex flex-col gap-1">
                                        <p className="text-xs text-[var(--foreground-muted)]">
                                            Equivale a <span className="font-bold text-[var(--foreground)]">${monthlyEquivalent.toFixed(2)} / mes</span>
                                        </p>
                                        {savings > 0 && (
                                            <p className="text-xs font-bold text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-lg self-start">
                                                Ahorras ${savings.toFixed(0)} USD
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6 flex-1">
                                {featuresList.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                                        <Check size={16} className="text-[var(--primary)] shrink-0 mt-0.5"/>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button onClick={() => handleSelectPlan(plan)}
                                    className={`w-full py-3 rounded-xl font-bold transition ${isBestValue || plan.code.includes('super') ? 'bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--primary-foreground)]' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                                Seleccionar Plan
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
