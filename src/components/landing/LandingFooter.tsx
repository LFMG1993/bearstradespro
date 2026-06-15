export const LandingFooter = () => {
    const appUrl = import.meta.env.DEV ? 'http://app.localhost:5173' : 'https://app.bearstrade.org';

    return (
        <footer className="bg-[var(--background-muted)] border-t border-[var(--border)] py-8 px-4">
            <div className="container mx-auto text-center text-[var(--foreground-muted)]">
                <p>&copy; {new Date().getFullYear()} Bears Trades Pro. Todos los derechos reservados.</p>
                <div className="mt-4 flex justify-center gap-6">
                    <a href={`${appUrl}/privacy`} className="hover:text-[var(--foreground)] transition text-sm">Política de Privacidad</a>
                    <a href={`${appUrl}/risk-disclaimer`} className="hover:text-[var(--foreground)] transition text-sm">Aviso de Riesgo</a>
                </div>
                <div className="mt-4 text-xs">
                    <p>El trading de instrumentos financieros conlleva un alto nivel de riesgo y puede no ser adecuado para todos los inversores.
                        Antes de decidirse a invertir, debe considerar cuidadosamente sus objetivos de inversión, nivel de experiencia y apetito por el riesgo.
                    </p>
                </div>
            </div>
        </footer>
    );
};