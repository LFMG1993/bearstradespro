import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        gtag?: (command: string, ...args: any[]) => void;
        dataLayer?: unknown[];
    }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENT_ID;
const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID;

export const Analytics = () => {
    const location = useLocation();

    // Rastrear cambios de página
    useEffect(() => {
        if (typeof window.gtag === 'function') {
            window.gtag('config', GA_MEASUREMENT_ID, {
                page_path: location.pathname + location.search,
            });
        }
    }, [location]);

    // Cargar Microsoft Clarity
    useEffect(() => {
        if (!CLARITY_PROJECT_ID) return;
        if ((window as any).clarity) return;

        (function (c: any, l: any, a: string, r: string, i: string) {
            let t: any, y: any;
            c[a] = c[a] || function () {
                (c[a].q = c[a].q || []).push(arguments);
            };
            t = l.createElement(r);
            t.async = 1;
            t.src = "https://www.clarity.ms/tag/" + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
    }, []);

    return null;
};