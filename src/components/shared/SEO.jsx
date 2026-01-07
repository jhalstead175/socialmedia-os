import React, { useEffect } from 'react';

/**
 * Comprehensive SEO Component
 * Handles all meta tags, structured data, and social sharing
 */
export default function SEO({
  title = "Rezemai — Resume Builder & Interview Coach",
  description = "Build ATS-optimized resumes tailored to any job description. Practice interviews with AI coaching and real-time feedback. Start free today.",
  image = "/og-rezemai.png",
  type = "website",
  canonical,
  keywords = "resume builder, interview coach, ATS resume, job application, career tools, resume optimization, AI resume",
  author = "Rezemai",
  twitterHandle = "@rezemai"
}) {
  useEffect(() => {
    // Set document title
    document.title = title;

    const setMeta = (nameOrProperty, content) => {
      if (!content) return;

      let element = document.querySelector(`meta[name="${nameOrProperty}"]`) ||
                   document.querySelector(`meta[property="${nameOrProperty}"]`);

      if (!element) {
        element = document.createElement('meta');
        if (nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('twitter:')) {
          element.setAttribute('property', nameOrProperty);
        } else {
          element.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setLink = (rel, href, options = {}) => {
      if (!href) return;

      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
      if (options.sizes) element.setAttribute('sizes', options.sizes);
      if (options.type) element.setAttribute('type', options.type);
    };

    // Basic meta tags
    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('author', author);
    setMeta('robots', 'index, follow');
    setMeta('googlebot', 'index, follow');

    // Mobile optimization
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5');
    }

    // Canonical URL
    if (canonical) {
      setLink('canonical', canonical);
    } else {
      setLink('canonical', window.location.href.split('?')[0]);
    }

    // Favicons
    setLink('icon', '/icons/favicon.ico', { sizes: 'any' });
    setLink('icon', '/icons/favicon.svg', { type: 'image/svg+xml' });
    setLink('apple-touch-icon', '/icons/apple-touch-icon.png');
    setLink('manifest', '/site.webmanifest');

    // Open Graph (Facebook, LinkedIn, etc.)
    const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:image', fullImageUrl);
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '630');
    setMeta('og:image:alt', title);
    setMeta('og:type', type);
    setMeta('og:url', canonical || window.location.href.split('?')[0]);
    setMeta('og:site_name', 'Rezemai');
    setMeta('og:locale', 'en_US');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:site', twitterHandle);
    setMeta('twitter:creator', twitterHandle);
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', fullImageUrl);
    setMeta('twitter:image:alt', title);

    // Additional SEO
    setMeta('theme-color', '#0B0F14');
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Structured Data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Rezemai",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "79",
        "offerCount": "3"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "127",
        "bestRating": "5",
        "worstRating": "1"
      },
      "description": description,
      "url": window.location.origin,
      "author": {
        "@type": "Organization",
        "name": "Rezemai"
      },
      "featureList": [
        "ATS-optimized resume builder",
        "AI-powered interview coaching",
        "Job description tailoring",
        "Real-time feedback",
        "Professional templates",
        "Export to PDF/DOCX"
      ]
    };

    // Add or update JSON-LD script
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(structuredData);

  }, [title, description, image, type, canonical, keywords, author, twitterHandle]);

  return null;
}
