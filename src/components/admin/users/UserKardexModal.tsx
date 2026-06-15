import {useState, useEffect} from 'react';
import {X, History, Loader2, Calendar, FileText} from 'lucide-react';
import {adminService} from '../../../services/admin.service.ts';
import {format} from 'date-fns';
import {es} from 'date-fns/locale';

interface UserKardexModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    userName?: string;
}

export const UserKardexModal = ({isOpen, onClose, userId, userName}: UserKardexModalProps) => {
    const [loading, setLoading] = useState(false);
    const [kardex, setKardex] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchKardex();
        } else {
            setKardex([]);
        }
    }, [isOpen, userId]);

    const fetchKardex = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await adminService.getUserKardex(userId);
            setKardex(data);
        } catch (error) {
            console.error("Error obteniendo kardex", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <History size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Kardex y Trazabilidad
                            </h2>
                            <p className="text-xs text-slate-400">
                                {userName ? `Usuario: ${userName}` : 'Historial de Suscripciones y Pagos'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={24}/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-12 text-slate-500">
                            <Loader2 className="animate-spin mr-2" size={24} />
                            Cargando historial...
                        </div>
                    ) : kardex.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                            <FileText size={48} className="opacity-20 mb-4" />
                            <p>No hay registros en el kardex para este usuario.</p>
                            <p className="text-xs mt-1">Las suscripciones o accesos otorgados aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="relative border-l border-slate-800 ml-4 space-y-6">
                            {kardex.map((item, idx) => {
                                const isManual = item.provider?.includes('manual') || item.provider?.includes('system');
                                const isTrial = item.provider?.includes('trial');
                                
                                return (
                                    <div key={item.id || idx} className="relative pl-6">
                                        <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 ${
                                            isTrial ? 'bg-blue-500' : isManual ? 'bg-purple-500' : 'bg-emerald-500'
                                        }`} />
                                        
                                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-800/50 hover:border-slate-700 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide mb-2 inline-block ${
                                                        isTrial ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                                                        isManual ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                                                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    }`}>
                                                        {isTrial ? 'Prueba Inicial' : isManual ? 'Asignación Manual' : 'Suscripción Web'}
                                                    </span>
                                                    <h3 className="font-medium text-white">
                                                        Plan: {item.plans?.name || 'Desconocido'} ({item.plans?.code})
                                                    </h3>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg text-white">
                                                        {item.amount === 0 ? 'GRATIS' : `${item.currency} ${item.amount}`}
                                                    </div>
                                                    <div className="text-xs text-slate-500 uppercase">{item.status}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/50">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {format(new Date(item.created_at), "dd 'de' MMM, yyyy HH:mm", {locale: es})}
                                                </div>
                                                {item.external_id && (
                                                    <div className="flex items-center gap-1">
                                                        <FileText size={14} />
                                                        Ref: <span className="font-mono text-[10px]">{item.external_id}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
