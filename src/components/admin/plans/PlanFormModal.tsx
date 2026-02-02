import { useState, useEffect } from 'react';
import { X, Save, Loader2, Building2, DollarSign, Code, FileJson } from 'lucide-react';
import { adminService } from '../../../services/admin.service.ts';
import toast from 'react-hot-toast';
import type { Plan } from '../../../types';

interface PlanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    planToEdit?: Partial<Plan> | null;
}

export const PlanFormModal = ({ isOpen, onClose, onSuccess, planToEdit }: PlanFormModalProps) => {
    const [loading, setLoading] = useState(false);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        code: '',
        price: 0,
        organizationId: '',
        features: '{}',
    });

    useEffect(() => {
        if (isOpen) {
            fetchOrgs();
            if (planToEdit) {
                setFormData({
                    id: planToEdit.id || '',
                    name: planToEdit.name || '',
                    code: planToEdit.code || '',
                    price: planToEdit.price || 0,
                    organizationId: planToEdit.organizationId || '',
                    features: JSON.stringify(planToEdit.features || {}, null, 2),
                });
            } else {
                setFormData({ id: '', name: '', code: '', price: 0, organizationId: '', features: '{}' });
            }
        }
    }, [isOpen, planToEdit]);

    const fetchOrgs = async () => {
        try {
            const data = await adminService.getOrganizations();
            setOrgs(data);
        } catch (error) {
            console.error("Error cargando organizaciones", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Validar que 'features' sea un JSON válido
            let featuresParsed = {};
            try {
                featuresParsed = JSON.parse(formData.features);
            } catch (jsonError) {
                toast.error("El campo 'Características' no es un JSON válido.");
                setLoading(false);
                return;
            }

            await adminService.savePlan({ ...formData, features: featuresParsed });
            toast.success(planToEdit ? "Plan actualizado" : "Plan creado correctamente");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">{planToEdit ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Nombre del Plan</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><Code size={12}/> Código Único</label>
                            <input required type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="ej: pro, enterprise"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><DollarSign size={12}/> Precio (USD)</label>
                            <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                   className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><Building2 size={12}/> Organización</label>
                            <select required value={formData.organizationId} onChange={e => setFormData({ ...formData, organizationId: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none appearance-none">
                                <option value="">Seleccionar...</option>
                                {orgs.map(org => (<option key={org.id} value={org.id}>{org.name}</option>))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><FileJson size={12}/> Características (JSON)</label>
                        <textarea
                            value={formData.features}
                            onChange={e => setFormData({ ...formData, features: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs h-24 focus:border-emerald-500 outline-none"
                            placeholder={`{\n  "signals": true,\n  "max_users": 10\n}`}
                        />
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancelar</button>
                        <button type="submit" disabled={loading}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {planToEdit ? 'Guardar Cambios' : 'Crear Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};