import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentResultPageProps {
    status: 'success' | 'failure' | 'pending';
}

export const PaymentResultPage = ({ status }: PaymentResultPageProps) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('payment_id');
    const externalRef = searchParams.get('external_reference');

    useEffect(() => {
        if (status === 'success') {
            // Redirigir automáticamente al perfil después de 5 segundos si fue exitoso
            const timer = setTimeout(() => {
                navigate('/profile');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [status, navigate]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-md w-full text-center space-y-6 shadow-xl">

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/10">
                            <CheckCircle className="text-emerald-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">¡Pago Exitoso!</h2>
                        <p className="text-gray-400">
                            Tu suscripción se ha activado correctamente. <br/>
                            <span className="text-xs text-gray-500 mt-2 block">ID de referencia: {paymentId || externalRef}</span>
                        </p>
                        <div className="pt-4">
                            <p className="text-sm text-emerald-400 animate-pulse mb-4">Redirigiendo a tu perfil...</p>
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                            >
                                Ir al Perfil ahora
                            </button>
                        </div>
                    </>
                )}

                {status === 'failure' && (
                    <>
                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-500/10">
                            <XCircle className="text-rose-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Pago Fallido</h2>
                        <p className="text-gray-400">
                            Hubo un problema al procesar tu pago. No se ha realizado ningún cargo.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                            >
                                Volver e intentar de nuevo
                            </button>
                        </div>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-yellow-500/10">
                            <Clock className="text-yellow-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Pago Pendiente</h2>
                        <p className="text-gray-400">
                            Estamos procesando tu pago. Esto puede tomar unos minutos. Te notificaremos cuando se complete.
                        </p>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                            >
                                Volver al Perfil
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};