import {useState} from 'react';
import {type ColumnDef} from '@tanstack/react-table';
import {usePaginatedSignals} from '../hooks/useSignals';
import {DataTable} from '../components/general/DataTable';
import type {Signal} from '../types';
import {Clock, ChevronLeft, ChevronRight, Layers} from 'lucide-react';

// 1. Definimos las columnas
const columns: ColumnDef<Signal>[] = [
    {
        accessorKey: "symbol",
        header: "Par / Activo",
        cell: ({row}) => (
            <div className="font-bold text-white flex items-center gap-2">
                {row.original.symbol}
            </div>
        ),
    },
    {
        accessorKey: "signal_type",
        header: "Tipo",
        cell: ({row}) => {
            const isBuy = row.getValue("signal_type") === 'BUY';
            return (
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
          {row.getValue("signal_type")}
        </span>
            );
        },
    },
    {
        accessorKey: "price",
        header: "Entrada",
        cell: ({row}) => <span className="font-mono text-white font-medium">{row.getValue("price")}</span>,
    },
    {
        accessorKey: "lotage",
        header: "Lotaje",
        cell: ({row}) => (
            <div className="flex items-center gap-1 text-yellow-400 font-mono">
                <Layers size={12} className="opacity-50"/>
                {row.original.lotage}
            </div>
        ),
    },
    {
        accessorKey: "take_profit",
        header: "TP (Meta)",
        cell: ({row}) => (
            <div className="flex flex-col">
                <span className="text-white font-mono text-xs">{Math.round(row.original.take_profit)}</span>
                <span className="text-[10px] text-emerald-400 font-medium">
                     +${row.original.estimated_profit?.toFixed(2)}
                 </span>
            </div>
        ),
    },
    {
        accessorKey: "stop_loss",
        header: "SL (Riesgo)",
        cell: ({row}) => (
            <div className="flex flex-col">
                <span className="text-white font-mono text-xs">{Math.round(row.original.stop_loss)}</span>
                <span className="text-[10px] text-rose-400 font-medium">
                     -${row.original.estimated_loss?.toFixed(2)}
                 </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({row}) => {
            const status = row.getValue("status") as string;
            const colors = {
                ACTIVE: "text-blue-400",
                WON: "text-emerald-400 font-bold",
                LOST: "text-rose-400 font-bold"
            };
            return <span className={colors[status as keyof typeof colors] || "text-gray-400"}>{status}</span>;
        },
    },
    {
        accessorKey: "created_at",
        header: "Hora",
        cell: ({row}) => (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Clock size={12}/>
                {new Date(row.getValue("created_at")).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </div>
        ),
    },
];

// 2. El Componente de Página
export const SignalsPage = () => {

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    // Usamos el hook paginado. Cada vez que cambie 'currentPage', hace un fetch nuevo eficiente.
    const { signals, totalCount, isLoading } = usePaginatedSignals(currentPage, pageSize);
    const totalPages = Math.ceil(totalCount / pageSize);

    if (isLoading) return <div className="text-white text-center p-10">Cargando historial...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Historial de Señales</h2>
                    <p className="text-gray-400 text-sm">Todas las operaciones del bot en tiempo real</p>
                </div>
                <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-400 border border-gray-700">
                    Total: <span className="text-white font-bold">{totalCount}</span>
                </div>
            </div>

            {/* Pasamos solo la data paginada a la tabla */}
            <DataTable columns={columns} data={signals}/>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-800 pt-4">
                     <span className="text-xs text-gray-500">
                         Página {currentPage + 1} de {totalPages}
                     </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={16}/>
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};