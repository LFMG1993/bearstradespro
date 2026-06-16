import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'pt', name: 'Português', flag: '🇧🇷' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
        localStorage.setItem('i18nextLng', code);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-muted)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors text-[var(--foreground)]"
            >
                <Globe size={18} className="text-[var(--foreground-muted)]" />
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline text-sm font-medium">{currentLang.name}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--background-muted)] transition-colors
                                ${i18n.language === lang.code ? 'bg-[var(--background-muted)] font-bold text-[var(--primary)]' : 'text-[var(--foreground)]'}
                            `}
                        >
                            <span className="text-xl">{lang.flag}</span>
                            <span className="text-sm">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
