import {Helmet} from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonicalUrl?: string;
    imageUrl?: string;
    ogImage?: string;
    noIndex?: boolean;
    keywords?: string;
}

/**
 * Componente reutilizable para gestionar las etiquetas de SEO de cada página.
 * Proporciona valores por defecto y permite sobreescribirlos.
 */
export const SEO = ({title, description, canonicalUrl, ogImage, noIndex, keywords}: SEOProps) => {
    const siteName = "Bears Trades Pro";
    const fullTitle = `${title} | ${siteName}`;
    const defaultOgImage = "https://bearstrade.org/og-image.jpg";
    const finalOgImage = ogImage || defaultOgImage;
    const siteUrl = "https://bearstrade.org";
    const finalCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
    const defaultKeywords = "trading, señales de forex, indices sinteticos, academia de trading, inversiones online, copytrading";
    const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;


    const businessSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Bears Trades Pro",
        "@id": siteUrl,
        "url": siteUrl,
        "logo": "https://bearstrade.org/logo-para-schema.png",
        "description": "Plataforma profesional de señales de trading y educación financiera.",
        "sameAs": [
            "https://www.instagram.com/bearstradespro",
            "https://www.facebook.com/bearstradespro",
            "https://twitter.com/bearstradespro"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+573125212894",
            "contactType": "customer service",
            "areaServed": "World",
            "availableLanguage": ["es", "en"]
        },
    };

    return (
        <Helmet>
            {noIndex && <meta name="robots" content="noindex, nofollow"/>}
            <title>{fullTitle}</title>
            <meta name="description" content={description}/>
            <meta name="keywords" content={finalKeywords} />
            <link rel="canonical" href={finalCanonicalUrl}/>

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle}/>
            <meta property="og:description" content={description}/>
            <meta property="og:image" content={finalOgImage}/>
            <meta property="og:url" content={finalCanonicalUrl}/>
            <meta property="og:site_name" content={siteName}/>

            {/* Twitter Cards */}
            <meta name="twitter:title" content={fullTitle}/>
            <meta name="twitter:description" content={description}/>
            <meta name="twitter:image" content={finalOgImage}/>
            <meta name="twitter:card" content="summary_large_image" />

            {/* Schema.org JSON-LD */}
            <script type="application/ld+json">
                {JSON.stringify(businessSchema)}
            </script>
        </Helmet>
    );
};