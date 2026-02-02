import {useState, useMemo} from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from '@tanstack/react-table';
import {useQuery} from '@tanstack/react-query';
import {
    Search,
    Loader2,
    ArrowUpDown,
    CreditCard,
    UserCog,
    Monitor,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import {adminService} from "../../services/admin.service.ts";
import type {Subscription} from "../../types";
import {formatDistanceToNow} from 'date-fns';
import {es} from 'date-fns/locale';

export const AdminSubscriptionsPage = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const {data: subscriptions = [], isLoading, isError} = useQuery({
        queryKey: ['admin-subscriptions'],
        queryFn: adminService.getSubscriptions,
    });

    // --- HELPERS VISUALES ---
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full border border-emerald-500/20 font-medium"><CheckCircle2
                    size={10}/> Activa</span>;
            case 'trialing':
                return <span
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full border border-blue-500/20 font-medium"><Clock
                    size={10}/> Prueba</span>;
            case 'expired':
            case 'canceled':
                return <span
                    className="inline-flex items-center gap-1 px-2 py-1 bg-rose-500/10 text-rose-500 text-xs rounded-full border border-rose-500/20 font-medium"><AlertCircle
                    size={10}/> Vencida</span>;
            default:
                return <span
                    className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full border border-gray-600 font-medium">{status}</span>;
        }
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'mercadopago':
                return <div className="flex items-center gap-1 text-blue-400" title="Mercado Pago"><CreditCard
                    size={14}/> <span className="text-xs">MP</span></div>;
            case 'manual':
                return <div className="flex items-center gap-1 text-purple-400" title="Manual (Admin)"><UserCog
                    size={14}/> <span className="text-xs">Manual</span></div>;
            case 'system':
            default:
                return <div className="flex items-center gap-1 text-gray-400" title="Sistema"><Monitor size={14}/> <span
                    className="text-xs">Sistema</span></div>;
        }
    };

    // --- CONFIGURACIÓN DE COLUMNAS ---
    const columnHelper = createColumnHelper<Subscription>();

    const columns = useMemo(() => [
        columnHelper.accessor('user_full_name', {
            header: 'Usuario',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                        {info.row.original.user_avatar ? (
                            <img src={info.row.original.user_avatar} alt="Avatar"
                                 className="w-full h-full object-cover"/>
                        ) : (
                            <span className="text-emerald-500 font-bold text-xs">{info.getValue()?.[0] || 'U'}</span>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-white text-sm">{info.getValue() || 'Sin Nombre'}</div>
                        <div className="text-xs text-gray-500">{info.row.original.user_email}</div>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('plan_name', {
            header: 'Plan',
            cell: info => (
                <div className="text-sm text-gray-300">
                    {info.getValue()}
                    <span className="block text-xs text-gray-600 font-mono">{info.row.original.plan_code}</span>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => getStatusBadge(info.getValue())
        }),
        columnHelper.accessor('payment_provider', {
            header: 'Proveedor',
            cell: info => getProviderIcon(info.getValue())
        }),
        columnHelper.accessor('current_period_end', {
            header: 'Vencimiento',
            cell: info => {
                const dateStr = info.getValue() || info.row.original.trial_ends_at;
                if (!dateStr) return <span className="text-gray-600 text-xs">-</span>;

                const date = new Date(dateStr);
                const isPast = date < new Date();

                return (
                    <div className="text-xs">
                        <div className={`font-medium ${isPast ? 'text-rose-400' : 'text-gray-300'}`}>
                            {date.toLocaleDateString()}
                        </div>
                        <div className="text-gray-600">
                            {isPast ? 'Hace ' : 'En '}
                            {formatDistanceToNow(date, {locale: es})}
                        </div>
                    </div>
                );
            }
        }),
        columnHelper.accessor('organization_name', {
            header: 'Organización',
            cell: info => <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{info.getValue()}</span>
        }),
    ], []);

    const table = useReactTable({
        data: subscriptions,
        columns,
        state: {globalFilter, sorting},
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Suscripciones</h1>
                    <p className="text-gray-400">Monitoreo de estados de suscripción y métodos de pago.</p>
                </div>
            </div>

            {/* Buscador */}
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-3">
                <Search className="text-gray-500" size={20}/>
                <input
                    type="text"
                    placeholder="Buscar por usuario, email, plan o estado..."
                    className="bg-transparent border-none text-white w-full focus:outline-none placeholder-gray-600"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            {/* Tabla */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}
                                className="bg-gray-800/50 text-gray-400 text-xs uppercase border-b border-gray-800">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}
                                        className="p-4 font-semibold cursor-pointer select-none hover:text-white"
                                        onClick={header.column.getToggleSortingHandler()}>
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && <ArrowUpDown size={12}/>}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2"><Loader2
                                        className="animate-spin"/> Cargando suscripciones...
                                    </div>
                                </td>
                            </tr>
                        ) : isError ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-rose-500">Error al cargar
                                    datos.
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">No se encontraron
                                    suscripciones.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-800/40 transition group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}
                                            className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación simple */}
                <div
                    className="p-4 border-t border-gray-800 bg-gray-800/30 flex justify-between items-center text-xs text-gray-500">
                    <div>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</div>
                    <div className="flex gap-2">
                        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                                className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50">Anterior
                        </button>
                        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                                className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50">Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};