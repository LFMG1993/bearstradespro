import { useState, useMemo } from 'react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, PlusCircle, Building2, Edit, Trash2, ArrowUpDown, Loader2, DollarSign, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from "../../services/admin.service.ts";
import { PlanFormModal } from "../../components/admin/plans/PlanFormModal.tsx";
import type { Plan } from "../../types";

export const AdminPlansPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Partial<Plan> | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const { data: plans = [], isLoading, isError } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: adminService.getPlans,
    });

    // Nota: El backend no tiene ruta DELETE para planes, pero la preparamos.
    const deleteMutation = useMutation({
        mutationFn: (_planId: string) => {
            // return adminService.deletePlan(planId);
            return Promise.reject(new Error("La eliminación de planes no está implementada en el backend."));
        },
        onSuccess: () => {
            toast.success("Plan eliminado");
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const handleDelete = (planId: string) => {
        if (window.confirm("¿Seguro que quieres eliminar este plan? Podría afectar a suscripciones activas.")) {
            deleteMutation.mutate(planId);
        }
    };

    const openCreateModal = () => {
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    const openEditModal = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const columnHelper = createColumnHelper<Plan>();

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Nombre del Plan',
            cell: info => (
                <div>
                    <div className="font-medium text-white">{info.getValue()}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Code size={10} /> {info.row.original.code}
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('price', {
            header: 'Precio',
            cell: info => (
                <div className="flex items-center gap-1 text-emerald-400 font-mono">
                    <DollarSign size={14} />
                    {info.getValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="text-gray-500 text-xs">USD</span>
                </div>
            )
        }),
        columnHelper.accessor('organizationName', {
            header: 'Organización',
            cell: info => (
                <div className="flex items-center gap-2 text-gray-300">
                    <Building2 size={16} className="text-gray-500" />
                    {info.getValue() || 'N/A'}
                </div>
            )
        }),
        columnHelper.accessor('created_at', {
            header: 'Creado',
            cell: info => new Date(info.getValue()).toLocaleDateString(),
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: info => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(info.row.original)} className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-gray-500 transition" title="Editar">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(info.row.original.id)} className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-gray-500 transition" title="Eliminar">
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        })
    ], []);

    const table = useReactTable({
        data: plans,
        columns,
        state: { globalFilter, sorting },
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
                    <h1 className="text-3xl font-bold text-white">Planes</h1>
                    <p className="text-gray-400">Gestiona los planes de suscripción disponibles para las organizaciones.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-medium">
                    <PlusCircle size={18} />
                    Nuevo Plan
                </button>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-3">
                <Search className="text-gray-500" size={20} />
                <input type="text" placeholder="Buscar por nombre o código..."
                       className="bg-transparent border-none text-white w-full focus:outline-none placeholder-gray-600"
                       value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-gray-800/50 text-gray-400 text-xs uppercase border-b border-gray-800">
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="p-4 font-semibold cursor-pointer select-none hover:text-white" onClick={header.column.getToggleSortingHandler()}>
                                        <div className="flex items-center gap-2">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {header.column.getCanSort() && <ArrowUpDown size={12} />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr><td colSpan={columns.length} className="p-8 text-center text-gray-500"><div className="flex justify-center items-center gap-2"><Loader2 className="animate-spin" /> Cargando planes...</div></td></tr>
                        ) : isError ? (
                            <tr><td colSpan={columns.length} className="p-8 text-center text-rose-500">Error al cargar planes.</td></tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="p-8 text-center text-gray-500">No se encontraron planes.</td></tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-800/40 transition group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    <PlanFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-plans'] })} planToEdit={selectedPlan} />
                </div>
            </div>
        </div>
    );
};