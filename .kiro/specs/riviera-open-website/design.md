# Design Document - Riviera Open Website

## Overview

The Riviera Open website will be built using Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS v4. The architecture follows a modern, component-based approach with server-side rendering for optimal performance and SEO. The design emphasizes elegance and professionalism, inspired by Reserve Padel's aesthetic, while maintaining excellent user experience across all devices.

The application will use a file-based routing structure with the Next.js App Router, leveraging React Server Components for improved performance. Data will initially be managed through JSON files or TypeScript constants, with the architecture designed to easily transition to a CMS or database in the future.

## Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Image Optimization**: Next.js Image component
- **Fonts**: Google Fonts (elegant serif/sans-serif combination)
- **Icons**: Lucide React or Heroicons
- **Animations**: Framer Motion (optional) or CSS transitions

### Project Structure

```
riviera-open-web/
├── app/
│   ├── layout.tsx                 # Root layout with navigation/footer
│   ├── page.tsx                   # Homepage
│   ├── tournaments/
│   │   ├── page.tsx              # Tournaments listing
│   │   └── [id]/
│   │       └── page.tsx          # Individual tournament details
│   ├── rankings/
│   │   ├── page.tsx              # Rankings overview with level tabs
│   │   └── [level]/
│   │       └── page.tsx          # Level-specific rankings
│   ├── players/
│   │   └── [id]/
│   │       └── page.tsx          # Player profile
│   ├── gallery/
│   │   └── page.tsx              # Photo gallery
│   ├── sponsors/
│   │   └── page.tsx              # Sponsors page
│   ├── news/
│   │   ├── page.tsx              # News listing
│   │   └── [slug]/
│   │       └── page.tsx          # Individual news article
│   ├── about/
│   │   └── page.tsx              # About page
│   └── contact/
│       └── page.tsx              # Contact page
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Footer.tsx            # Site footer
│   │   └── Navigation.tsx        # Navigation menu
│   ├── home/
│   │   ├── Hero.tsx              # Homepage hero section
│   │   ├── UpcomingTournaments.tsx
│   │   ├── FeaturedPlayers.tsx
│   │   └── RecentNews.tsx
│   ├── tournaments/
│   │   ├── TournamentCard.tsx
│   │   ├── TournamentList.tsx
│   │   └── TournamentDetails.tsx
│   ├── rankings/
│   │   ├── LevelTabs.tsx
│   │   ├── PlayerRankingCard.tsx
│   │   └── RankingsTable.tsx
│   ├── players/
│   │   ├── PlayerProfile.tsx
│   │   ├── PlayerStats.tsx
│   │   └── TournamentHistory.tsx
│   ├── gallery/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoModal.tsx
│   │   └── GalleryFilter.tsx
│   ├── sponsors/
│   │   ├── SponsorGrid.tsx
│   │   └── SponsorCard.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       └── Container.tsx
├── lib/
│   ├── data/
│   │   ├── players.ts            # Player data
│   │   ├── tournaments.ts        # Tournament data
│   │   ├── news.ts               # News articles
│   │   └── sponsors.ts           # Sponsor information
│   ├── types/
│   │   ├── player.ts             # Player type definitions
│   │   ├── tournament.ts         # Tournament type definitions
│   │   └── index.ts              # Barrel exports
│   └── utils/
│       ├── formatters.ts         # Date, number formatting
│       └── helpers.ts            # Utility functions
├── public/
│   ├── images/
│   │   ├── players/              # Player photos
│   │   ├── tournaments/          # Tournament photos
│   │   ├── gallery/              # Gallery images
│   │   └── sponsors/             # Sponsor logos
│   └── icons/                    # Site icons
└── styles/
    └── globals.css               # Global styles and Tailwind config
```

## Components and Interfaces

### Core Layout Components

#### Header Component

- Sticky navigation bar with transparent-to-solid transition on scroll
- Logo on the left, navigation links in center, social icons on right
- Mobile: Hamburger menu with slide-out drawer
- Implements smooth scroll behavior for anchor links

#### Footer Component

- Multi-column layout: About, Quick Links, Contact, Social Media
- Newsletter signup form (optional)
- Copyright and legal links
- Consistent with elegant design aesthetic

#### Navigation Component

- Desktop: Horizontal menu with hover effects
- Mobile: Vertical menu in drawer
- Active state indication for current page
- Smooth transitions and animations

### Homepage Components

#### Hero Section

- Full-width hero with high-quality background image
- Overlay with Riviera Open branding and tagline
- Call-to-action buttons (View Rankings, Upcoming Tournaments)
- Parallax effect on scroll (optional)

#### Upcoming Tournaments Preview

- Displays next 3-4 upcoming tournaments
- Card-based layout with date, location, and registration status
- "View All Tournaments" link

#### Featured Players Carousel

- Showcases top-ranked players across levels
- Auto-rotating carousel with manual controls
- Player photo, name, level, and points
- Links to full player profiles

#### Recent News Section

- Grid of latest 3-6 news articles
- Thumbnail image, title, date, and excerpt
- "Read More" links to full articles

### Tournament Components

#### TournamentCard

- Displays tournament summary information
- Date badge, club name, location
- Status indicator (Upcoming, In Progress, Completed)
- Click to view details

#### TournamentList

- Filterable list of tournaments (upcoming, past, by level)
- Sorting options (date, location)
- Pagination for large lists

#### TournamentDetails

- Full tournament information page
- Results table with 1st and 2nd place
- Photo gallery from the tournament
- Participant list with links to player profiles

### Rankings Components

#### LevelTabs

- Tab interface for switching between levels (Open, 1-6)
- Active state styling
- Responsive: Dropdown on mobile

#### PlayerRankingCard

- Compact card showing rank, photo, name, points
- Quick access to contact info and socials
- Click to view full profile

#### RankingsTable

- Table view alternative to cards
- Columns: Rank, Player, Level, Points, Tournaments Played
- Sortable columns
- Responsive: Stacks on mobile

### Player Components

#### PlayerProfile

- Hero section with large player photo
- Name, level, total points, current rank
- Contact information and social media links
- Tournament history section

#### PlayerStats

- Visual representation of player statistics
- Points progression chart (optional)
- Win/loss record
- Best finishes

#### TournamentHistory

- List of tournaments with results
- Filters for year, level, placement
- Links to tournament detail pages

### Gallery Components

#### PhotoGrid

- Masonry or grid layout for photos
- Lazy loading for performance
- Filter by tournament or date
- Responsive grid (4 cols → 3 → 2 → 1)

#### PhotoModal

- Lightbox for viewing full-size images
- Navigation between photos
- Caption with tournament info
- Close and share functionality

#### GalleryFilter

- Dropdown or button group for filtering
- Options: All, By Tournament, By Year
- Clear filters option

### Sponsor Components

#### SponsorGrid

- Grid layout organized by tier (if applicable)
- Consistent sizing for logos
- Hover effects (subtle scale/shadow)
- Links to sponsor websites

#### SponsorCard

- Logo display with optional description
- Tier badge (Gold, Silver, Bronze, etc.)
- External link indicator

## Data Models

### Player Type

```typescript
interface Player {
  id: string;
  firstName: string;
  lastName: string;
  photo: string;
  level: "Open" | "1" | "2" | "3" | "4" | "5" | "6";
  points: number;
  rank: number;
  contact: {
    email: string;
    phone: string;
  };
  socials: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  tournamentResults: TournamentResult[];
}

interface TournamentResult {
  tournamentId: string;
  placement: 1 | 2;
  date: string;
  club: string;
  photos: string[];
}
```

### Tournament Type

```typescript
interface Tournament {
  id: string;
  name: string;
  date: string;
  club: string;
  location: string;
  level: "Open" | "1" | "2" | "3" | "4" | "5" | "6";
  status: "upcoming" | "in-progress" | "completed";
  registrationOpen: boolean;
  results?: {
    first: {
      playerId: string;
      playerName: string;
      photo: string;
    };
    second: {
      playerId: string;
      playerName: string;
      photo: string;
    };
  };
  photos: string[];
  description?: string;
}
```

### News Article Type

```typescript
interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  thumbnail: string;
  category?: string;
}
```

### Sponsor Type

```typescript
interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  tier?: "gold" | "silver" | "bronze" | "partner";
  description?: string;
}
```

## Design System

### Color Palette

Inspired by Reserve Padel's elegant aesthetic:

```css
/* Primary Colors */
--color-primary: #1a1a1a; /* Deep charcoal */
--color-primary-light: #2d2d2d; /* Lighter charcoal */
--color-accent: #d4af37; /* Elegant gold */
--color-accent-hover: #c19b2a; /* Darker gold */

/* Neutral Colors */
--color-background: #ffffff; /* Pure white */
--color-surface: #f8f8f8; /* Off-white */
--color-border: #e5e5e5; /* Light gray */
--color-text: #1a1a1a; /* Dark text */
--color-text-secondary: #666666; /* Gray text */

/* Semantic Colors */
--color-success: #2d7a3e; /* Green */
--color-error: #c41e3a; /* Red */
--color-warning: #f59e0b; /* Amber */
```

### Typography

```css
/* Font Families */
--font-heading: "Playfair Display", serif; /* Elegant serif for headings */
--font-body: "Inter", sans-serif; /* Clean sans-serif for body */

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
--text-5xl: 3rem; /* 48px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System

Using Tailwind's default spacing scale (4px base unit):

- xs: 0.5rem (8px)
- sm: 0.75rem (12px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)

### Component Styling Guidelines

#### Cards

- White background with subtle shadow
- Border radius: 8-12px
- Padding: 24px
- Hover: Slight elevation increase

#### Buttons

- Primary: Gold background, dark text
- Secondary: Outlined with gold border
- Border radius: 6px
- Padding: 12px 24px
- Smooth hover transitions

#### Images

- Aspect ratios: 16:9 for tournaments, 1:1 for players
- Subtle grayscale filter with color on hover
- Rounded corners (8px)

## Error Handling

### Client-Side Errors

1. **Missing Data**: Display placeholder content with appropriate messaging
2. **Image Loading Failures**: Show fallback images or initials
3. **Navigation Errors**: Redirect to 404 page with helpful links
4. **Form Validation**: Inline error messages with clear instructions

### Server-Side Errors

1. **404 Not Found**: Custom page with navigation back to home
2. **500 Server Error**: Generic error page with retry option
3. **Data Fetching Errors**: Graceful degradation with cached data if available

### Error Boundaries

Implement React Error Boundaries for:

- Page-level errors
- Component-level errors in galleries and lists
- Fallback UI with error reporting option

## Testing Strategy

### Unit Testing

- **Components**: Test rendering, props, and user interactions
- **Utilities**: Test formatting functions, helpers
- **Data Models**: Validate type definitions and transformations
- **Tools**: Jest, React Testing Library

### Integration Testing

- **Page Rendering**: Test full page renders with data
- **Navigation**: Test routing and link functionality
- **Forms**: Test form submission and validation
- **Tools**: Jest, React Testing Library, Playwright

### End-to-End Testing

- **User Flows**:
  - Browse tournaments and view details
  - Navigate rankings and view player profiles
  - Filter and view gallery photos
  - Navigate between pages
- **Responsive Testing**: Test on mobile, tablet, desktop viewports
- **Tools**: Playwright or Cypress

### Performance Testing

- **Lighthouse Scores**: Target 90+ for all metrics
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Image Optimization**: Verify Next.js Image optimization
- **Bundle Size**: Keep JavaScript bundles under 200KB

### Accessibility Testing

- **WCAG 2.1 AA Compliance**: Ensure all components meet standards
- **Keyboard Navigation**: Test all interactive elements
- **Screen Reader**: Test with NVDA/JAWS
- **Color Contrast**: Verify 4.5:1 minimum ratio
- **Tools**: axe DevTools, Lighthouse accessibility audit

## Performance Optimization

### Image Optimization

- Use Next.js Image component for all images
- Implement lazy loading for gallery and lists
- Serve WebP format with fallbacks
- Responsive images with srcset

### Code Splitting

- Automatic code splitting via Next.js App Router
- Dynamic imports for heavy components (modals, carousels)
- Separate bundles for admin features (if added)

### Caching Strategy

- Static pages: ISR with revalidation
- Dynamic data: SWR or React Query for client-side caching
- CDN caching for images and static assets

### SEO Optimization

- Server-side rendering for all public pages
- Dynamic meta tags per page
- Structured data (JSON-LD) for players and tournaments
- Sitemap generation
- robots.txt configuration

## Future Considerations

### Content Management

- Integration with headless CMS (Sanity, Contentful, or Strapi)
- Admin interface for managing players, tournaments, and content
- Image upload and management system

### Advanced Features

- User authentication for players
- Tournament registration system
- Live scoring and updates
- Player statistics dashboard
- Email notifications for tournaments
- Multi-language support (Spanish/English)

### Analytics

- Google Analytics 4 integration
- Event tracking for user interactions
- Conversion tracking for registrations
- Heatmap analysis (Hotjar or similar)

### Progressive Web App

- Service worker for offline functionality
- App manifest for installability
- Push notifications for tournament updates
