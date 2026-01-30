import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export const PaymentResultPage = ({ status }: { status: 'success' | 'failure' | 'pending' }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        // Redirigir al perfil después de 5 segundos
        const timer = setTimeout(() => {
            navigate('/profile');
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-md w-full text-center space-y-6">
                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="text-emerald-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">¡Pago Exitoso!</h2>
                        <p className="text-gray-400">Tu suscripción se ha activado correctamente. ID de pago: {paymentId}</p>
                    </>
                )}

                {status === 'failure' && (
                    <>
                        <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="text-rose-500" size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Pago Fallido</h2>
                        <p className="text-gray-400">Hubo un problema al procesar tu pago. Por favor intenta nuevamente.</p>
                    </>
                )}

                <p className="text-sm text-gray-500 animate-pulse">Redirigiendo a tu perfil...</p>
            </div>
        </div>
    );
};