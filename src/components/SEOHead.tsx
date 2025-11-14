import { Helmet } from 'react-helmet-async';
import { SEO_CONFIG } from '../config/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  structuredData,
}) => {
  const fullTitle = title || SEO_CONFIG.defaultTitle;
  const fullDescription = description || SEO_CONFIG.defaultDescription;
  const fullKeywords = keywords || SEO_CONFIG.defaultKeywords.join(', ');
  const fullCanonical = canonical || SEO_CONFIG.siteUrl;
  const fullOgImage = ogImage || `${SEO_CONFIG.siteUrl}${SEO_CONFIG.ogImage}`;

  return (
    <Helmet>
      {/* Titre et description */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonical} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content={SEO_CONFIG.twitterCard} />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content={SEO_CONFIG.twitterSite} />
      <meta name="twitter:creator" content={SEO_CONFIG.twitterCreator} />

      {/* Langues alternatives */}
      <link rel="alternate" hrefLang="fr" href={fullCanonical} />
      <link rel="alternate" hrefLang="ar" href={`${fullCanonical}?lang=ar`} />
      <link rel="alternate" hrefLang="en" href={`${fullCanonical}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={fullCanonical} />

      {/* Données structurées JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Organisation (toujours présent) */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          ...SEO_CONFIG.organization,
        })}
      </script>

      {/* Breadcrumb */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: SEO_CONFIG.siteUrl,
            },
          ],
        })}
      </script>

      {/* Métadonnées supplémentaires */}
      <meta name="author" content="Maroc 2030" />
      <meta name="copyright" content="© 2024 Maroc 2030. Tous droits réservés." />
      <meta name="geo.region" content="MA" />
      <meta name="geo.placename" content="Maroc" />
      <meta name="language" content="French" />
      <meta name="revisit-after" content="1 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Thème */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
    </Helmet>
  );
};

export default SEOHead;
