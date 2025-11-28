import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tag?: string[];
}

const defaultKeywords = [
  // Mots-clés principaux
  '2030maroc',
  '2030 maroc',
  'maroc 2030',
  'Maroc 2030',
  'Maroc tourisme',
  'voyage Maroc',
  'vacances Maroc',
  'tourisme Maroc',
  'hôtels Maroc',
  'circuits touristiques Maroc',
  'visiter Maroc',
  'séjour Maroc',
  'agence de voyage Maroc',
  'guide touristique Maroc',
  'hébergement Maroc',
  'activités Maroc',
  'désert Maroc',
  'randonnée Maroc',
  'sahara marocain',
  'villes impériales Maroc',
  'côte atlantique Maroc',
  'montagnes Maroc',
  'cuisine marocaine',
  'artisanat marocain'
];

export const SEO = ({
  title = '2030 Maroc - Votre Guide Complet pour Découvrir le Maroc',
  description = 'Découvrez les trésors du Maroc avec 2030 Maroc. Des hôtels de luxe aux expériences authentiques, planifiez votre voyage inoubliable au cœur du Maroc.',
  keywords = [],
  image = '/logo.png',
  type = 'website',
  author = 'Maroc 2030',
  publishedTime,
  modifiedTime,
  section,
  tag = []
}: SEOProps) => {
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])];
  const siteUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  return (
    <Helmet>
      {/* Balises Meta Essentielles */}
      <title>{title.includes('2030') ? title : `2030 Maroc - ${title}`}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="author" content={author} />
      <meta name="geo.region" content="MA" />
      <meta name="geo.placename" content="Morocco" />
      <meta name="language" content="fr" />
      <link rel="canonical" href={siteUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="2030 Maroc" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@2030maroc" />
      
      {/* Balises supplémentaires pour le référencement */}
      <meta name="theme-color" content="#10b981" />
      <meta name="apple-mobile-web-app-title" content="2030 Maroc" />
      <meta name="application-name" content="2030 Maroc" />
      <meta name="msapplication-TileColor" content="#10b981" />
      
      {/* Balises pour les articles */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tag.map((t, i) => (
            <meta key={i} property="article:tag" content={t} />
          ))}
        </>
      )}
    </Helmet>
  );
};
