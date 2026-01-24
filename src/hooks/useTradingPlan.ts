import { useQuery } from '@tanstack/react-query';
import { tradingPlanService } from '../services/tradingPlan.service';

export const useTradingPlan = () => {
    const query = useQuery({
        queryKey: ['tradingPlan'],
        queryFn: tradingPlanService.getPlan,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché para no saturar
    });

    const plan = query.data;

    // Calculamos valores derivados aquí para usarlos fácil
    const capital = plan?.initial_capital || 0;
    const riskPercent = plan?.risk_per_trade || 0;
    const riskAmount = capital * (riskPercent / 100);
    const rewardRatio = plan?.risk_reward_ratio || 0;
    const rewardAmount = riskAmount * rewardRatio;

    return {
        ...query,
        plan,
        calculations: {
            riskAmount,
            rewardAmount
        }
    };
};