import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, CreditCard } from 'lucide-react';
import type { Plan } from '../../types';
import { paymentService } from '../../services/payment.service';
import { publicService } from '../../services/public.service';
import { useAuthStore } from '../../stores/useAuthStore';
import { CouponSection } from "../../components/checkout/CouponSection";

export const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile } = useAuthStore();

    // Recuperamos el plan seleccionado del estado de navegación
    const plan = location.state?.plan as Plan;

    const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Obtener la TRM
    const { data: trm, isLoading: isLoadingTRM } = useQuery({
        queryKey: ['exchangeRate'],
        queryFn: publicService.getExchangeRate,
        staleTime: 1000 * 60 * 60,
    });

    if (!plan) {
        return <Navigate to="/pricing" replace />;
    }

    // Calcular total visualmente
    const calculateTotal = () => {
        if (!appliedCoupon) return plan.price;
        if (appliedCoupon.discount_type === 'percent') {
            return plan.price - (plan.price * (appliedCoupon.discount_value / 100));
        }
        return Math.max(0, plan.price - appliedCoupon.discount_value);
    };

    const finalPriceUSD = calculateTotal();
    const finalPriceCOP = trm ? Math.ceil(finalPriceUSD * trm) : 0;

    // Manejo del pago con Redirección (Preferencia)
    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const orgId = profile?.organization_id || import.meta.env.VITE_DEFAULT_ORG_ID;

            const data = await paymentService.createPreference(plan.code, orgId, appliedCoupon?.code);

            // Redirigir a Mercado Pago
            const url = data.sandbox_init_point || data.init_point;
            if (url) {
                window.location.href = url;
            }

        } catch (err: any) {
            setError(err.message || "Error al iniciar el pago");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] px-4 py-6 font-sans">
            <div className="max-w-md mx-auto">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] mb-6 transition">
                    <ArrowLeft size={20} /> Volver
                </button>

                <div className="bg-[var(--background-muted)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-[var(--border)] bg-slate-900/50">
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Resumen de tu Pedido</h2>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Detalle del Plan */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-[var(--foreground)] text-lg">{plan.name}</h3>
                                <p className="text-sm text-[var(--foreground-muted)]">{plan.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-[var(--foreground)] text-xl">USD {plan.price}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                    / {plan.interval.startsWith('month') && plan.interval_count === 1 ? 'mes' : `${plan.interval_count} meses`}
                                </p>
                                {trm && <p className="text-[10px] text-[var(--foreground-muted)]">
                                    ~ COP {Math.ceil(plan.price * trm).toLocaleString()}
                                </p>}
                            </div>
                        </div>

                        {/* Sección de Cupón */}
                        <CouponSection
                            onApply={setAppliedCoupon}
                            onRemove={() => setAppliedCoupon(null)}
                            appliedCoupon={appliedCoupon}
                            orgId={profile?.organization_id || import.meta.env.VITE_DEFAULT_ORG_ID}
                            planCode={plan.code}
                        />

                        {/* Total */}
                        <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                            <span className="text-lg font-medium text-[var(--foreground-muted)]">Total a pagar</span>
                            <div className="text-right">
                                <span className="text-3xl font-bold text-[var(--primary)]">
                                    USD {finalPriceUSD.toFixed(2)}
                                </span>
                                {trm && <p className="text-xs text-[var(--foreground-muted)]">
                                    ≈ COP {finalPriceCOP.toLocaleString()}
                                </p>}
                            </div>
                        </div>

                        {error && <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}</div>}

                        <button
                            onClick={handlePayment}
                            disabled={loading || isLoadingTRM}
                            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-[var(--primary-foreground)] py-4 rounded-xl font-bold text-lg shadow-lg shadow-[var(--primary)]/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Procesando...' : <><CreditCard size={20} /> Continuar con el Pago</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
