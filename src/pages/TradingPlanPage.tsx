import React, {useEffect, useState, useMemo} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    Save, TrendingUp, AlertTriangle, Target,
    Wallet, ArrowRight, ShieldCheck, Loader2,
    Activity, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import type {UpdatePlanInput} from "../types";
import {tradingPlanService} from '../services/tradingPlan.service';
import {journalService} from '../services/journal.service';
import type {UserTrade} from "../types";
import toast from 'react-hot-toast';

type PlanFormState = Record<keyof UpdatePlanInput, string>;

export const TradingPlanPage = () => {
    const queryClient = useQueryClient();

    // --- 1. LÓGICA DE GESTIÓN DE RIESGO (PARTE SUPERIOR) ---
    const [formData, setFormData] = useState<PlanFormState>({
        initial_capital: '1000',
        risk_per_trade: '1',
        risk_reward_ratio: '2',
        withdrawal_percentage: '30'
    });

    const {data: serverPlan, isLoading: isLoadingPlan} = useQuery({
        queryKey: ['tradingPlan'],
        queryFn: tradingPlanService.getPlan,
    });

    useEffect(() => {
        if (serverPlan) {
            setFormData({
                initial_capital: serverPlan.initial_capital?.toString() || '',
                risk_per_trade: serverPlan.risk_per_trade?.toString() || '',
                risk_reward_ratio: serverPlan.risk_reward_ratio?.toString() || '',
                withdrawal_percentage: serverPlan.withdrawal_percentage?.toString() || ''
            });
        }
    }, [serverPlan]);

    const mutation = useMutation({
        mutationFn: tradingPlanService.savePlan,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tradingPlan']});
            toast.success('Plan de trading actualizado');
        },
        onError: (err) => {
            toast.error('Error al guardar el plan');
            console.error(err);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSave = () => {
        mutation.mutate({
            initial_capital: parseFloat(formData.initial_capital) || 0,
            risk_per_trade: parseFloat(formData.risk_per_trade) || 0,
            risk_reward_ratio: parseFloat(formData.risk_reward_ratio) || 0,
            withdrawal_percentage: parseFloat(formData.withdrawal_percentage) || 0
        });
    };

    // Cálculos Matemáticos (Para las tarjetas)
    const capital = parseFloat(formData.initial_capital) || 0;
    const riskPercent = parseFloat(formData.risk_per_trade) || 0;
    const riskAmount = capital * (riskPercent / 100);
    const rewardRatio = parseFloat(formData.risk_reward_ratio) || 0;
    const potentialProfit = riskAmount * rewardRatio;
    const withdrawalPercent = parseFloat(formData.withdrawal_percentage) || 0;
    const withdrawalAmount = potentialProfit * (withdrawalPercent / 100);
    const growthAmount = potentialProfit - withdrawalAmount;


    // --- 2. LÓGICA DE LA BITÁCORA CON TANSTACK TABLE (PARTE INFERIOR) ---

    // Query de Trades
    const {data: myTrades = [], isLoading: isLoadingTrades} = useQuery({
        queryKey: ['myTrades'],
        queryFn: journalService.getMyTrades
    });

    // Calcular P&L Total (Mantenemos tu lógica)
    const totalPnL = useMemo(() => myTrades.reduce((acc, trade) => {
        if (trade.signal.status === 'WON') return acc + trade.reward_amount;
        if (trade.signal.status === 'LOST') return acc - trade.risk_amount;
        return acc;
    }, 0), [myTrades]);

    // Definición de Columnas para TanStack Table
    const columnHelper = createColumnHelper<UserTrade>();

    const columns = useMemo(() => [
        columnHelper.accessor('created_at', {
            header: 'Fecha',
            cell: info => (
                <div>
                    <div className="font-medium text-gray-300">{new Date(info.getValue()).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(info.getValue()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
            )
        }),
        columnHelper.accessor('signal.symbol', {
            header: 'Operación',
            cell: info => (
                <div>
                    <span className="font-bold text-white block">{info.getValue()}</span>
                    <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${info.row.original.signal.signal_type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {info.row.original.signal.signal_type}
                    </span>
                </div>
            )
        }),
        columnHelper.accessor('signal.status', {
            header: 'Estado',
            cell: info => {
                const status = info.getValue();
                if (status === 'WON') return <span
                    className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full w-fit"><CheckCircle2
                    size={12}/> GANADA</span>;
                if (status === 'LOST') return <span
                    className="flex items-center gap-1 text-rose-400 text-xs font-bold bg-rose-500/10 px-2 py-1 rounded-full w-fit"><XCircle
                    size={12}/> PERDIDA</span>;
                return <span
                    className="flex items-center gap-1 text-blue-400 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-full w-fit"><Clock
                    size={12}/> ACTIVA</span>;
            }
        }),
        columnHelper.accessor('risk_amount', {
            header: () => <div className="text-right">Riesgo</div>,
            cell: info => <div className="text-right font-mono text-gray-400">${info.getValue().toFixed(2)}</div>
        }),
        columnHelper.display({
            id: 'result',
            header: () => <div className="text-right">Resultado</div>,
            cell: info => {
                const status = info.row.original.signal.status;
                const risk = info.row.original.risk_amount;
                const reward = info.row.original.reward_amount;

                if (status === 'ACTIVE') return <div className="text-right text-gray-500 text-xs">En curso...</div>;

                const pnl = status === 'WON' ? reward : -risk;
                const color = pnl >= 0 ? 'text-emerald-400' : 'text-rose-400';

                return <div
                    className={`text-right font-bold font-mono text-lg ${color}`}>{pnl > 0 ? '+' : ''}${pnl.toFixed(2)}</div>;
            }
        })
    ], []);

    const table = useReactTable({
        data: myTrades,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {pageSize: 5} // Mostrar 5 filas por página
        }
    });

    if (isLoadingPlan) return <div className="flex justify-center p-10"><Loader2
        className="animate-spin text-emerald-500"/></div>;

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 pb-20">

            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400"/>
                        Gestión de Riesgo
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                        Define tus reglas inquebrantables.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                    {mutation.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                    <span>Guardar Reglas</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* 1. CONFIGURACIÓN (IZQUIERDA) - INTACTO */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                            <Target size={20} className="text-emerald-400"/> Parámetros de Cuenta
                        </h3>

                        <div className="space-y-5">
                            <div className="group">
                                <label
                                    className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Capital
                                    Actual ($)</label>
                                <div className="relative">
                                    <span
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        name="initial_capital"
                                        value={formData.initial_capital}
                                        onChange={handleChange}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-8 pr-4 text-white font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition group-hover:border-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label
                                        className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Riesgo
                                        (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            name="risk_per_trade"
                                            value={formData.risk_per_trade}
                                            onChange={handleChange}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 px-4 text-white font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                        />
                                        <span
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Ratio
                                        (1:X)</label>
                                    <div className="relative">
                                        <span
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">1:</span>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            name="risk_reward_ratio"
                                            value={formData.risk_reward_ratio}
                                            onChange={handleChange}
                                            className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 pl-8 pr-4 text-white font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-700">
                                <label
                                    className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Plan
                                    de Retiro (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        name="withdrawal_percentage"
                                        value={formData.withdrawal_percentage}
                                        onChange={handleChange}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-xl py-3 px-4 text-white font-mono text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                                    />
                                    <span
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TABLERO DE COMANDO (DERECHA) - INTACTO (Tarjetas que pediste mantener) */}
                <div className="lg:col-span-7 space-y-4">

                    {/* TARJETA PRINCIPAL: EL PRÓXIMO TRADE */}
                    <div
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp size={100} className="text-white"/>
                        </div>

                        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-6 relative z-10">Tu
                            Próxima Operación</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                            {/* RIESGO */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-rose-400 mb-1">
                                    <AlertTriangle size={16}/>
                                    <span className="text-xs font-bold uppercase">Riesgo Máximo</span>
                                </div>
                                <div className="text-4xl font-black text-white">
                                    ${riskAmount.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                </div>
                                <p className="text-xs text-gray-500">Si pierdes, pierdes esto.</p>
                            </div>

                            {/* BENEFICIO */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                    <Target size={16}/>
                                    <span className="text-xs font-bold uppercase">Ganancia Objetivo</span>
                                </div>
                                <div className="text-4xl font-black text-emerald-400">
                                    ${potentialProfit.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                </div>
                                <p className="text-xs text-gray-500">Meta por operación (TP).</p>
                            </div>
                        </div>
                    </div>

                    {/* TARJETA DE DISTRIBUCIÓN DE GANANCIAS */}
                    <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-300">Distribución de una Ganancia</h3>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg font-bold">Escenario WIN</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-gray-900/50 p-4 rounded-xl border border-emerald-500/20">
                                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                    <TrendingUp size={18}/>
                                    <span className="text-xs font-bold">CRECIMIENTO CUENTA</span>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    +${growthAmount.toLocaleString('en-US', {maximumFractionDigits: 0})}
                                </div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
                                    <div className="bg-emerald-500 h-1.5 rounded-full"
                                         style={{width: `${100 - withdrawalPercent}%`}}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center text-gray-600">
                                <ArrowRight size={20} className="hidden sm:block"/>
                            </div>

                            <div className="flex-1 bg-gray-900/50 p-4 rounded-xl border border-indigo-500/20">
                                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                    <Wallet size={18}/>
                                    <span className="text-xs font-bold">PARA RETIRAR (Bolsillo)</span>
                                </div>
                                <div className="text-2xl font-bold text-white">
                                    ${withdrawalAmount.toLocaleString('en-US', {maximumFractionDigits: 0})}
                                </div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
                                    <div className="bg-indigo-500 h-1.5 rounded-full"
                                         style={{width: `${withdrawalPercent}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEPARADOR */}
            <div className="border-t border-gray-700 my-8"></div>

            {/* --- SECCIÓN NUEVA: BITÁCORA CON TANSTACK TABLE --- */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-indigo-400"/>
                        Bitácora de Ejecución
                    </h2>

                    {/* Resumen Rápido */}
                    <div
                        className={`px-4 py-2 rounded-xl font-bold font-mono text-lg border w-fit ${totalPnL >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                        Total: {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-700">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                            {isLoadingTrades ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8">Cargando historial...</td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">Aún no has tomado ninguna
                                        señal. Ve al panel de señales y opera.
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-700/30 transition">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN DE TANSTACK */}
                    {table.getRowModel().rows.length > 0 && (
                        <div
                            className="flex items-center justify-between px-6 py-4 bg-gray-900/30 border-t border-gray-700">
                            <span className="text-xs text-gray-500">
                                Pág {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={16} className="text-white"/>
                                </button>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={16} className="text-white"/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};