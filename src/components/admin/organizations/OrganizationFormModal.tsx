import { useState, useEffect } from 'react';
import { X, Save, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../../services/admin.service.ts';
import toast from 'react-hot-toast';
import type { Organization } from '../../../types';

interface OrganizationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    orgToEdit?: Partial<Organization> | null;
}

export const OrganizationFormModal = ({ isOpen, onClose, onSuccess, orgToEdit }: OrganizationFormModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        logo_url: '',
        default_trial_days: 7,
        default_plan_code: 'pro',
        mp_access_token: '',
        mp_public_key: '',
        mp_webhook_secret: '',
        resend_api_key: '',
        resend_from_email: '',
        youtube_channel_id: '',
    });

    useEffect(() => {
        if (isOpen) {
            if (orgToEdit) {
                setFormData({
                    name: orgToEdit.name || '',
                    slug: orgToEdit.slug || '',
                    logo_url: orgToEdit.logo_url || '',
                    default_trial_days: orgToEdit.default_trial_days ?? 7,
                    default_plan_code: orgToEdit.default_plan_code || 'pro',
                    mp_access_token: orgToEdit.mp_access_token || '',
                    mp_public_key: orgToEdit.mp_public_key || '',
                    mp_webhook_secret: orgToEdit.mp_webhook_secret || '',
                    resend_api_key: orgToEdit.resend_api_key || '',
                    resend_from_email: orgToEdit.resend_from_email || '',
                    youtube_channel_id: orgToEdit.youtube_channel_id || '',
                });
            } else {
                setFormData({
                    name: '', slug: '', logo_url: '', default_trial_days: 7, default_plan_code: 'pro',
                    mp_access_token: '', mp_public_key: '', mp_webhook_secret: '',
                    resend_api_key: '', resend_from_email: '', youtube_channel_id: ''
                });
            }
        }
    }, [isOpen, orgToEdit]);

    const [uploadingImage, setUploadingImage] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const folderName = formData.slug || 'general';

        try {
            setUploadingImage(true);
            const url = await adminService.uploadImage(file, folderName);
            setFormData(prev => ({ ...prev, logo_url: url }));
            toast.success("Imagen subida correctamente");
        } catch (error: any) {
            toast.error(error.message || "Error al subir la imagen");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                logo_url: formData.logo_url || undefined,
                mp_access_token: formData.mp_access_token || undefined,
                mp_public_key: formData.mp_public_key || undefined,
                mp_webhook_secret: formData.mp_webhook_secret || undefined,
                resend_api_key: formData.resend_api_key || undefined,
                resend_from_email: formData.resend_from_email || undefined,
                youtube_channel_id: formData.youtube_channel_id || undefined,
            };

            if (orgToEdit && orgToEdit.id) {
                await adminService.updateOrganization(orgToEdit.id, payload);
                toast.success("Organización actualizada correctamente");
            } else {
                await adminService.createOrganization(payload);
                toast.success("Organización creada correctamente");
            }
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
            <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-white">{orgToEdit ? 'Editar Organización' : 'Nueva Organización'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X size={24} /></button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
                    <form id="org-form" onSubmit={handleSubmit} className="space-y-8">
                        {/* GENERAL */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Información General</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Nombre de la Academia</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="Ej: Bulls Academy" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400 flex items-center gap-1"><LinkIcon size={12}/> Slug Único</label>
                                    <input required type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="ej: bulls-academy"/>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
                                        <span className="flex items-center gap-1"><ImageIcon size={12}/> Logo de la Academia</span>
                                        {uploadingImage && <span className="text-emerald-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Subiendo...</span>}
                                    </label>
                                    <div className="flex gap-2">
                                        <input type="url" value={formData.logo_url} onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                               className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="URL o subir archivo..." />
                                        <label className="bg-slate-800 hover:bg-slate-700 text-white px-4 rounded-lg flex items-center justify-center cursor-pointer transition whitespace-nowrap">
                                            <span>Subir</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImage} />
                                        </label>
                                    </div>
                                    {formData.logo_url && (
                                        <div className="mt-2 w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 p-1 flex items-center justify-center overflow-hidden">
                                            <img src={formData.logo_url} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* PLANES Y PRUEBA */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Plan y Prueba</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Días de prueba por defecto</label>
                                    <input required type="number" min="0" value={formData.default_trial_days} onChange={e => setFormData({ ...formData, default_trial_days: parseInt(e.target.value) || 0 })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Código del Plan por Defecto</label>
                                    <input required type="text" value={formData.default_plan_code} onChange={e => setFormData({ ...formData, default_plan_code: e.target.value })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="ej: pro" />
                                    <p className="text-[10px] text-slate-500 mt-1">Este plan debe crearse posteriormente para que la suscripción funcione.</p>
                                </div>
                            </div>
                        </section>

                        {/* MERCADO PAGO */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Mercado Pago</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Public Key</label>
                                        <input type="text" value={formData.mp_public_key} onChange={e => setFormData({ ...formData, mp_public_key: e.target.value })}
                                               className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="APP_USR-..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-400">Webhook Secret</label>
                                        <input type="password" value={formData.mp_webhook_secret} onChange={e => setFormData({ ...formData, mp_webhook_secret: e.target.value })}
                                               className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Access Token</label>
                                    <input type="password" value={formData.mp_access_token} onChange={e => setFormData({ ...formData, mp_access_token: e.target.value })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="APP_USR-..." />
                                </div>
                            </div>
                        </section>

                        {/* COMUNICACIONES (RESEND) & OTROS */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Comunicaciones y Extras</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Resend API Key</label>
                                    <input type="password" value={formData.resend_api_key} onChange={e => setFormData({ ...formData, resend_api_key: e.target.value })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="re_..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-400">Resend From Email</label>
                                    <input type="email" value={formData.resend_from_email} onChange={e => setFormData({ ...formData, resend_from_email: e.target.value })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="noreply@miacademia.com" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-medium text-slate-400">YouTube Channel ID</label>
                                    <input type="text" value={formData.youtube_channel_id} onChange={e => setFormData({ ...formData, youtube_channel_id: e.target.value })}
                                           className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-emerald-500 outline-none" placeholder="UC..." />
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-800 shrink-0 flex gap-3 justify-end bg-slate-900 rounded-b-xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancelar</button>
                    <button type="submit" form="org-form" disabled={loading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {orgToEdit ? 'Guardar Cambios' : 'Crear Organización'}
                    </button>
                </div>
            </div>
        </div>
    );
};
