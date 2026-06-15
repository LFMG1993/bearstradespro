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
import {
    Search,
    UserPlus,
    Building2,
    Calendar,
    Mail,
    Phone,
    Edit,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Loader2,
    History,
    PowerOff,
    Power
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from "../../services/admin.service.ts";
import { UserFormModal } from "../../components/admin/users/UserFormModal.tsx";
import { UserKardexModal } from "../../components/admin/users/UserKardexModal.tsx";

export const AdminUsersPage = () => {
    const queryClient = useQueryClient();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isKardexModalOpen, setIsKardexModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    // Estados de la tabla y filtros
    const [globalFilter, setGlobalFilter] = useState('');
    const [orgFilter, setOrgFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');
    const [sorting, setSorting] = useState<SortingState>([]);

    const { data: organizations = [] } = useQuery({
        queryKey: ['admin-organizations'],
        queryFn: () => adminService.getOrganizations()
    });

    const { data: allUsers = [], isLoading, isError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            return await adminService.getUsers();
        }
    });

    // 3. MUTACIÓN PARA ACTIVAR/INACTIVAR
    const toggleStatusMutation = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
            await adminService.toggleUserStatus(userId, isActive);
            return { userId, isActive };
        },
        onSuccess: (data) => {
            toast.success(data.isActive ? "Usuario activado" : "Usuario inactivado");
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const handleToggleStatus = (user: any) => {
        const action = user.isActive ? 'inactivar' : 'activar';
        if (window.confirm(`¿Estás seguro de ${action} a este usuario?`)) {
            toggleStatusMutation.mutate({ userId: user.id, isActive: !user.isActive });
        }
    };

    // --- MANEJO DE MODALES ---
    const openCreateModal = () => {
        setSelectedUser(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setIsFormModalOpen(true);
    };

    const openKardexModal = (user: any) => {
        setSelectedUser(user);
        setIsKardexModalOpen(true);
    };

    const getStatusBadge = (status: string, expiresAt: string | null | undefined, isActive: boolean) => {
        if (!isActive) {
            return <span className="px-2 py-1 bg-slate-500/10 text-slate-400 text-[10px] uppercase rounded-full border border-slate-500/20 font-bold tracking-wider">Inactivo</span>;
        }

        const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

        if (status === 'active' && !isExpired) {
            return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase rounded-full border border-emerald-500/20 font-bold tracking-wider">Activo</span>;
        }
        if (status === 'trialing' && !isExpired) {
            return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] uppercase rounded-full border border-blue-500/20 font-bold tracking-wider">Prueba</span>;
        }
        return <span className="px-2 py-1 bg-rose-500/10 text-rose-400 text-[10px] uppercase rounded-full border border-rose-500/20 font-bold tracking-wider">Vencido</span>;
    };

    // Aplicar filtros manuales (Org y Estado) antes de pasar a TanStack
    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            const matchOrg = orgFilter === 'all' || user.organizationId === orgFilter;
            const matchStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'active' ? user.isActive !== false : user.isActive === false;
            return matchOrg && matchStatus;
        });
    }, [allUsers, orgFilter, statusFilter]);

    // 4. CONFIGURACIÓN DE COLUMNAS (TanStack Table)
    const columnHelper = createColumnHelper<any>();

    const columns = useMemo(() => [
        columnHelper.accessor('fullName', {
            header: 'Usuario',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                        {info.row.original.avatar ? (
                            <img src={info.row.original.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-emerald-500 font-bold text-lg">{info.getValue()?.[0] || 'U'}</span>
                        )}
                    </div>
                    <div>
                        <div className={`font-medium ${info.row.original.isActive === false ? 'text-slate-500 line-through' : 'text-white'}`}>
                            {info.getValue() || 'Sin Nombre'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar size={10} /> Registrado: {new Date(info.row.original.joinedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('organization', {
            header: 'Academia',
            cell: info => (
                <div className="flex items-center gap-2 text-slate-300">
                    <Building2 size={16} className="text-slate-500" />
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{info.getValue()}</span>
                </div>
            )
        }),
        columnHelper.accessor('plan', {
            header: 'Plan / Estado',
            cell: info => (
                <div className="space-y-1.5">
                    <div className="text-sm text-white font-medium">{info.getValue()}</div>
                    {getStatusBadge(info.row.original.status, info.row.original.expiresAt, info.row.original.isActive)}
                </div>
            )
        }),
        columnHelper.accessor('email', {
            header: 'Contacto',
            cell: info => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail size={12} /> {info.getValue()}
                    </div>
                    {info.row.original.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Phone size={12} /> {info.row.original.phone}
                        </div>
                    )}
                </div>
            )
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: info => {
                const user = info.row.original;
                return (
                    <div className="flex items-center justify-end gap-1">
                        <button
                            onClick={() => openKardexModal(user)}
                            className="p-2 hover:bg-slate-700 hover:text-white rounded-lg text-slate-500 transition"
                            title="Ver Trazabilidad / Kardex"
                        >
                            <History size={16} />
                        </button>
                        <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-slate-500 transition"
                            title="Editar"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={toggleStatusMutation.isPending}
                            className={`p-2 rounded-lg transition ${user.isActive === false
                                    ? 'hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-500'
                                    : 'hover:bg-rose-500/20 hover:text-rose-400 text-slate-500'
                                }`}
                            title={user.isActive === false ? "Activar Usuario" : "Inactivar Usuario"}
                        >
                            {user.isActive === false ? <Power size={16} /> : <PowerOff size={16} />}
                        </button>
                    </div>
                );
            }
        })
    ], []);

    // 5. INSTANCIA DE LA TABLA
    const table = useReactTable({
        data: filteredUsers,
        columns,
        state: {
            globalFilter,
            sorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    return (
        <div className="space-y-6">
            {/* Header y Acciones */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Usuarios Globales</h1>
                    <p className="text-slate-400 text-sm">Gestión de todos los usuarios registrados en el sistema.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-medium text-sm">
                    <UserPlus size={16} />
                    Nuevo Usuario
                </button>
            </div>

            {/* Buscador y Filtros */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] flex items-center gap-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                    <Search className="text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email..."
                        className="bg-transparent border-none text-white w-full focus:outline-none placeholder-slate-600 text-sm"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 min-w-[200px]">
                    <Building2 className="text-slate-500" size={16} />
                    <select
                        value={orgFilter}
                        onChange={e => setOrgFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                    >
                        <option value="all">Todas las Academias</option>
                        {organizations.map((org: any) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 min-w-[150px]">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm"
                    >
                        <option value="active">Solo Activos</option>
                        <option value="inactive">Solo Inactivos</option>
                        <option value="all">Todos</option>
                    </select>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}
                                    className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}
                                            className="p-4 font-semibold cursor-pointer select-none hover:text-white"
                                            onClick={header.column.getToggleSortingHandler()}>
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
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin" size={20} /> Cargando usuarios...
                                        </div>
                                    </td>
                                </tr>
                            ) : isError ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-rose-500">Error al cargar
                                        usuarios.
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="p-8 text-center text-slate-500">No se encontraron
                                        usuarios con los filtros actuales.
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-800/40 transition group">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="p-4 align-middle">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* MODALES RENDERIZADOS */}
                    <UserFormModal
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
                        userToEdit={selectedUser}
                    />

                    <UserKardexModal
                        isOpen={isKardexModalOpen}
                        onClose={() => setIsKardexModalOpen(false)}
                        userId={selectedUser?.id || null}
                        userName={selectedUser?.fullName}
                    />
                </div>

                <div
                    className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-between items-center text-xs text-slate-500">
                    <div>
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1} ({table.getFilteredRowModel().rows.length} usuarios)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1 transition text-slate-300"
                        >
                            <ChevronLeft size={14} /> Anterior
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1 transition text-slate-300"
                        >
                            Siguiente <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};