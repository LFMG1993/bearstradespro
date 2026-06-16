import { useTranslation } from 'react-i18next';

export const LandingFooter = () => {
    const { t } = useTranslation();
    const appUrl = import.meta.env.DEV ? 'http://app.localhost:5173' : 'https://app.bearstrade.org';

    return (
        <footer className="bg-[var(--background-muted)] border-t border-[var(--border)] py-8 px-4">
            <div className="container mx-auto text-center text-[var(--foreground-muted)]">
                <p>&copy; {new Date().getFullYear()} Bears Trades Pro. {t('landing.footer.rights')}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-4 sm:gap-6">
                    <a href={`${appUrl}/privacy`} className="hover:text-[var(--primary)] transition text-sm">{t('landing.footer.privacy')}</a>
                    <a href={`${appUrl}/terms`} className="hover:text-[var(--primary)] transition text-sm">{t('landing.footer.terms')}</a>
                    <a href={`${appUrl}/risk-disclaimer`} className="hover:text-[var(--primary)] transition text-sm">Aviso de Riesgo</a>
                    <a href="mailto:contacto@bearstrade.org" className="hover:text-[var(--primary)] transition text-sm">{t('landing.footer.contact')}</a>
                </div>
                <div className="mt-6 text-xs max-w-3xl mx-auto leading-relaxed">
                    <p>{t('landing.footer.disclaimer')}</p>
                </div>
            </div>
        </footer>
    );
};