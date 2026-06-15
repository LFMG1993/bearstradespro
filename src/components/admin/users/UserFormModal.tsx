import { useState, useEffect, useMemo } from 'react';
import { X, Save, Loader2, Building2, Infinity } from 'lucide-react';
import { adminService } from '../../../services/admin.service.ts';
import toast from 'react-hot-toast';
import type { Plan } from '../../../types';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userToEdit?: any;
}

export const UserFormModal = ({ isOpen, onClose, onSuccess, userToEdit }: UserFormModalProps) => {
    const [loading, setLoading] = useState(false);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [allPlans, setAllPlans] = useState<Plan[]>([]);
    const [isIndefinite, setIsIndefinite] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: '',
        email: '',
        password: '',
        fullName: '',
        organizationId: '',
        planCode: 'pro',
        days: 30,
        discountPercent: 0
    });

    // Cargar organizaciones y planes al abrir
    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (userToEdit) {
                // Modo EDICIÓN: Llenar datos
                setIsIndefinite(userToEdit.days >= 9999);
                setFormData({
                    id: userToEdit.id,
                    email: userToEdit.email || '',
                    password: '',
                    fullName: userToEdit.fullName || '',
                    organizationId: userToEdit.organizationId || '',
                    planCode: userToEdit.planCode || 'pro',
                    days: userToEdit.days || 30,
                    discountPercent: userToEdit.discountPercent || 0
                });
            } else {
                // Modo CREAR: Reset
                setIsIndefinite(false);
                setFormData({
                    id: '',
                    email: '',
                    password: '',
                    fullName: '',
                    organizationId: '',
                    planCode: '',
                    days: 30,
                    discountPercent: 0
                });
            }
        }
    }, [isOpen, userToEdit]);

    const fetchData = async () => {
        try {
            const [orgData, plansData] = await Promise.all([
                adminService.getOrganizations(),
                adminService.getPlans()
            ]);
            setOrgs(orgData);
            setAllPlans(plansData);
        } catch (error) {
            console.error("Error cargando datos", error);
        }
    };

    // Filtrar planes dinámicamente según la organización seleccionada
    const availablePlans = useMemo(() => {
        if (!formData.organizationId) return [];
        return allPlans.filter(p => p.organizationId === formData.organizationId);
    }, [formData.organizationId, allPlans]);

    // Preseleccionar el primer plan cuando cambia la organización si no hay uno válido
    useEffect(() => {
        if (availablePlans.length > 0 && !availablePlans.find(p => p.code === formData.planCode)) {
            setFormData(prev => ({ ...prev, planCode: availablePlans[0].code }));
        }
    }, [availablePlans]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                days: isIndefinite ? 9999 : formData.days
            };

            await adminService.saveUser(payload);

            toast.success(userToEdit ? "Usuario actualizado" : "Usuario creado correctamente");
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
            <div
                className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">
                        {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Nombre y Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Nombre Completo</label>
                            <input
                                required
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Contraseña (Opcional en edición) */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-400">
                            Contraseña {userToEdit &&
                                <span className="text-slate-500"> (Dejar en blanco para mantener actual)</span>}
                        </label>
                        <input
                            type="password"
                            required={!userToEdit} // Obligatoria solo al crear
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Organización y Plan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400 flex gap-1 items-center">
                                <Building2 size={12} /> Organización
                            </label>
                            <select
                                required
                                value={formData.organizationId}
                                onChange={e => setFormData({ ...formData, organizationId: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none appearance-none"
                            >
                                <option value="">Seleccionar...</option>
                                {orgs.map(org => (
                                    <option key={org.id} value={org.id}>{org.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Plan Inicial</label>
                            <select
                                required
                                value={formData.planCode}
                                onChange={e => setFormData({ ...formData, planCode: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                                disabled={!formData.organizationId}
                            >
                                {availablePlans.length === 0 && <option value="">Selecciona organización...</option>}
                                {availablePlans.map(plan => (
                                    <option key={plan.id} value={plan.code}>{plan.name} ({plan.code})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Días y Descuento */}
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/30 p-3 rounded-lg border border-slate-800 relative">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-slate-400">Días de Acceso</label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isIndefinite}
                                        onChange={e => setIsIndefinite(e.target.checked)}
                                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900"
                                    />
                                    <span className="text-[10px] text-slate-400">Indefinido</span>
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    disabled={isIndefinite}
                                    value={isIndefinite ? 9999 : formData.days}
                                    onChange={e => setFormData({ ...formData, days: parseInt(e.target.value) || 0 })}
                                    className={`w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none ${isIndefinite ? 'opacity-50' : ''}`}
                                />
                                {isIndefinite ? <Infinity size={16} className="text-emerald-500" /> : <span className="text-xs text-slate-500">días</span>}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-emerald-400">Descuento (%)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discountPercent}
                                    onChange={e => setFormData({
                                        ...formData,
                                        discountPercent: parseFloat(e.target.value) || 0
                                    })}
                                    className="w-full bg-slate-950 border border-emerald-500/30 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none"
                                />
                                <span className="text-xs text-slate-500">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="pt-4 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {userToEdit ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};