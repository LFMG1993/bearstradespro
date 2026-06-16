import { useState } from 'react';
import { LogIn, Menu, X } from 'lucide-react';
import { ThemeToggle } from '../general/ThemeToggle';
import { LanguageSelector } from '../general/LanguageSelector';
import { useTheme } from '../../context/ThemeContext.tsx';
import logoDark from '../../assets/bears_black.gif';
import logoLight from '../../assets/bears_white.gif';
import { useTranslation } from 'react-i18next';

export const LandingHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme } = useTheme();
    const { t } = useTranslation();
    const appUrl = import.meta.env.DEV ? 'http://app.localhost:5173' : 'https://app.bearstrade.org';

    const logo = theme === 'dark' ? logoDark : logoLight;

    return (
        <header className="absolute top-0 left-0 right-0 z-20 py-4 px-4 sm:px-6 lg:px-8 bg-transparent text-[var(--foreground)]">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <a href="/" className="flex items-center gap-2">
                    <img src={logo} alt="Bears Trades Pro Logo" className="h-12 w-auto" />
                    <span className="text-xl font-bold tracking-wider hidden sm:inline">
                         Bears<span className="text-[var(--primary)]">Trades</span>Pro
                    </span>
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <LanguageSelector />
                    <ThemeToggle />
                    <a href={`${appUrl}/login`} className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition text-sm font-medium flex items-center gap-2">
                        <LogIn size={16} /> Ingresar
                    </a>
                    <a href={`${appUrl}/register`} className="bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold py-2 px-5 rounded-lg transition text-sm">
                        {t('landing.hero.cta')}
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-2">
                    <LanguageSelector />
                    <ThemeToggle />
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[var(--background-muted)] border-t border-b border-[var(--border)] shadow-lg">
                    <div className="container mx-auto flex flex-col items-center gap-4 py-6">
                        <a href={`${appUrl}/login`} className="text-[var(--foreground)] hover:text-[var(--primary)] transition text-base font-medium flex items-center gap-2">
                            <LogIn size={16} /> Ingresar
                        </a>
                        <a href={`${appUrl}/register`} className="w-full text-center bg-[var(--primary)] hover:opacity-90 text-white font-bold py-3 px-5 rounded-lg transition text-base">
                            Comenzar Gratis
                        </a>
                    </div>
                </div>
            )}
        </header>
    );
};