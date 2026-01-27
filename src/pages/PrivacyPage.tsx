import {Link} from 'react-router-dom';
import {ArrowLeft, Shield, Lock, Eye, Server, Mail, Database, Bell} from 'lucide-react';

export const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/register" className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
                        <ArrowLeft size={24}/>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
                        <p className="text-emerald-400 text-sm">Última actualización: 26 de Enero de 2026</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm space-y-6">
                    <p>
                        En <strong>Bearstrades Pro</strong> ("nosotros", "nuestro"), accesible desde nuestra aplicación
                        y servicios, una de nuestras principales prioridades es la privacidad de nuestros visitantes y
                        usuarios. Este documento de Política de Privacidad contiene tipos de información que es
                        recolectada y registrada por Bearstrades Pro y cómo la utilizamos.
                    </p>

                    {/* 1. Información que recopilamos */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Eye className="text-blue-400" size={20}/>
                            1. Información que recopilamos
                        </h2>
                        <p>Recopilamos información para proporcionar mejores servicios a todos nuestros usuarios. La
                            información incluye:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li><strong>Información de contacto:</strong> Específicamente su número de teléfono. Este es
                                necesario para el funcionamiento de nuestro servicio de alertas a través de WhatsApp.
                            </li>
                            <li><strong>Información de la cuenta:</strong> Su ID de usuario único generado al
                                registrarse (gestionado a través de Supabase).
                            </li>
                            <li><strong>Datos técnicos:</strong> Información sobre su suscripción a notificaciones Push
                                (endpoint, claves de autenticación p256dh y auth) para enviar alertas directamente a su
                                dispositivo.
                            </li>
                        </ul>
                    </section>

                    {/* 2. Cómo utilizamos su información */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Server className="text-purple-400" size={20}/>
                            2. Cómo utilizamos su información
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li>Proporcionar, operar y mantener nuestro servicio de señales de trading.</li>
                            <li>Enviar alertas y notificaciones: Utilizamos su número de teléfono exclusivamente para
                                enviarle señales de trading, actualizaciones de mercado y notificaciones críticas a
                                través de la API de WhatsApp Business.
                            </li>
                            <li>Enviar notificaciones Push a su navegador o dispositivo móvil con actualizaciones en
                                tiempo real.
                            </li>
                            <li>Prevenir fraudes y asegurar la integridad de nuestro servicio.</li>
                        </ul>
                    </section>

                    {/* 3. Uso de la API de WhatsApp */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Bell className="text-emerald-400" size={20}/>
                            3. Uso de la API de WhatsApp (Meta Platforms, Inc.)
                        </h2>
                        <p>Para el envío de mensajes a través de WhatsApp, utilizamos los servicios proporcionados por
                            Meta Platforms, Inc. Al utilizar nuestro servicio, usted acepta que:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li>Su número de teléfono sea procesado por la API de WhatsApp Business para la entrega de
                                mensajes.
                            </li>
                            <li>No compartimos su número de teléfono con terceros ajenos a la infraestructura necesaria
                                para enviar el mensaje (Meta y nuestros proveedores de nube).
                            </li>
                            <li>Puede optar por dejar de recibir mensajes en cualquier momento respondiendo con la
                                palabra "STOP" o contactando al administrador.
                            </li>
                        </ul>
                    </section>

                    {/* 4. Almacenamiento y Seguridad */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Database className="text-orange-400" size={20}/>
                            4. Almacenamiento y Seguridad de Datos
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li><strong>Base de Datos:</strong> Sus datos son almacenados de forma segura utilizando
                                Supabase, un proveedor de base de datos que cumple con altos estándares de seguridad.
                            </li>
                            <li><strong>Infraestructura:</strong> Nuestro backend opera en Cloudflare Workers,
                                garantizando una transmisión de datos segura y encriptada (HTTPS).
                            </li>
                        </ul>
                        <p className="text-sm text-gray-400 mt-2">
                            Valoramos su confianza al proporcionarnos su información personal, por lo que nos esforzamos
                            por utilizar medios comercialmente aceptables para protegerla. Sin embargo, recuerde que
                            ningún método de transmisión por Internet o método de almacenamiento electrónico es 100%
                            seguro y confiable.
                        </p>
                    </section>

                    {/* 5. Sus Derechos */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Shield className="text-indigo-400" size={20}/>
                            5. Sus Derechos
                        </h2>
                        <p>Usted tiene derecho a:</p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-emerald-500">
                            <li>Acceder a los datos personales que tenemos sobre usted.</li>
                            <li>Solicitar la corrección de datos incorrectos.</li>
                            <li>Solicitar la eliminación de sus datos ("Derecho al olvido"). Si desea eliminar su cuenta
                                y número de teléfono de nuestra base de datos, por favor contáctenos.
                            </li>
                        </ul>
                    </section>

                    {/* 6. Cambios */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Lock className="text-rose-400" size={20}/>
                            6. Cambios en esta Política de Privacidad
                        </h2>
                        <p>
                            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le recomendamos que
                            revise esta página periódicamente para ver si hay cambios. Le notificaremos de cualquier
                            cambio publicando la nueva Política de Privacidad en esta página.
                        </p>
                    </section>

                    {/* 7. Contacto */}
                    <section className="pt-6 border-t border-gray-700">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <Mail className="text-cyan-400" size={20}/>
                            7. Contacto
                        </h2>
                        <p className="mb-2">Si tiene alguna pregunta o sugerencia sobre nuestra Política de Privacidad,
                            no dude en contactarnos en:</p>
                        <a href="mailto:bearspro@proton.me"
                           className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition font-medium">
                            <Mail size={16}/> bearspro@proton.me
                        </a>
                    </section>

                </div>

                <div className="text-center text-gray-500 text-sm">
                    &copy; 2026 Bearstrades Pro. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
};