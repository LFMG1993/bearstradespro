import { useState, useMemo } from 'react';
import { adminService } from '../../services/admin.service';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, DollarSign, Activity, Filter, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';

const columnHelper = createColumnHelper<any>();

export const AdminSignalsPage = () => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        orgId: 'all',
        symbol: ''
    });

    const [activeDateTab, setActiveDateTab] = useState('global');

    const { data: organizations = [] } = useQuery({
        queryKey: ['admin-organizations'],
        queryFn: () => adminService.getOrganizations()
    });

    const { data: symbols = [] } = useQuery({
        queryKey: ['admin-symbols'],
        queryFn: () => adminService.getSymbols()
    });

    const { data: signals = [], isLoading, isFetching } = useQuery({
        queryKey: ['admin-signals', filters],
        queryFn: () => adminService.getSignals(filters),
        placeholderData: keepPreviousData
    });

    const handleQuickDate = (type: string) => {
        setActiveDateTab(type);
        const today = new Date();
        const endStr = format(today, 'yyyy-MM-dd');
        let startStr = '';

        switch (type) {
            case 'ayer':
                startStr = format(subDays(today, 1), 'yyyy-MM-dd');
                break;
            case '1w':
                startStr = format(subDays(today, 7), 'yyyy-MM-dd');
                break;
            case '1m':
                startStr = format(subMonths(today, 1), 'yyyy-MM-dd');
                break;
            case '3m':
                startStr = format(subMonths(today, 3), 'yyyy-MM-dd');
                break;
            case '1y':
                startStr = format(subYears(today, 1), 'yyyy-MM-dd');
                break;
            case 'global':
            default:
                setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
                return;
        }

        setFilters(prev => ({ ...prev, startDate: startStr, endDate: endStr }));
    };

    const handleManualDateChange = (field: 'startDate' | 'endDate', value: string) => {
        setActiveDateTab('custom');
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // METRICS CALCULATION
    const metrics = useMemo(() => {
        const totalSignals = signals.length;
        const wonSignals = signals.filter(s => s.status === 'WON').length;
        const lostSignals = signals.filter(s => s.status === 'LOST').length;
        const winRate = totalSignals > 0 ? ((wonSignals / (wonSignals + lostSignals || 1)) * 100).toFixed(1) : 0;

        const totalPips = signals.reduce((acc, s) => acc + (s.result_pips || 0), 0);
        const totalProfit = signals.reduce((acc, s) => acc + (s.realized_profit || 0), 0);

        // Chart Data: Win Rate by Symbol
        const symbolMap: Record<string, { won: number, lost: number, total: number }> = {};
        signals.forEach(s => {
            if (!symbolMap[s.symbol]) symbolMap[s.symbol] = { won: 0, lost: 0, total: 0 };
            symbolMap[s.symbol].total++;
            if (s.status === 'WON') symbolMap[s.symbol].won++;
            if (s.status === 'LOST') symbolMap[s.symbol].lost++;
        });

        const symbolData = Object.keys(symbolMap).map(sym => ({
            name: sym,
            value: symbolMap[sym].total,
            winRate: parseFloat(((symbolMap[sym].won / (symbolMap[sym].won + symbolMap[sym].lost || 1)) * 100).toFixed(1))
        })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 pairs

        // Chart Data: Pips over time
        const dateMap: Record<string, number> = {};
        // Ordenamos las señales más antiguas primero para el gráfico de tiempo (Filtrando fechas inválidas)
        const sortedForChart = [...signals]
            .filter(s => s.created_at)
            .sort((a, b) => {
                const timeA = new Date(a.created_at).getTime();
                const timeB = new Date(b.created_at).getTime();
                return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
            });

        sortedForChart.forEach(s => {
            if (s.status === 'WON' || s.status === 'LOST') {
                const date = format(new Date(s.created_at), 'dd MMM', { locale: es });
                dateMap[date] = (dateMap[date] || 0) + (s.result_pips || 0);
            }
        });
        const timelineData = Object.keys(dateMap).map(date => ({ date, pips: dateMap[date] }));

        return { totalSignals, wonSignals, lostSignals, winRate, totalPips, totalProfit, symbolData, timelineData };
    }, [signals]);

    const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

    // TANSTACK TABLE CONFIG
    const columns = useMemo(
        () => [
            columnHelper.accessor('created_at', {
                header: 'Fecha',
                cell: info => <span className="text-slate-300">{format(new Date(info.getValue()), 'dd MMM yyyy, HH:mm', { locale: es })}</span>,
            }),
            columnHelper.accessor(row => row.organizations?.name || 'Global', {
                id: 'academia',
                header: 'Academia',
                cell: info => <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs">{info.getValue()}</span>,
            }),
            columnHelper.accessor('symbol', {
                header: 'Par',
                cell: info => <span className="font-medium text-white">{info.getValue()}</span>,
            }),
            columnHelper.accessor('signal_type', {
                header: 'Tipo',
                cell: info => {
                    const type = info.getValue() || info.row.original.signal;
                    return (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${type === 'BUY' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {type}
                        </span>
                    );
                },
            }),
            columnHelper.accessor('status', {
                header: 'Estado',
                cell: info => {
                    const status = info.getValue();
                    const colors: Record<string, string> = {
                        'WON': 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
                        'LOST': 'border-rose-500/30 text-rose-400 bg-rose-500/10',
                        'ACTIVE': 'border-amber-500/30 text-amber-400 bg-amber-500/10',
                        'SECURED': 'border-blue-500/30 text-blue-400 bg-blue-500/10',
                        'CANCELLED': 'border-slate-500/30 text-slate-400 bg-slate-500/10'
                    };
                    return (
                        <span className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full border ${colors[status] || colors['CANCELLED']}`}>
                            {status}
                        </span>
                    );
                },
            }),
            columnHelper.accessor('result_pips', {
                header: 'Pips',
                cell: info => {
                    const pips = info.getValue();
                    if (pips === null || pips === undefined) return <span className="text-slate-500">-</span>;
                    return (
                        <span className={`font-bold ${pips > 0 ? 'text-emerald-400' : pips < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                            {pips > 0 ? '+' : ''}{pips}
                        </span>
                    );
                },
            })
        ],
        []
    );

    const table = useReactTable({
        data: signals,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const renderDateTab = (id: string, label: string) => {
        const isActive = activeDateTab === id;
        return (
            <button
                onClick={() => handleQuickDate(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-transparent'
                    }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        Radiografía de Señales
                        {isFetching && <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />}
                    </h1>
                    <p className="text-slate-400 text-sm">Métricas y rendimiento global de todas las academias.</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {renderDateTab('ayer', 'Ayer')}
                {renderDateTab('1w', '1 Semana')}
                {renderDateTab('1m', '1 Mes')}
                {renderDateTab('3m', '3 Meses')}
                {renderDateTab('1y', '1 Año')}
                {renderDateTab('global', 'Global (Todo)')}
                {activeDateTab === 'custom' && (
                    <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1">
                        <Calendar size={12} /> Personalizado
                    </span>
                )}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12} /> Desde</label>
                    <input type="date" value={filters.startDate} onChange={e => handleManualDateChange('startDate', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500 text-sm h-10 [color-scheme:dark]" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12} /> Hasta</label>
                    <input type="date" value={filters.endDate} onChange={e => handleManualDateChange('endDate', e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-emerald-500 text-sm h-10 [color-scheme:dark]" />
                </div>
                <div className="space-y-1 flex-1 min-w-[150px]">
                    <label className="text-xs text-slate-400 flex items-center gap-1"><Filter size={12} /> Academia</label>
                    <select value={filters.orgId} onChange={e => setFilters(prev => ({ ...prev, orgId: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 text-white outline-none focus:border-emerald-500 text-sm h-10">
                        <option value="all">Todas las Academias</option>
                        {organizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1 flex-1 min-w-[150px]">
                    <label className="text-xs text-slate-400 flex items-center gap-1"><Search size={12} /> Par / Índice</label>
                    <select value={filters.symbol} onChange={e => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 text-white outline-none focus:border-emerald-500 text-sm h-10 uppercase">
                        <option value="">Todos los Índices</option>
                        {symbols.map(sym => (
                            <option key={sym} value={sym}>{sym}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-emerald-500/10 p-3 rounded-lg"><Activity className="text-emerald-500" size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-400">Total Señales</p>
                        <p className="text-2xl font-bold text-white">{metrics.totalSignals}</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg"><Target className="text-blue-500" size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-400">Win Rate</p>
                        <p className="text-2xl font-bold text-white">{metrics.winRate}%</p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-lg"><TrendingUp className="text-amber-500" size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-400">Pips Generados</p>
                        <p className={`text-2xl font-bold ${metrics.totalPips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {metrics.totalPips > 0 ? '+' : ''}{metrics.totalPips}
                        </p>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center gap-4">
                    <div className="bg-purple-500/10 p-3 rounded-lg"><DollarSign className="text-purple-500" size={24} /></div>
                    <div>
                        <p className="text-sm text-slate-400">Beneficio (USD)</p>
                        <p className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ${metrics.totalProfit.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-4">Rendimiento en Pips (Evolución)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={metrics.timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10b981' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                />
                                <Bar dataKey="pips" radius={[4, 4, 0, 0]}>
                                    {metrics.timelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.pips >= 0 ? '#10b981' : '#f43f5e'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-4">Top 5 Pares Más Operados</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={metrics.symbolData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {metrics.symbolData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    formatter={(value, name, props) => [`${value} señales (${props.payload.winRate}% WR)`, name]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-white">Historial de Señales</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-950/50">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="p-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-slate-500">Cargando señales...</td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-slate-500">No se encontraron señales en este periodo.</td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-800/20 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-4 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {table.getPageCount() > 1 && (
                    <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => {
                                    table.setPageSize(Number(e.target.value))
                                }}
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 outline-none focus:border-emerald-500 text-xs"
                            >
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>Mostrar {pageSize}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
