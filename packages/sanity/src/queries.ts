import groq from 'groq'

// Query to get all projects with basic information
export const allProjectsQuery = groq`
  *[_type == "project"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    "rawSectors": sectors,
    status,
    tags,
    publishedAt
  }
`;

// Query to get featured projects
export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    status,
    tags,
    publishedAt
  }
`;

// Query to get a single project by slug
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    screenshots,
    videoUrl,
    description,
    shortDescription,
    "sectors": sectors[]->name,
    status,
    tags,
    projectUrl,
    features,
    platforms[]->{
      name,
      slug,
      icon
    },
    publishedAt
  }
`;

// Query to get projects by sector
export const projectsBySectorQuery = groq`
  *[_type == "project" && $sector in sectors[]->slug.current] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    status,
    tags,
    publishedAt
  }
`;

// Query to get projects by status
export const projectsByStatusQuery = groq`
  *[_type == "project" && status == $status] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    status,
    tags,
    publishedAt
  }
`;

// Query to get all premium apps (published only)
export const allPremiumAppsQuery = groq`
  *[_type == "premiumApp" && isPublished == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    isPublished,
    allowMultipleOrganizationPerUser,
    hasTrialUsage,
    isFree,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    price,
    promotion {
      hasPromotion,
      discountPrice,
      startDate,
      endDate,
      isActive
    },
    features,
    platforms {
      desktop {
        windows {
          available
        },
        macos {
          available
        },
        linux {
          available
        }
      },
      mobile {
        android {
          available
        },
        ios {
          available
        }
      },
      web {
        available
      }
    },
    tags,
    publishedAt
  }
`;

// Query to get recent premium apps (for landing page)
export const recentPremiumAppsQuery = groq`
  *[_type == "premiumApp" && isPublished == true] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    isPublished,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    features,
    platforms,
    tags,
    price,
    "promotion": {
      "hasPromotion": coalesce(promotion.hasPromotion, false),
      "discountPrice": promotion.discountPrice,
      "isActive": coalesce(promotion.isActive, false)
    },
    publishedAt
  }
`;

// Query to get featured premium apps (explicitly marked as featured)
export const featuredPremiumAppsQuery = groq`
  *[_type == "premiumApp" && isPublished == true && featured == true] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    isPublished,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    features,
    platforms,
    tags,
    price,
    "promotion": {
      "hasPromotion": coalesce(promotion.hasPromotion, false),
      "discountPrice": promotion.discountPrice,
      "isActive": coalesce(promotion.isActive, false)
    },
    publishedAt
  }
`;

// Query to get a single premium app by slug (published only) - PUBLIC VERSION (no download URLs)
export const premiumAppBySlugQuery = groq`
  *[_type == "premiumApp" && slug.current == $slug && isPublished == true][0] {
    _id,
    title,
    slug,
    isPublished,
    mainImage,
    screenshots,
    video,
    videoUrl,
    description,
    shortDescription,
    "sectors": sectors[]->name,
    price,
    promotion,
    features,
    systemRequirements,
    platforms {
      desktop {
        windows {
          available
        },
        macos {
          available
        },
        linux {
          available
        }
      },
      mobile {
        android {
          available
        },
        ios {
          available
        }
      },
      web {
        available
      }
    },
    tags,
    publishedAt
  }
`;

// Query to get a single premium app with download URLs (for admin/post-purchase use)
export const premiumAppWithDownloadUrlsQuery = groq`
  *[_type == "premiumApp" && slug.current == $slug && isPublished == true][0] {
    _id,
    title,
    slug,
    isPublished,
    allowMultipleOrganizationPerUser,
    hasTrialUsage,
    isFree,
    mainImage,
    screenshots,
    video,
    videoUrl,
    description,
    shortDescription,
    "sectors": sectors[]->name,
    price,
    promotion,
    features,
    systemRequirements,
    platforms,
    tags,
    publishedAt
  }
`;

// Query to get all free apps
export const allFreeAppsQuery = groq`
  *[_type == "freeApp"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    features,
    tags,
    publishedAt
  }
`;

// Query to get a single free app by slug
export const freeAppBySlugQuery = groq`
  *[_type == "freeApp" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    screenshots,
    videoUrl,
    description,
    shortDescription,
    "sectors": sectors[]->name,
    features,
    systemRequirements,
    platforms[]->{
      name,
      slug,
      icon
    },
    downloadUrl,
    webAppUrl,
    tags,
    publishedAt
  }
`;

// Query to get all published trainings
export const allTrainingsQuery = groq`
  *[_type == "training" && isPublished == true] | order(startDate asc, publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    duration,
    price,
    isFree,
    trainingType->{
      name,
      slug,
      icon
    },
    trainingTypes[]->{
      name,
      slug,
      icon
    },
    registrationLink,
    startDate,
    registrationEndDate,
    closeRegistration,
    isPublished,
    location,
    tags,
    featured,
    publishedAt
  }
`;

// Query to get featured published training programs
export const featuredTrainingsQuery = groq`
  *[_type == "training" && featured == true && isPublished == true] | order(startDate asc, publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    duration,
    price,
    isFree,
    trainingType->{
      name,
      slug,
      icon
    },
    trainingTypes[]->{
      name,
      slug,
      icon
    },
    registrationLink,
    startDate,
    registrationEndDate,
    closeRegistration,
    isPublished,
    location,
    tags,
    featured,
    publishedAt
  }
`;

// Query to get a single training program by slug (public - no event links)
export const trainingBySlugQuery = groq`
  *[_type == "training" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    videoUrl,
    description,
    shortDescription,
    duration,
    price,
    isFree,
    trainingType->{
      name,
      slug,
      icon
    },
    trainingTypes[]->{
      name,
      slug,
      icon
    },
    registrationLink,
    startDate,
    endDate,
    registrationEndDate,
    closeRegistration,
    isPublished,
    location,
    instructor,
    prerequisites,
    syllabus,
    maxParticipants,
    registeredParticipants,
    tags,
    featured,
    publishedAt
  }
`;

// Query to get a single training program by slug with event links (for admin/email use)
export const trainingBySlugWithLinksQuery = groq`
  *[_type == "training" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    videoUrl,
    description,
    shortDescription,
    duration,
    price,
    isFree,
    trainingType->{
      name,
      slug,
      icon
    },
    trainingTypes[]->{
      name,
      slug,
      icon
    },
    registrationLink,
    startDate,
    endDate,
    registrationEndDate,
    closeRegistration,
    isPublished,
    location,
    eventLinks[]{
      trainingType->{
        _id,
        name,
        slug,
        icon
      },
      link,
      linkText
    },
    instructor,
    prerequisites,
    syllabus,
    maxParticipants,
    registeredParticipants,
    tags,
    featured,
    publishedAt
  }
`;

// Query to get all training types
export const allTrainingTypesQuery = groq`
  *[_type == "trainingType"] | order(name asc) {
    _id,
    name,
    slug,
    description,
    icon
  }
`;

// Event queries
export const allEventsQuery = groq`
  *[_type == "event" && defined(slug.current)] | order(startDate desc) {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    startDate,
    location,
    tags,
    featured,
    publishedAt
  }
`;

export const featuredEventsQuery = groq`
  *[_type == "event" && featured == true && defined(slug.current)] | order(startDate desc)[0...4] {
    _id,
    title,
    slug,
    mainImage,
    shortDescription,
    startDate,
    location,
    tags,
    featured,
    publishedAt
  }
`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    videoUrl,
    description,
    shortDescription,
    startDate,
    endDate,
    location,
    joiningLink,
    organizer,
    registrationLink,
    tags,
    featured,
    publishedAt
  }
`;

// Query to get cart items by IDs (only published items)
export const cartItemsByIdsQuery = groq`
  *[_type == "premiumApp" && _id in $ids && isPublished == true] {
    _id,
    title,
    slug,
    isPublished,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    price,
    promotion {
      hasPromotion,
      discountPrice,
      startDate,
      endDate,
      isActive
    },
    features,
    platforms {
      desktop {
        windows {
          available
        },
        macos {
          available
        },
        linux {
          available
        }
      },
      mobile {
        android {
          available
        },
        ios {
          available
        }
      },
      web {
        available
      }
    },
    tags,
    publishedAt
  }
`;

// Query to validate if items are still published and available
export const validateCartItemsQuery = groq`
  *[_type == "premiumApp" && _id in $ids] {
    _id,
    isPublished
  }
`;

// Query to get premium apps with provisioning data for checkout/admin
export const premiumAppsWithProvisioningQuery = groq`
  *[_type == "premiumApp" && _id in $ids && isPublished == true] {
    _id,
    title,
    slug,
    isPublished,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    price,
    promotion {
      hasPromotion,
      discountPrice,
      startDate,
      endDate,
      isActive
    },
    features,
    platforms,
    appProvisioning {
      supabaseUrl,
      supabaseAnonKey,
      edgeFunctionName
    },
    tags,
    publishedAt
  }
`;

// Query to get single premium app with provisioning data
export const premiumAppWithProvisioningBySlugQuery = groq`
  *[_type == "premiumApp" && slug.current == $slug && isPublished == true][0] {
    _id,
    title,
    slug,
    isPublished,
    mainImage,
    screenshots,
    video,
    videoUrl,
    description,
    shortDescription,
    "sectors": sectors[]->name,
    price,
    promotion,
    features,
    systemRequirements,
    platforms,
    appProvisioning {
      supabaseUrl,
      supabaseAnonKey,
      edgeFunctionName
    },
    tags,
    publishedAt
  }
`;

export const appsProvisioningDetailsByIdsQuery = groq`
  *[_type == "premiumApp" && _id in $ids && isPublished == true] {
    _id,
    title,
    platforms {
      desktop {
        windows {
          available,
          downloadUrl
        },
        macos {
          available,
          downloadUrl
        },
        linux {
          available,
          downloadUrl
        }
      },
      mobile {
        android {
          available,
          playStoreUrl,
          apkUrl
        },
        ios {
          available,
          appStoreUrl
        }
      },
      web {
        available,
        webAppUrl
      }
    },
    appProvisioning {
      supabaseUrl,
      supabaseAnonKey,
      edgeFunctionName
    },
  }
`;
