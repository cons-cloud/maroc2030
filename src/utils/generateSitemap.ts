import { supabase } from '../lib/supabaseClient';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { format } from 'date-fns';

// Types pour les données de la base de données
interface Page {
  slug: string;
  updated_at: string;
}

interface Hotel extends Page {
  type: 'hotel';
}

interface Circuit extends Page {
  type: 'circuit';
}

interface Article extends Page {
  type: 'article';
}

export async function generateSitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://2030maroc.com';
  const alternateUrls = [
    'https://2030maroc.com',
    'https://maroc2030.com',
    'https://www.2030maroc.com',
    'https://www.maroc2030.com'
  ];

  try {
    // Récupérer les données dynamiques depuis la base de données
    const [
      { data: hotels },
      { data: circuits },
      { data: articles },
      { data: villes },
      { data: categories }
    ] = await Promise.all([
      supabase.from('hotels').select('slug, updated_at'),
      supabase.from('circuits').select('slug, updated_at'),
      supabase.from('articles').select('slug, updated_at'),
      supabase.from('villes').select('slug'),
      supabase.from('categories').select('slug')
    ]);

    // Pages statiques
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/hotels', changefreq: 'daily', priority: 0.9 },
      { url: '/circuits', changefreq: 'daily', priority: 0.9 },
      { url: '/appartements', changefreq: 'daily', priority: 0.9 },
      { url: '/voitures', changefreq: 'daily', priority: 0.8 },
      { url: '/guides', changefreq: 'weekly', priority: 0.7 },
      { url: '/blog', changefreq: 'weekly', priority: 0.7 },
      { url: '/a-propos', changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.6 },
      { url: '/mentions-legales', changefreq: 'yearly', priority: 0.3 },
      { url: '/politique-confidentialite', changefreq: 'yearly', priority: 0.3 },
      { url: '/cgv', changefreq: 'yearly', priority: 0.3 },
    ];

    // Fonction pour formater les URLs des pages dynamiques
    const formatDynamicPages = (items: Page[] | null, basePath: string) => {
      if (!items) return [];
      return items.map(item => ({
        url: `/${basePath}/${item.slug}`,
        lastmod: item.updated_at ? format(new Date(item.updated_at), 'yyyy-MM-dd') : undefined,
        changefreq: 'weekly',
        priority: 0.8
      }));
    };

    // Générer les URLs pour les villes et catégories
    const villePages = (villes || []).map(ville => ({
      url: `/destinations/${ville.slug}`,
      changefreq: 'weekly',
      priority: 0.7
    }));

    const categoryPages = (categories || []).map(cat => ({
      url: `/categories/${cat.slug}`,
      changefreq: 'weekly',
      priority: 0.7
    }));

    // Combiner toutes les URLs
    const allUrls = [
      ...staticPages,
      ...formatDynamicPages(hotels, 'hotels'),
      ...formatDynamicPages(circuits, 'circuits'),
      ...formatDynamicPages(articles, 'blog'),
      ...villePages,
      ...categoryPages
    ];

    // Créer le flux du sitemap
    const stream = new SitemapStream({
      hostname: baseUrl,
      xmlns: {
        xhtml: true,
        news: false,
        image: false,
        video: false
      }
    });

    // Ajouter les URLs alternatives
    alternateUrls.forEach(altUrl => {
      if (altUrl !== baseUrl) {
        allUrls.unshift({
          url: altUrl,
          links: alternateUrls
            .filter(url => url !== altUrl)
            .map(url => ({
              lang: 'fr',
              url: url
            })),
          changefreq: 'daily',
          priority: 1.0
        });
      }
    });

    // Écrire les URLs dans le flux
    allUrls.forEach(item => {
      stream.write({
        url: item.url,
        changefreq: item.changefreq,
        priority: item.priority,
        lastmod: 'lastmod' in item ? item.lastmod : undefined,
        links: 'links' in item ? item.links : undefined
      });
    });

    stream.end();
    const sitemap = await streamToPromise(Readable.from(stream));
    
    return sitemap.toString();
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error);
    throw error;
  }
}
