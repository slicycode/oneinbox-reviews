/**
 * JSON-LD component for structured data
 * Replaces next-seo JsonLd components which have compatibility issues with Next.js 16
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Helper to create WebPage schema
export function createWebPageJsonLd(props: {
  url: string;
  title: string;
  description: string;
  publisherName: string;
  publisherUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": props.url,
    name: props.title,
    description: props.description,
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: props.publisherName,
      url: props.publisherUrl,
    },
  };
}

// Helper to create Article schema
export function createArticleJsonLd(props: {
  url: string;
  title: string;
  description: string;
  images: string[];
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherName: string;
  publisherLogo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": props.url,
    },
    headline: props.title,
    description: props.description,
    image: props.images,
    datePublished: props.datePublished,
    dateModified: props.dateModified || props.datePublished,
    author: {
      "@type": "Person",
      name: props.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: props.publisherName,
      logo: props.publisherLogo ? {
        "@type": "ImageObject",
        url: props.publisherLogo,
      } : undefined,
    },
  };
}

// Helper to create BreadcrumbList schema
export function createBreadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}
