import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ShieldOff, UserX, Info } from 'lucide-react';

export const RiskDisclaimerPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/register" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Advertencia de Riesgos y Descargo de Responsabilidad</h1>
                        <p className="text-rose-400 text-sm">Lea atentamente antes de continuar</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm space-y-6">
                    <section className="space-y-3 p-4 bg-rose-900/20 border border-rose-500/30 rounded-lg">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="text-rose-400" size={20} />
                            Advertencia General de Riesgos
                        </h2>
                        <p>
                            Recuerde que el comercio en la plataforma implica riesgos financieros significativos. Usted podría perder parte o la totalidad de su inversión. Por consiguiente, antes de tomar una decisión, le recomendamos evaluar los riesgos, los costes y los objetivos de la inversión, así como sus experiencias y otros factores. Consulte con un profesional financiero independiente si fuera necesario.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <UserX className="text-yellow-400" size={20} />
                            Precauciones de Seguridad
                        </h2>
                        <p>Para evitar exponer su inversión a riesgos innecesarios, le recomendamos encarecidamente seguir estas reglas:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li><strong>No comercie</strong> ni invierta siguiendo los consejos de personas que no conoce o que no estén acreditadas.</li>
                            <li><strong>No realice</strong> actividades financieras con personas u organizaciones de las que no sepa nada o sobre las que no pueda verificar información.</li>
                            <li><strong>No revele</strong> su situación financiera a nadie.</li>
                            <li><strong>No se fíe</strong> de quienes le hablan de "oportunidades de inversión exclusivas" y le apresuran a tomar una decisión.</li>
                            <li><strong>No facilite</strong> los datos de su cuenta, sus números de identificación y otra información confidencial a personas sospechosas.</li>
                            <li><strong>No confíe</strong> en los proyectos que prometen una rentabilidad inusualmente alta.</li>
                            <li><strong>No facilite nunca</strong> los datos de su cuenta a nadie.</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShieldOff className="text-blue-400" size={20} />
                            Descargo de Responsabilidad sobre el Servicio
                        </h2>
                        <p>
                            Bearstrades Pro es una plataforma que proporciona herramientas y señales de trading con fines educativos e informativos. La información contenida en nuestra aplicación y comunicaciones no supone un asesoramiento en materia de inversión.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li>Bearstrades Pro <strong>no presta</strong> servicios financieros, de inversión o de corretaje.</li>
                            <li><strong>No participamos, controlamos o influimos</strong> en sus operaciones comerciales.</li>
                            <li><strong>No abrimos ni proporcionamos</strong> cuentas comerciales reales (brokers).</li>
                            <li><strong>No tenemos acceso</strong> a su cuenta de trading, su saldo, o sus transacciones.</li>
                            <li><strong>No participamos</strong> en los depósitos y retiradas de fondos de su broker.</li>
                            <li>Bearstrades Pro <strong>no se hace responsable</strong> de las decisiones de inversión que usted tome ni de las pérdidas que pueda sufrir.</li>
                        </ul>
                    </section>

                    <section className="pt-6 border-t border-gray-700">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <Info className="text-cyan-400" size={20}/>
                            Aceptación de Términos
                        </h2>
                        <p>
                            Al marcar la casilla de aceptación en la página de registro y crear una cuenta, usted confirma que ha leído, entendido y aceptado los riesgos y términos descritos en este documento. Si no está de acuerdo, no debe continuar con el registro.
                        </p>
                    </section>
                </div>

                <div className="text-center text-gray-500 text-sm">
                    &copy; 2026 Bearstrades Pro. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
};