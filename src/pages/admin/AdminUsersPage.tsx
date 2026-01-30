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
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
    Search,
    UserPlus,
    Building2,
    Calendar,
    Mail,
    Phone,
    Trash2,
    Edit,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import {adminService} from "../../services/admin.service.ts";
import {UserFormModal} from "../../components/admin/users/UserFormModal.tsx";
import type {AdminUser} from "../../types";

export const AdminUsersPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

    // Estados de la tabla
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);

    const {data: users = [], isLoading, isError} = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
    return await adminService.getUsers();
        }
    });

    // 3. MUTACIÓN PARA BORRAR (TanStack Query)
    const deleteMutation = useMutation({
        mutationFn: async (userId: string) => {
            await adminService.deleteUser(userId);
            return userId;
        },
        onSuccess: () => {
            toast.success("Usuario eliminado");
            queryClient.invalidateQueries({queryKey: ['admin-users']});
        },
        onError: (error: Error) => {
            toast.error(error.message);
        }
    });

    const handleDelete = (userId: string) => {
        if (window.confirm("¿Estás seguro de eliminar este usuario? Esta acción borrará su historial, planes y suscripciones permanentemente.")) {
            deleteMutation.mutate(userId);
        }
    };

    // --- MANEJO DEL MODAL ---
    const openCreateModal = () => {
        setSelectedUser(null); // Modo crear
        setIsModalOpen(true);
    };

    const openEditModal = (user: AdminUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const getStatusBadge = (status: string, expiresAt: string | null | undefined) => {
        const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

        if (status === 'active' && !isExpired) {
            return <span
                className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs rounded-full border border-emerald-500/20 font-medium">Activo</span>;
        }
        if (status === 'trialing' && !isExpired) {
            return <span
                className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full border border-blue-500/20 font-medium">Prueba</span>;
        }
        return <span
            className="px-2 py-1 bg-rose-500/10 text-rose-500 text-xs rounded-full border border-rose-500/20 font-medium">Vencido</span>;
    };

    // 4. CONFIGURACIÓN DE COLUMNAS (TanStack Table)
    const columnHelper = createColumnHelper<AdminUser>();

    const columns = useMemo(() => [
        columnHelper.accessor('fullName', {
            header: 'Usuario',
            cell: info => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700">
                        {info.row.original.avatar ? (
                            <img src={info.row.original.avatar} alt="Avatar" className="w-full h-full object-cover"/>
                        ) : (
                            <span className="text-emerald-500 font-bold text-lg">{info.getValue()?.[0] || 'U'}</span>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-white">{info.getValue() || 'Sin Nombre'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar
                                size={10}/> Registrado: {new Date(info.row.original.joinedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('organization', {
            header: 'Organización',
            cell: info => (
                <div className="flex items-center gap-2 text-gray-300">
                    <Building2 size={16} className="text-gray-500"/>
                    {info.getValue()}
                </div>
            )
        }),
        columnHelper.accessor('plan', {
            header: 'Plan / Estado',
            cell: info => (
                <div className="space-y-1">
                    <div className="text-sm text-white font-medium">{info.getValue()}</div>
                    {getStatusBadge(info.row.original.status, info.row.original.expiresAt)}
                </div>
            )
        }),
        columnHelper.accessor('email', {
            header: 'Contacto',
            cell: info => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Mail size={12}/> {info.getValue()}
                    </div>
                    {info.row.original.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone size={12}/> {info.row.original.phone}
                        </div>
                    )}
                </div>
            )
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: info => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => openEditModal(info.row.original)}
                        className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg text-gray-500 transition"
                        title="Editar"
                    >
                        <Edit size={16}/>
                    </button>
                    <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-gray-500 transition"
                        title="Eliminar"
                    >
                        <Trash2 size={16}/>
                    </button>
                </div>
            )
        })
    ], []);

    // 5. INSTANCIA DE LA TABLA
    const table = useReactTable({
        data: users,
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
                    <p className="text-gray-400">Gestión de todos los usuarios registrados en el sistema.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-medium">
                    <UserPlus size={18}/>
                    Nuevo Usuario
                </button>
            </div>

            {/* Buscador */}
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center gap-3">
                <Search className="text-gray-500" size={20}/>
                <input
                    type="text"
                    placeholder="Buscar por nombre, email u organización..."
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
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="animate-spin"/> Cargando directorio...
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
                                <td colSpan={columns.length} className="p-8 text-center text-gray-500">No se encontraron
                                    usuarios.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-800/40 transition group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="p-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    {/* MODAL RENDERIZADO */}
                    <UserFormModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => queryClient.invalidateQueries({queryKey: ['admin-users']})}
                        userToEdit={selectedUser}
                    />
                </div>

                <div
                    className="p-4 border-t border-gray-800 bg-gray-800/30 flex justify-between items-center text-xs text-gray-500">
                    <div>
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} ({table.getFilteredRowModel().rows.length} usuarios)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            <ChevronLeft size={14}/> Anterior
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            Siguiente <ChevronRight size={14}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};