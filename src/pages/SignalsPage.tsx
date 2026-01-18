import {type ColumnDef } from '@tanstack/react-table';
import { useSignals } from '../hooks/useSignals';
import { DataTable } from '../components/general/DataTable';
import type { Signal } from '../types';
import { Clock } from 'lucide-react';

// 1. Definimos las columnas
const columns: ColumnDef<Signal>[] = [
    {
        accessorKey: "symbol",
        header: "Par / Activo",
        cell: ({ row }) => (
            <div className="font-bold text-white flex items-center gap-2">
                {row.original.symbol}
            </div>
        ),
    },
    {
        accessorKey: "signal_type",
        header: "Tipo",
        cell: ({ row }) => {
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
        cell: ({ row }) => <span className="font-mono text-gray-300">{row.getValue("price")}</span>,
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
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
        accessorKey: "estimated_profit",
        header: "Profit Est.",
        cell: ({ row }) => (
            <span className="text-yellow-400 font-mono">
        ${(row.getValue("estimated_profit") as number)?.toFixed(2) || '---'}
      </span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Hora",
        cell: ({ row }) => (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Clock size={12} />
                {new Date(row.getValue("created_at")).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
        ),
    },
];

// 2. El Componente de Página
export const SignalsPage = () => {
    const { signals, loading } = useSignals();

    if (loading) return <div className="text-white text-center p-10">Cargando historial...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Historial de Señales</h2>
                    <p className="text-gray-400 text-sm">Todas las operaciones del bot en tiempo real</p>
                </div>
                <div className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-400 border border-gray-700">
                    Total: <span className="text-white font-bold">{signals.length}</span>
                </div>
            </div>

            <DataTable columns={columns} data={signals} />
        </div>
    );
};