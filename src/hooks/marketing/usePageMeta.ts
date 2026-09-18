import { useEffect } from 'react';

export interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertSchema(id: string, schema: Record<string, unknown> | Record<string, unknown>[]) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertLink('canonical', meta.canonical ?? window.location.href);

    if (meta.keywords) {
      upsertMeta('name', 'keywords', meta.keywords);
    }

    upsertMeta('property', 'og:title', meta.ogTitle ?? meta.title);
    upsertMeta('property', 'og:description', meta.ogDescription ?? meta.description);
    upsertMeta('property', 'og:url', meta.canonical ?? window.location.href);
    upsertMeta('property', 'og:type', meta.ogType ?? 'website');
    upsertMeta('property', 'og:image', meta.ogImage ?? 'https://myinsightai.app/Insight-Website-Preview.webp');

    upsertMeta('name', 'twitter:title', meta.twitterTitle ?? meta.ogTitle ?? meta.title);
    upsertMeta('name', 'twitter:description', meta.twitterDescription ?? meta.ogDescription ?? meta.description);
    upsertMeta('name', 'twitter:image', meta.ogImage ?? 'https://myinsightai.app/Insight-Website-Preview.webp');

    if (meta.schema) {
      upsertSchema('page-schema-jsonld', meta.schema);
    }
  }, [meta]);
}
