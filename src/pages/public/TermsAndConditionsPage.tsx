import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsAndConditionsPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
                        <p className="text-emerald-400 text-sm">Última actualización: 26 de Enero de 2026</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm space-y-6">
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="text-emerald-400" size={20} />
                            Aceptación de los Términos
                        </h2>
                        <p>
                            Al acceder y utilizar Bearstrades Pro, usted acepta estar sujeto a estos Términos y Condiciones, así como a nuestra Política de Privacidad y Aviso de Riesgo. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">Uso del Servicio</h2>
                        <p>
                            Nuestra plataforma proporciona herramientas de análisis y señales para mercados financieros. Usted es el único responsable de evaluar los méritos y riesgos asociados con el uso de cualquier información o contenido en la plataforma antes de tomar decisiones.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">Suscripciones y Pagos</h2>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li>El acceso a ciertas funciones requiere una suscripción activa.</li>
                            <li>Los pagos son procesados de forma segura a través de pasarelas de pago de terceros.</li>
                            <li>Usted puede cancelar su suscripción en cualquier momento desde su panel de control. No ofrecemos reembolsos parciales por el tiempo no utilizado.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white">Propiedad Intelectual</h2>
                        <p>
                            Todo el contenido, características y funcionalidades originales de la plataforma son y seguirán siendo propiedad exclusiva de Bearstrades Pro y sus licenciantes.
                        </p>
                    </section>
                </div>

                <div className="text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Bearstrades Pro. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
};
