import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    noIndex = false,
  } = config

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tripster.com'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl
  const ogImage = image || `${siteUrl}/og-image.jpg`

  return {
    title,
    description,
    keywords: keywords?.join(', '),
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
    },
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Tripster',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    alternates: {
      canonical: fullUrl,
    },
  }
}

export function generateStructuredData(type: 'Organization' | 'Trip' | 'Agency', data: any) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'Organization':
      return {
        ...baseSchema,
        name: data.name || 'Tripster',
        url: data.url || 'https://tripster.com',
        logo: data.logo || 'https://tripster.com/logo.png',
        description: data.description || 'Discover and book amazing trips',
      }
    case 'Trip':
      return {
        ...baseSchema,
        name: data.title,
        description: data.description,
        image: data.images?.[0],
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: 'PKR',
        },
        location: {
          '@type': 'Place',
          name: data.destination,
        },
      }
    case 'Agency':
      return {
        ...baseSchema,
        name: data.name,
        description: data.description,
        image: data.logo,
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.location,
        },
      }
    default:
      return baseSchema
  }
}
