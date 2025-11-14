import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

export const SEO = ({
  title = 'Maroc 2030 - Découvrez le Maroc',
  description = 'Voyagez à travers le Maroc et découvrez des expériences uniques',
  keywords = ['Maroc', 'tourisme', 'voyage', 'hôtels', 'activités'],
  image = '/logo.png'
}: SEOProps) => {
  const siteUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={siteUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
