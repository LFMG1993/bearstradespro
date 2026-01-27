import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Mail, Lock, User, ArrowRight, AlertCircle, Phone} from 'lucide-react';
import {authService} from '../services/auth.service';
import {countries} from '../data/countries';

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({fullName: '', email: '', password: '', phone: ''});
    const [agreed, setAgreed] = useState(false);
    const [countryCode, setCountryCode] = useState('+57');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const fullPhoneNumber = `${countryCode}${formData.phone}`;

        try {
            await authService.register({...formData, phone: fullPhoneNumber});
            navigate('/');
        } catch (err: any) {
            console.error("Error detallado de registro Supabase:", err);
            let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
            if (err.message?.includes("violates row-level security policy")) {
                errorMessage = "Error de permisos al crear el perfil. Por favor, contacta a soporte.";
            } else if (err.message?.includes("Database error saving new user")) {
                errorMessage = "Error interno del servidor al guardar el perfil. Por favor, contacta a soporte.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gray-900">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Crea tu cuenta</h2>
                    <p className="mt-2 text-gray-400">Comienza tu prueba de 7 días gratis</p>
                </div>

                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-sm">
                    {error && (
                        <div
                            className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
                            <AlertCircle size={16}/>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                                    placeholder="Juan Pérez"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Teléfono (WhatsApp)</label>
                            <div className="relative flex gap-2">
                                {/* Selector de País */}
                                <div className="relative w-32">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-full appearance-none bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-3 pr-8 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition cursor-pointer"
                                    >
                                        {countries.map((country) => (
                                            <option key={country.iso} value={country.code}
                                                    className="bg-gray-800 text-white">
                                                {country.flag} {country.code}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Input de Número Local */}
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                                        placeholder="300 123 4567"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-gray-900/50 border border-gray-600 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 mt-0.5 rounded border-gray-500 bg-gray-700 text-emerald-500 focus:ring-emerald-600 cursor-pointer"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <div className="text-sm leading-tight">
                                <label htmlFor="terms" className="text-gray-300">
                                    He leído y acepto la <Link to="/privacy" target="_blank" rel="noopener noreferrer"
                                                               className="text-emerald-400 hover:underline">Política de
                                    Privacidad</Link> y la <Link to="/risk-disclaimer" target="_blank"
                                                                 rel="noopener noreferrer"
                                                                 className="text-emerald-400 hover:underline">Advertencia
                                    de Riesgos</Link>.
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !agreed}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando cuenta...' : <>Registrarme <ArrowRight size={20}/></>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Inicia
                                Sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};