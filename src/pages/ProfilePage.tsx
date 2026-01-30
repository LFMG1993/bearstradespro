import React, {useState, useEffect} from 'react';
import {useAuthStore} from '../stores/useAuthStore';
import {User, Phone, LogOut, Save, AlertCircle, CheckCircle, Crown, Mail, CreditCard} from 'lucide-react';
import {profileService} from '../services/profile.service';
import {formatDistanceToNow} from 'date-fns';
import {paymentService} from '../services/payment.service';
import {es} from 'date-fns/locale';

export const ProfilePage = () => {
    const {profile, user, signOut, setProfile} = useAuthStore();
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                email: profile.email || user?.email || '',
            });
        }
    }, [profile, user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedProfile = await profileService.updateProfile(user.id, formData);
            setProfile(updatedProfile); // Actualiza el store para reflejar cambios al instante
            setSuccess('Perfil actualizado correctamente.');
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!profile || !profile.organization_id) {
            setError("No se encontró información de tu organización.");
            return;
        }

        setLoading(true);
        try {
            // Asumimos plan 'pro' por defecto para la prueba, o podrías tener un selector
            const data = await paymentService.createPreference('pro', profile.organization_id);

            // Redirigir a Mercado Pago
            const url = data.sandbox_init_point || data.init_point;
            window.location.href = url;
        } catch (err: any) {
            setError(err.message || "Error al iniciar el pago.");
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        // El listener onAuthStateChange se encargará de redirigir o limpiar el estado.
    };

    if (!profile) {
        return <div className="text-center text-gray-400 p-10">Cargando perfil...</div>;
    }

    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const isTrialActive = trialEndsAt && trialEndsAt > new Date();

    // Lógica para determinar si necesita pagar
    // Si NO es trial activo Y (está vencido O el estado no es active)
    const needsPayment = !isTrialActive && (profile.subscription_status !== 'active' || (trialEndsAt && trialEndsAt < new Date()));
    const showSubscribeButton = needsPayment || isTrialActive;


    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
                <p className="text-gray-400 text-sm">Gestiona tu información y suscripción.</p>
            </div>

            {/* User Info Card */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex items-center gap-4">
                <div
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20 ring-2 ring-gray-800">
                    {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Crown size={18}
                                                                                         className="text-yellow-400"/> Mi
                    Suscripción</h4>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm">Plan Actual</p>
                        <p className="text-emerald-400 font-bold capitalize">
                            {profile.plan_type?.replace('_', ' ') || 'N/A'}
                        </p>
                    </div>
                    {isTrialActive && trialEndsAt && (
                        <div>
                            <p className="text-gray-400 text-sm text-right">Vence en</p>
                            <p className="text-white font-mono font-bold">
                                {formatDistanceToNow(trialEndsAt, {locale: es, addSuffix: false})}
                            </p>
                        </div>
                    )}
                </div>
                {/* Botón de Pago MercadoPago (Solo si necesita pagar) */}
                {showSubscribeButton && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mb-4">
                            <p className="text-blue-400 text-sm mb-2">
                                {isTrialActive
                                    ? "Estás en tu periodo de prueba. Suscríbete ahora para asegurar tu acceso."
                                    : "Tu suscripción ha finalizado o está inactiva."}
                            </p>
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                <CreditCard size={18} />
                                {loading ? 'Procesando...' : 'Suscribirse con MercadoPago'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Profile Form */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h4 className="font-bold text-white mb-6">Editar Información</h4>

                {error && <div
                    className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
                    <AlertCircle size={16}/>{error}</div>}
                {success && <div
                    className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle size={16}/>{success}</div>}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                            <input type="text" value={formData.full_name}
                                   onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                   className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                            <input type="email" value={formData.email} disabled
                                   className="w-full bg-gray-900/30 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-gray-400 cursor-not-allowed"/>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                            <input type="tel" value={formData.phone}
                                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                   className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"/>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Guardando...' : <><Save size={18}/> Guardar Cambios</>}
                    </button>
                </form>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="w-full bg-gray-800 hover:bg-rose-500/20 text-rose-400 font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 border border-gray-700 hover:border-rose-500/30"
                >
                    <LogOut size={18}/>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};