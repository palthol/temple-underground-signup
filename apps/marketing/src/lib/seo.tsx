import { useEffect } from 'react'
import { siteConfig } from '../config/site'

interface SEOProps {
  title?: string
  description?: string
  pathname?: string
}

function setMetaTag(attribute: 'name' | 'property', key: string, content: string): void {
  const selector = `meta[${attribute}="${key}"]`
  let tag = document.querySelector(selector) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

export function useSeo({ title, description, pathname }: SEOProps): void {
  useEffect(() => {
    const finalTitle = title ?? siteConfig.seo.defaultTitle
    const finalDescription = description ?? siteConfig.seo.defaultDescription
    const finalUrl = pathname ? `${siteConfig.business.websiteUrl}${pathname}` : siteConfig.business.websiteUrl

    document.title = finalTitle
    setMetaTag('name', 'description', finalDescription)
    setMetaTag('property', 'og:title', finalTitle)
    setMetaTag('property', 'og:description', finalDescription)
    setMetaTag('property', 'og:url', finalUrl)
    setMetaTag('property', 'og:image', siteConfig.seo.ogImage)
  }, [description, pathname, title])
}

export function LocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: siteConfig.business.name,
    description: siteConfig.seo.defaultDescription,
    telephone: siteConfig.business.phone,
    email: siteConfig.business.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.business.addressLine1,
      addressLocality: siteConfig.business.cityStateZip,
      addressCountry: 'US',
    },
    url: siteConfig.business.websiteUrl,
    sameAs: Object.values(siteConfig.socials),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '15:00',
        closes: '17:00',
      },
    ],
  }

  return <script type="application/ld+json">{JSON.stringify(schema)}</script>
}
