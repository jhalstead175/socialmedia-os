import React, { useEffect } from 'react';

// NOTE: The icon and image URLs are placeholders as assets cannot be generated.
// They should be replaced with actual files at the specified paths.

export default function Meta() {
  const title = "Rezemai — Resume Builder & Interview Coach";
  const description = "Build tailored resumes for any job description, export ATS-ready PDFs, and practice interviews with real-time feedback. Start free.";
  const imageUrl = `${window.location.origin}/og/rezemai-og.png`;

  useEffect(() => {
    document.title = title;

    const setMeta = (nameOrProperty, content) => {
      let element = document.querySelector(`meta[name="${nameOrProperty}"]`) || document.querySelector(`meta[property="${nameOrProperty}"]`);
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

    setMeta('description', description);
    
    // Favicons
    setLink('icon', '/icons/favicon.ico', { sizes: 'any' });
    setLink('icon', '/icons/favicon.svg', { type: 'image/svg+xml' });
    setLink('apple-touch-icon', '/icons/apple-touch-icon.png');
    
    // Open Graph
    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:image', imageUrl);
    setMeta('og:type', 'website');
    
    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);

  }, [title, description, imageUrl]);

  return null; // This component does not render anything to the DOM itself
}