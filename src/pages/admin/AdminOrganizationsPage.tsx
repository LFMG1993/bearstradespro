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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, PlusCircle, Edit, ArrowUpDown, Loader2, Building2, Link as LinkIcon, Calendar } from 'lucide-react';
import { adminService } from "../../services/admin.service.ts";
import { OrganizationFormModal } from "../../components/admin/organizations/OrganizationFormModal.tsx";
import type { Organization } from "../../types";

export const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Partial<Organization> | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const { data: orgs = [], isLoading, isError } = useQuery({
        queryKey: ['admin-organizations'],
        queryFn: adminService.getOrganizations,
    });

    const openCreateModal = () => {
        setSelectedOrg(null);
        setIsModalOpen(true);
    };

    const openEditModal = (org: Organization) => {
        setSelectedOrg(org);
        setIsModalOpen(true);
    };

    const columnHelper = createColumnHelper<Organization>();

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Nombre',
            cell: info => (
                <div className="flex items-center gap-3">
                    {info.row.original.logo_url ? (
                        <img src={info.row.original.logo_url} alt={info.getValue()} className="w-8 h-8 rounded-md object-contain bg-slate-800" />
                    ) : (
                        <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center text-slate-500">
                            <Building2 size={16} />
                        </div>
                    )}
                    <div className="font-medium text-white">{info.getValue()}</div>
                </div>
            )
        }),
        columnHelper.accessor('slug', {
            header: 'Slug',
            cell: info => (
                <div className="flex items-center gap-1 text-slate-400">
                    <LinkIcon size={12} /> {info.getValue()}
                </div>
            )
        }),
        columnHelper.accessor('default_trial_days', {
            header: 'Días de Prueba',
            cell: info => (
                <div className="text-slate-300">
                    {info.getValue()} días
                </div>
            )
        }),
        columnHelper.accessor('created_at', {
            header: 'Fecha Creación',
            cell: info => (
                <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={14} />
                    {info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : 'N/A'}
                </div>
            )
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: info => (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEditModal(info.row.original)} className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-slate-500 transition" title="Editar">
                        <Edit size={16} />
                    </button>
                </div>
            )
        })
    ], []);

    const table = useReactTable({
        data: orgs,
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
                    <h1 className="text-3xl font-bold text-white">Academias (Organizaciones)</h1>
                    <p className="text-slate-400">Gestiona las diferentes academias que utilizan la plataforma.</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-medium">
                    <PlusCircle size={18} />
                    Nueva Academia
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                <Search className="text-slate-500" size={20} />
                <input type="text" placeholder="Buscar por nombre o slug..."
                       className="bg-transparent border-none text-white w-full focus:outline-none placeholder-slate-600"
                       value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-slate-800/50 text-slate-400 text-xs uppercase border-b border-slate-800">
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
                        <tbody className="divide-y divide-slate-800">
                        {isLoading ? (
                            <tr><td colSpan={columns.length} className="p-8 text-center text-slate-500"><div className="flex justify-center items-center gap-2"><Loader2 className="animate-spin" /> Cargando academias...</div></td></tr>
                        ) : isError ? (
                            <tr><td colSpan={columns.length} className="p-8 text-center text-rose-500">Error al cargar academias.</td></tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr><td colSpan={columns.length} className="p-8 text-center text-slate-500">No se encontraron academias.</td></tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-800/40 transition group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    <OrganizationFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-organizations'] })} orgToEdit={selectedOrg} />
                </div>
            </div>
        </div>
    );
};
