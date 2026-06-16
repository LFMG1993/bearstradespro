import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Tag, ShieldCheck } from 'lucide-react';
import { publicService } from '../../services/public.service';

interface CouponSectionProps {
    onApply: (coupon: any) => void;
    onRemove: () => void;
    appliedCoupon: any | null;
    orgId: string;
    planCode: string;
}

export const CouponSection = ({ onApply, onRemove, appliedCoupon, orgId, planCode }: CouponSectionProps) => {
    const [code, setCode] = useState('');

    const couponMutation = useMutation({
        mutationFn: (c: string) => publicService.validateCoupon(c, orgId, planCode),
        onSuccess: (data) => {
            onApply(data);
        }
    });

    const handleApply = () => {
        if (!code.trim()) return;
        couponMutation.mutate(code);
    };

    return (
        <div className="bg-[var(--background-muted)]/50 p-4 rounded-xl border border-[var(--border)]">
            <label className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                <Tag size={16}/> Código de descuento
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="EJ: BEARS2024"
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--foreground-muted)] w-full"
                    disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                    <button onClick={() => { onRemove(); setCode(''); couponMutation.reset(); }} className="text-rose-500 text-sm font-medium px-3 py-2 hover:bg-rose-500/10 rounded-lg w-full sm:w-auto">Quitar</button>
                ) : (
                    <button onClick={handleApply} disabled={couponMutation.isPending || !code} className="bg-[var(--background-muted)] hover:bg-[var(--border)] text-[var(--foreground)] px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 w-full sm:w-auto">
                        {couponMutation.isPending ? '...' : 'Aplicar'}
                    </button>
                )}
            </div>
            {couponMutation.isError && <p className="text-rose-500 text-xs mt-2">{couponMutation.error.message || "Cupón inválido"}</p>}
            {appliedCoupon && <p className="text-[var(--primary)] text-xs mt-2 flex items-center gap-1"><ShieldCheck size={12}/> Cupón aplicado</p>}
        </div>
    );
};
