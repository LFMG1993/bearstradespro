import * as React from "react";
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {supabase} from '../../lib/supabase';
import {ShieldCheck, Loader2, AlertCircle, Lock} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Supabase Auth
            const {data: authData, error: authError} = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw new Error("Credenciales inválidas");
            if (!authData.user) throw new Error("No se pudo iniciar sesión");

            const {data: roleData, error: roleError} = await supabase
                .from('user_roles')
                .select('roles!inner(name)')
                .eq('user_id', authData.user.id)
                .in('roles.name', ['Super Admin', 'Admin'])
                .maybeSingle();

            if (roleError) {
                console.error("Error verificando rol de admin:", roleError);
                throw roleError;
            }

            if (!roleData) {
                await supabase.auth.signOut();
                throw new Error("ACCESO DENEGADO: No tienes permisos administrativos.");
            }

            toast.success("Bienvenido");
            navigate('/admin');

        } catch (err: any) {
            setError(err.message);
            await supabase.auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">

            {/* Header Visual */}
            <div className="mb-8 text-center">
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
                    <ShieldCheck size={32}/>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Bearstrades <span
                    className="text-emerald-500">Admin</span></h1>
                <p className="text-slate-400 mt-2">Acceso restringido al personal autorizado</p>
            </div>

            {/* Tarjeta de Login */}
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <form onSubmit={handleAdminLogin} className="space-y-6">

                    {error && (
                        <div
                            className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-3 text-rose-400 text-sm">
                            <AlertCircle size={18}/>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Corporativo</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Contraseña</label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                            <Lock className="absolute right-3 top-3.5 text-slate-600" size={18}/>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20}/>
                                Verificando Credenciales...
                            </>
                        ) : (
                            "Ingresar al Sistema"
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center text-xs text-slate-600">
                <p>Sistema protegido por autenticación de doble factor (RBAC).</p>
                <p>Cualquier intento de acceso no autorizado será registrado.</p>
            </div>
        </div>
    );
};