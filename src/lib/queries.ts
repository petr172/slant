// ─── Listing: všechny case studies ────────────────────────────────────────────
export const ALL_CASE_STUDIES_QUERY = `
  *[_type == "caseStudy"] | order(order asc, year desc) {
    _id,
    title,
    "slug": slug.current,
    tagline,
    year,
    services,
    industry,
    coverImage,
    featured
  }
`

// ─── Featured: pro homepage ────────────────────────────────────────────────────
export const FEATURED_CASE_STUDIES_QUERY = `
  *[_type == "caseStudy" && featured == true] | order(order asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    tagline,
    year,
    services,
    coverImage
  }
`

// ─── Slugy pro getStaticPaths ──────────────────────────────────────────────────
export const ALL_SLUGS_QUERY = `
  *[_type == "caseStudy"] { "slug": slug.current }
`

// ─── Detail case study ─────────────────────────────────────────────────────────
export const CASE_STUDY_BY_SLUG_QUERY = `
  *[_type == "caseStudy" && slug.current == $slug][0] {
    _id,
    title,
    tagline,
    client,
    year,
    industry,
    services,
    liveUrl,
    heroVideo,
    coverImage,
    sections[] {
      heading,
      body,
      images[] {
        ...,
        asset->
      }
    },
    credits,
    seoDescription
  }
`
