// ─── Listing: všechny case studies ────────────────────────────────────────────
export const ALL_CASE_STUDIES_QUERY = `
  *[_type == "caseStudy"] | order(order asc, year desc) {
    _id,
    title, titleEn,
    "slug": slug.current,
    tagline, taglineEn,
    year,
    services,
    industry,
    coverImage,
    cardVideo,
    featured
  }
`

// ─── Featured: pro homepage ────────────────────────────────────────────────────
export const FEATURED_CASE_STUDIES_QUERY = `
  *[_type == "caseStudy" && featured == true] | order(order asc) [0...6] {
    _id,
    title, titleEn,
    "slug": slug.current,
    tagline, taglineEn,
    year,
    services,
    coverImage,
    cardVideo
  }
`

// ─── Legal pages ───────────────────────────────────────────────────────────────
export const LEGAL_PAGE_BY_SLUG_QUERY = `
  *[_type == "legalPage" && slug.current == $slug][0] {
    _id, title, titleEn,
    "slug": slug.current,
    body, bodyEn
  }
`

export const ALL_LEGAL_SLUGS_QUERY = `
  *[_type == "legalPage"] { "slug": slug.current }
`

// ─── Site Settings (singleton) ────────────────────────────────────────────────
export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings"][0] {
    heroMedia[] {
      _type,
      _key,
      image { asset->, alt, hotspot, crop },
      alt,
      url
    },
    processSteps[] {
      title, titleEn,
      description, descriptionEn
    },
    clientLogos[] {
      _key,
      name,
      logoUrl,
      url
    },
    chipPreviews[] {
      category,
      images[] { asset->, hotspot, crop }
    }

  }
`

// ─── Blog: všechny posty pro listing ─────────────────────────────────────────
export const ALL_BLOG_POSTS_QUERY = `
  *[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title, titleEn,
    "slug": slug.current,
    description, descriptionEn,
    coverImage,
    publishedAt,
    category,
    featured,
    "bodyChars": length(pt::text(body)),
    "bodyCharsEn": length(pt::text(bodyEn))
  }
`

// ─── Blog: slugy pro getStaticPaths ───────────────────────────────────────────
export const ALL_BLOG_SLUGS_QUERY = `
  *[_type == "blogPost"] { "slug": slug.current }
`

// ─── Blog: detail postu ───────────────────────────────────────────────────────
export const BLOG_POST_BY_SLUG_QUERY = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title, titleEn,
    "slug": slug.current,
    description, descriptionEn,
    coverImage,
    publishedAt,
    category,
    body, bodyEn
  }
`

// ─── Blog: nav (prev/next) ────────────────────────────────────────────────────
export const ALL_BLOG_NAV_QUERY = `
  *[_type == "blogPost"] | order(publishedAt desc) {
    "slug": slug.current,
    title, titleEn,
    coverImage
  }
`

// ─── Blog: featured posts pro homepage ────────────────────────────────────────
export const FEATURED_BLOG_POSTS_QUERY = `
  *[_type == "blogPost"] | order(publishedAt desc) [0...4] {
    _id,
    title, titleEn,
    "slug": slug.current,
    description, descriptionEn,
    coverImage,
    publishedAt,
    category
  }
`

// ─── Slugy pro getStaticPaths ──────────────────────────────────────────────────
export const ALL_SLUGS_QUERY = `
  *[_type == "caseStudy"] { "slug": slug.current }
`

// ─── Prev / Next navigace pro case study detail ───────────────────────────────
export const ALL_CASE_STUDY_NAV_QUERY = `
  *[_type == "caseStudy"] | order(order asc, year desc) {
    "slug": slug.current,
    title, titleEn,
    coverImage
  }
`

// ─── Detail case study ─────────────────────────────────────────────────────────
export const CASE_STUDY_BY_SLUG_QUERY = `
  *[_type == "caseStudy" && slug.current == $slug][0] {
    _id,
    title, titleEn,
    tagline, taglineEn,
    client,
    year,
    industry,
    services,
    liveUrl,
    heroVideo,
    cardVideo,
    coverImage,
    brief, briefEn,
    vysledek, vysledekEn,
    gallery[] {
      image,
      videoUrl,
      alt,
      caption
    },
    sections[] {
      heading, headingEn,
      body, bodyEn,
      images[] {
        ...,
        asset->
      }
    },
    credits, creditsEn,
    seoDescription, seoDescriptionEn
  }
`
