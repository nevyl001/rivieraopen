# Design Document - English Translation

## Overview

The English Translation feature will extend the existing Spanish-only Riviera Open website to support both English and Spanish languages with dynamic switching capabilities. Building upon the established i18n infrastructure, this feature will add English translation files, implement language toggle controls in the header and footer, create a locale context for state management, and persist user language preferences across sessions.

The solution leverages React Context API for global language state management, browser localStorage for preference persistence, and the existing translation utilities for seamless language switching. The architecture ensures that language changes apply immediately without page reloads while maintaining optimal performance and SEO for both languages.

## Architecture

### Technology Stack

- **State Management**: React Context API for global locale state
- **Storage**: Browser localStorage for language preference persistence
- **Translation Files**: JSON-based English translations mirroring Spanish structure
- **Formatting**: Intl API with English locale configuration
- **UI Components**: Custom language toggle components for header and footer
- **Type Safety**: TypeScript interfaces for locale management

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Header     │  │  Components  │  │    Footer    │  │
│  │   Toggle     │  │  (consume    │  │    Toggle    │  │
│  │              │  │   context)   │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
├───────────────────────────┼─────────────────────────────┤
│                    Locale Context                        │
│  ┌────────────────────────┴──────────────────────────┐  │
│  │  - Current locale state (en/es)                   │  │
│  │  - setLocale function                             │  │
│  │  - Triggers re-render on change                   │  │
│  └────────────────────────┬──────────────────────────┘  │
│                           │                             │
├───────────────────────────┼─────────────────────────────┤
│                  Translation System                      │
│  ┌────────────────────────┴──────────────────────────┐  │
│  │  useTranslation Hook                              │  │
│  │  - Loads translations for current locale          │  │
│  │  - Provides formatters for current locale         │  │
│  │  - Re-renders components on locale change         │  │
│  └────────────────────────┬──────────────────────────┘  │
│                           │                             │
├───────────────────────────┼─────────────────────────────┤
│                  Storage Layer                           │
│  ┌────────────────────────┴──────────────────────────┐  │
│  │  localStorage: 'riviera-open-locale'              │  │
│  │  - Persists user preference                       │  │
│  │  - Loads on app initialization                    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
lib/
├── locales/
│   ├── en/                      # NEW: English translations
│   │   ├── common.json
│   │   ├── home.json
│   │   ├── tournaments.json
│   │   ├── rankings.json
│   │   ├── gallery.json
│   │   ├── contact.json
│   │   └── seo.json
│   └── es/                      # Existing Spanish translations
│       └── ...
├── i18n/
│   ├── config.ts                # UPDATED: Add English locale
│   ├── translations.ts          # No changes needed
│   └── formatters.ts            # UPDATED: Add English formatting
├── hooks/
│   └── useTranslation.ts        # UPDATED: Use locale from context
└── contexts/
    └── LocaleContext.tsx        # NEW: Locale state management

components/
├── layout/
│   ├── Header.tsx               # UPDATED: Add language toggle
│   └── Footer.tsx               # UPDATED: Add language toggle
└── ui/
    └── LanguageToggle.tsx       # NEW: Reusable toggle component
```

## Components and Interfaces

### Locale Context

```typescript
interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  isLoading: boolean;
}

interface LocaleProviderProps {
  children: React.ReactNode;
  defaultLocale?: SupportedLocale;
}
```

The LocaleContext will provide global access to the current language state and the ability to change it. It will:

- Initialize with the stored preference from localStorage or default to Spanish
- Provide the current locale to all consuming components
- Trigger re-renders when locale changes
- Handle localStorage updates when locale changes

### Language Toggle Component

```typescript
interface LanguageToggleProps {
  variant?: "header" | "footer";
  className?: string;
}

interface LanguageOption {
  code: SupportedLocale;
  label: string;
  ariaLabel: string;
}
```

The LanguageToggle component will:

- Display current language indicator (EN/ES)
- Provide click handler to switch languages
- Show visual feedback for active language
- Support different styling variants for header and footer
- Be fully accessible with ARIA labels and keyboard navigation

### Updated Translation Hook

```typescript
interface UseTranslationReturn {
  t: (key: string, params?: TranslationParams) => string;
  locale: SupportedLocale; // Now from context instead of hardcoded
  isLoading: boolean;
  error: string | null;
  formatDate: (
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatRelativeTime: (date: Date | string, baseDate?: Date) => string;
  formatShortDate: (date: Date | string) => string;
  formatTournamentDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
}
```

The updated hook will:

- Consume locale from LocaleContext instead of using hardcoded DEFAULT_LOCALE
- Re-render components when locale changes
- Load appropriate translation files for the active locale
- Provide locale-specific formatters

### Locale Configuration Updates

```typescript
export const LOCALES = ["en", "es"] as const;
export type SupportedLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "es";

export const localeConfigs: Record<SupportedLocale, LocaleConfig> = {
  en: {
    code: "en",
    name: "English",
    dateFormat: {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
    numberFormat: {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
    },
    rtl: false,
  },
  es: {
    // Existing Spanish configuration
  },
};
```

## Data Models

### Storage Schema

```typescript
// localStorage key
const LOCALE_STORAGE_KEY = "riviera-open-locale";

// Stored value
type StoredLocale = "en" | "es";

// Storage utilities
interface LocaleStorage {
  get: () => SupportedLocale | null;
  set: (locale: SupportedLocale) => void;
  clear: () => void;
}
```

### English Translation Structure

English translation files will mirror the Spanish structure exactly:

```json
// lib/locales/en/common.json
{
  "navigation": {
    "home": "Home",
    "tournaments": "Tournaments",
    "rankings": "Rankings",
    "gallery": "Gallery",
    "contact": "Contact"
  },
  "buttons": {
    "viewDetails": "View Details",
    "register": "Register",
    "viewAll": "View All",
    "close": "Close",
    "next": "Next",
    "previous": "Previous",
    "viewRankings": "View Rankings",
    "upcomingTournaments": "Upcoming Tournaments"
  },
  "status": {
    "upcoming": "Upcoming",
    "inProgress": "In Progress",
    "completed": "Completed",
    "registrationOpen": "Registration Open",
    "registrationClosed": "Registration Closed"
  },
  "labels": {
    "level": "Level",
    "points": "Points",
    "rank": "Rank",
    "email": "Email",
    "phone": "Phone",
    "date": "Date",
    "location": "Location",
    "club": "Club"
  },
  "aria": {
    "instagram": "Follow us on Instagram",
    "facebook": "Follow us on Facebook",
    "twitter": "Follow us on Twitter",
    "toggleMenu": "Toggle menu",
    "switchLanguage": "Switch language"
  },
  "footer": {
    "about": {
      "title": "About",
      "description": "Professional padel circuit in Mexico City, bringing together the best players in competitive tournaments."
    },
    "quickLinks": {
      "title": "Quick Links"
    },
    "contact": {
      "title": "Contact"
    },
    "social": {
      "title": "Follow Us",
      "description": "Stay updated with the latest news and events."
    },
    "copyright": "All rights reserved.",
    "privacyPolicy": "Privacy Policy",
    "termsOfService": "Terms of Service"
  }
}
```

### English Formatting Conventions

```typescript
// Date formatting examples
// Spanish: "15 de enero de 2024"
// English: "January 15, 2024"

// Number formatting examples
// Spanish: "1.234,56" (period for thousands, comma for decimal)
// English: "1,234.56" (comma for thousands, period for decimal)

// Time formatting examples
// Spanish: "14:30" (24-hour)
// English: "2:30 PM" (12-hour with AM/PM)

// Relative time examples
// Spanish: "hace 2 días"
// English: "2 days ago"
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Before writing the correctness properties, I'll analyze each acceptance criterion for testability:

### Acceptance Criteria Testing Prework

1.1 WHEN the system loads English translations THEN the Translation_System SHALL provide English equivalents for all Spanish content
Thoughts: This is about ensuring translation completeness. We can test this by comparing the keys in English and Spanish translation files to ensure they match.
Testable: yes - property

1.2 WHEN a user views any page in English THEN the Translation_System SHALL display navigation, headings, descriptions, and UI elements in English
Thoughts: This is about ensuring all UI elements use the translation system. This is more of an integration test across all pages.
Testable: yes - example

1.3 WHEN English content is displayed THEN the Translation_System SHALL use proper English grammar and natural language flow
Thoughts: This is about translation quality, which is subjective and not automatically testable.
Testable: no

1.4 WHEN proper nouns appear in content THEN the Translation_System SHALL preserve tournament names, player names, and location names unchanged
Thoughts: This is already tested in the Spanish localization spec (Property 4). No need to duplicate.
Testable: no (already covered)

1.5 WHEN translation files are structured THEN the Translation_System SHALL mirror the Spanish translation file organization
Thoughts: This is about file structure consistency, which can be tested by comparing the structure of English and Spanish translation objects.
Testable: yes - property

2.1 WHEN a user views the navigation header THEN the Language_Toggle SHALL display current language indicator (EN/ES)
Thoughts: This is testing that the toggle component renders with the correct indicator based on current locale.
Testable: yes - example

2.2 WHEN a user clicks the language toggle THEN the Locale_Manager SHALL switch to the alternate language immediately
Thoughts: This is testing the core toggle functionality. We can test this across all possible states (en->es, es->en).
Testable: yes - property

2.3 WHEN the language changes THEN the Language_Toggle SHALL update its visual state to reflect the new language
Thoughts: This is testing UI state synchronization with locale state. This is part of the toggle behavior.
Testable: yes - property

2.4 WHEN a user views the toggle on mobile THEN the Language_Toggle SHALL remain accessible and functional in responsive layouts
Thoughts: This is about responsive design, which is better tested manually or with visual regression tests.
Testable: no

2.5 WHEN the toggle is displayed THEN the Language_Toggle SHALL use clear visual indicators distinguishing active and inactive states
Thoughts: This is about visual design, which is subjective.
Testable: no

3.1 WHEN a user views the footer THEN the Language_Toggle SHALL display language selection options
Thoughts: This is testing that the footer toggle renders. This is an example test.
Testable: yes - example

3.2 WHEN a user clicks the footer language toggle THEN the Locale_Manager SHALL switch languages identically to the header toggle
Thoughts: This is testing that both toggles use the same locale context. This can be combined with 2.2.
Testable: yes - property

3.3 WHEN both toggles exist THEN the Locale_Manager SHALL keep header and footer toggles synchronized
Thoughts: This is testing that both toggles reflect the same state from context. This is part of the context behavior.
Testable: yes - property

3.4 WHEN the language changes via footer toggle THEN the Language_Toggle SHALL update both footer and header indicators
Thoughts: This is the same as 3.3, testing synchronization.
Testable: no (covered by 3.3)

3.5 WHEN the footer is displayed THEN the Language_Toggle SHALL maintain consistent styling with footer design
Thoughts: This is about visual design consistency.
Testable: no

4.1 WHEN a user selects a language THEN the Locale_Manager SHALL store the preference in browser local storage
Thoughts: This is testing that changing locale triggers a localStorage write. We can test this across all locale changes.
Testable: yes - property

4.2 WHEN a user returns to the site THEN the Locale_Manager SHALL load and apply the stored language preference
Thoughts: This is testing that the context initializes with the stored value. This is a round-trip property.
Testable: yes - property

4.3 WHEN no stored preference exists THEN the Locale_Manager SHALL default to Spanish as the primary language
Thoughts: This is testing the default behavior when localStorage is empty.
Testable: yes - example

4.4 WHEN storage fails THEN the Locale_Manager SHALL gracefully fall back to Spanish without breaking functionality
Thoughts: This is testing error handling when localStorage operations fail.
Testable: yes - example

4.5 WHEN a user clears browser data THEN the Locale_Manager SHALL reset to the default Spanish language
Thoughts: This is the same as 4.3, testing the default behavior.
Testable: no (covered by 4.3)

5.1 WHEN a user switches languages THEN the Locale_Manager SHALL update all visible content without full page refresh
Thoughts: This is testing that locale changes trigger re-renders without page reload. This is a core React behavior.
Testable: yes - property

5.2 WHEN content updates THEN the Translation_System SHALL re-render components with new language translations
Thoughts: This is the same as 5.1, testing re-rendering behavior.
Testable: no (covered by 5.1)

5.3 WHEN switching languages THEN the Locale_Manager SHALL maintain user's current page and scroll position
Thoughts: This is testing that locale changes don't affect navigation state.
Testable: yes - example

5.4 WHEN dynamic content exists THEN the Translation_System SHALL update all text including dynamically loaded elements
Thoughts: This is about ensuring all components using the hook re-render. This is part of 5.1.
Testable: no (covered by 5.1)

5.5 WHEN language switches THEN the Locale_Manager SHALL update the HTML lang attribute for accessibility
Thoughts: This is testing that the document lang attribute updates with locale changes.
Testable: yes - property

6.1 WHEN the system initializes THEN the Translation_System SHALL recognize both "en" and "es" as supported locales
Thoughts: This is testing the locale configuration includes both locales.
Testable: yes - example

6.2 WHEN English is active THEN the Translation_System SHALL apply English date formatting conventions
Thoughts: This is testing that formatters use the correct locale. We can test this across various dates.
Testable: yes - property

6.3 WHEN English is active THEN the Translation_System SHALL apply English number formatting conventions
Thoughts: This is testing number formatting with English locale.
Testable: yes - property

6.4 WHEN locale configuration is accessed THEN the Translation_System SHALL provide correct formatting rules for the active language
Thoughts: This is about the configuration structure, which is part of 6.2 and 6.3.
Testable: no (covered by 6.2, 6.3)

6.5 WHEN switching locales THEN the Translation_System SHALL update all formatters to use the new locale's conventions
Thoughts: This is testing that formatters react to locale changes. This is part of 6.2 and 6.3.
Testable: no (covered by 6.2, 6.3)

7.1 WHEN a component uses the translation hook THEN the Locale_Manager SHALL provide the current active locale
Thoughts: This is testing that the hook returns the correct locale from context.
Testable: yes - property

7.2 WHEN the locale changes THEN the Locale_Manager SHALL trigger re-render of all components using translations
Thoughts: This is the same as 5.1, testing re-rendering on locale change.
Testable: no (covered by 5.1)

7.3 WHEN a component requests translations THEN the Translation_System SHALL load the correct language's translation files
Thoughts: This is testing that the hook loads translations for the active locale.
Testable: yes - property

7.4 WHEN translation loading fails THEN the Translation_System SHALL fall back to the alternate language gracefully
Thoughts: This is testing error handling in translation loading.
Testable: yes - example

7.5 WHEN multiple components use translations THEN the Locale_Manager SHALL ensure consistent language across all components
Thoughts: This is testing that all components get the same locale from context. This is inherent to context behavior.
Testable: yes - property

8.1 WHEN a page loads in English THEN the Translation_System SHALL provide English meta titles and descriptions
Thoughts: This is testing that SEO translations are loaded for English.
Testable: yes - example

8.2 WHEN a page loads in Spanish THEN the Translation_System SHALL provide Spanish meta titles and descriptions
Thoughts: This is testing that SEO translations work for Spanish. This is already covered by existing Spanish spec.
Testable: no (already covered)

8.3 WHEN the language changes THEN the Translation_System SHALL update document title to reflect the new language
Thoughts: This is testing that document.title updates when locale changes.
Testable: yes - property

8.4 WHEN pages are indexed THEN the Translation_System SHALL provide appropriate lang attributes for each language
Thoughts: This is the same as 5.5, testing lang attribute updates.
Testable: no (covered by 5.5)

8.5 WHEN content is shared THEN the Translation_System SHALL use language-appropriate Open Graph metadata
Thoughts: This is about OG tags matching the current locale. This is part of 8.1.
Testable: no (covered by 8.1)

9.1 WHEN a screen reader encounters the language toggle THEN the Language_Toggle SHALL announce the current language and available options
Thoughts: This is testing ARIA labels on the toggle component.
Testable: yes - example

9.2 WHEN a user navigates by keyboard THEN the Language_Toggle SHALL be reachable and operable via keyboard alone
Thoughts: This is testing keyboard accessibility, which requires integration testing.
Testable: no

9.3 WHEN the language changes THEN the Language_Toggle SHALL announce the change to assistive technologies
Thoughts: This is testing ARIA live regions or announcements.
Testable: yes - example

9.4 WHEN toggles are rendered THEN the Language_Toggle SHALL include proper ARIA labels and roles
Thoughts: This is the same as 9.1, testing ARIA attributes.
Testable: no (covered by 9.1)

9.5 WHEN focus is on the toggle THEN the Language_Toggle SHALL provide clear visual focus indicators
Thoughts: This is about visual styling for focus states.
Testable: no

10.1 WHEN English is active THEN the Translation_System SHALL format dates using English month names
Thoughts: This is the same as 6.2, testing date formatting.
Testable: no (covered by 6.2)

10.2 WHEN English is active THEN the Translation_System SHALL use month/day/year convention for date display
Thoughts: This is part of 6.2, testing date format conventions.
Testable: no (covered by 6.2)

10.3 WHEN English is active THEN the Translation_System SHALL use English decimal and thousands separators
Thoughts: This is the same as 6.3, testing number formatting.
Testable: no (covered by 6.3)

10.4 WHEN relative dates are displayed in English THEN the Translation_System SHALL show English relative time indicators
Thoughts: This is testing relative time formatting with English locale.
Testable: yes - property

10.5 WHEN time is displayed in English THEN the Translation_System SHALL use 12-hour format with AM/PM indicators
Thoughts: This is testing time formatting with English locale.
Testable: yes - property

11.1-11.5: All about visual design
Testable: no

12.1 WHEN English translations are loaded THEN the Translation_System SHALL provide translations for all keys present in Spanish
Thoughts: This is the same as 1.1, testing translation completeness.
Testable: no (covered by 1.1)

12.2 WHEN a translation key is missing THEN the Translation_System SHALL log a warning in development mode
Thoughts: This is testing warning behavior for missing keys.
Testable: yes - example

12.3 WHEN a translation is missing THEN the Translation_System SHALL fall back to the alternate language for that specific key
Thoughts: This is testing fallback behavior for individual missing keys.
Testable: yes - property

12.4 WHEN translations are structured THEN the Translation_System SHALL maintain identical key structures across both languages
Thoughts: This is the same as 1.5, testing structure consistency.
Testable: no (covered by 1.5)

12.5 WHEN new content is added THEN the Translation_System SHALL require translations in both languages before deployment
Thoughts: This is a development process requirement, not a runtime property.
Testable: no

### Property Reflection

After reviewing all properties, I've identified the following redundancies:

- Properties 2.2 and 3.2 both test toggle functionality - can be combined
- Properties 5.1, 5.2, 5.4, and 7.2 all test re-rendering on locale change - can be combined
- Properties 6.2, 10.1, and 10.2 all test date formatting - can be combined
- Properties 6.3 and 10.3 both test number formatting - can be combined
- Properties 1.1 and 12.1 both test translation completeness - can be combined
- Properties 1.5 and 12.4 both test structure consistency - can be combined

The following properties represent unique validation requirements:

**Property 1: Translation Completeness and Structure Consistency**
_For any_ translation key present in Spanish translations, the English translations should contain the same key with the same nested structure
**Validates: Requirements 1.1, 1.5, 12.1, 12.4**

**Property 2: Language Toggle Functionality**
_For any_ language toggle (header or footer), clicking it should switch the locale to the alternate language and update the visual state
**Validates: Requirements 2.2, 2.3, 3.2, 3.3**

**Property 3: Locale Persistence Round Trip**
_For any_ locale selection, storing it to localStorage and then loading it should return the same locale value
**Validates: Requirements 4.1, 4.2**

**Property 4: Dynamic Content Re-rendering**
_For any_ component using the translation hook, changing the locale should trigger a re-render with translations from the new locale
**Validates: Requirements 5.1, 5.2, 5.4, 7.2**

**Property 5: HTML Lang Attribute Synchronization**
_For any_ locale change, the document's HTML lang attribute should update to match the new locale
**Validates: Requirements 5.5, 8.4**

**Property 6: English Date Formatting**
_For any_ date value, when English locale is active, formatting should use English month names and month/day/year convention
**Validates: Requirements 6.2, 10.1, 10.2**

**Property 7: English Number Formatting**
_For any_ number value, when English locale is active, formatting should use period for decimal separator and comma for thousands separator
**Validates: Requirements 6.3, 10.3**

**Property 8: Hook Locale Consistency**
_For any_ component using the translation hook, the locale returned should match the current locale from the context
**Validates: Requirements 7.1, 7.5**

**Property 9: Translation Loading for Active Locale**
_For any_ locale set in the context, the translation hook should load and provide translations from that locale's files
**Validates: Requirements 7.3**

**Property 10: Document Title Updates**
_For any_ locale change, the document title should update to use the translation from the new locale
**Validates: Requirements 8.3**

**Property 11: Relative Time Formatting**
_For any_ date value, when English locale is active, relative time formatting should use English indicators like "ago" and "in"
**Validates: Requirements 10.4**

**Property 12: 12-Hour Time Formatting**
_For any_ time value, when English locale is active, time formatting should use 12-hour format with AM/PM indicators
**Validates: Requirements 10.5**

**Property 13: Missing Translation Fallback**
_For any_ missing translation key in the active locale, the system should fall back to the alternate locale's translation for that key
**Validates: Requirements 12.3**

## Error Handling

### Locale Context Errors

1. **Initialization Failures**: If localStorage access fails during initialization, default to Spanish
2. **Invalid Stored Locale**: If stored locale is not supported, default to Spanish
3. **Context Provider Missing**: Components should handle missing context gracefully with fallback

### Translation Loading Errors

1. **Missing Translation Files**: Fall back to alternate language if translation files fail to load
2. **Malformed JSON**: Log error and use alternate language translations
3. **Network Errors**: Cache translations and use cached versions on subsequent failures

### Storage Errors

1. **localStorage Unavailable**: Continue functioning with in-memory state only
2. **Storage Quota Exceeded**: Clear old data and retry, or continue without persistence
3. **Private Browsing Mode**: Detect and handle localStorage restrictions gracefully

### Toggle Interaction Errors

1. **Rapid Clicking**: Debounce toggle clicks to prevent race conditions
2. **Context Update Failures**: Ensure UI reflects actual state even if update fails
3. **Concurrent Updates**: Use React's state batching to handle multiple simultaneous updates

## Testing Strategy

### Unit Testing

- **LocaleContext**: Test initialization, state updates, and localStorage integration
- **LanguageToggle**: Test rendering, click handlers, and accessibility attributes
- **Translation Hook**: Test locale consumption from context and re-rendering
- **Storage Utilities**: Test get/set/clear operations and error handling
- **Formatters**: Test English formatting for dates, numbers, and times
- **Tools**: Jest, React Testing Library

### Property-Based Testing

The model MUST use Jest with @fast-check/jest for property-based testing. Each property-based test MUST run a minimum of 100 iterations and be tagged with comments referencing the design document properties.

- **Translation Completeness**: Generate random key paths and verify they exist in both locales
- **Locale Switching**: Generate random locale sequences and verify state consistency
- **Persistence Round Trip**: Generate random locales and verify storage/retrieval
- **Formatting Consistency**: Generate random dates/numbers and verify locale-specific formatting
- **Fallback Behavior**: Generate scenarios with missing keys and verify fallback

### Integration Testing

- **Full Language Switch**: Test complete flow from toggle click to content update
- **Cross-Component Consistency**: Test multiple components reflect same locale
- **Persistence Across Sessions**: Test locale persists after page reload
- **SEO Updates**: Test meta tags and document title update with locale
- **Tools**: Playwright, Jest

### Accessibility Testing

- **Screen Reader**: Test language toggle announcements and navigation
- **Keyboard Navigation**: Test toggle is reachable and operable via keyboard
- **ARIA Attributes**: Test proper ARIA labels, roles, and live regions
- **Focus Management**: Test focus indicators and focus trap behavior
- **Tools**: axe-core, Lighthouse, manual testing

## Performance Optimization

### Translation Loading

- **Code Splitting**: Load only active locale's translations
- **Caching**: Cache loaded translations in memory
- **Lazy Loading**: Load translations on-demand for dynamic content
- **Preloading**: Preload alternate locale in background for faster switching

### State Management

- **Context Optimization**: Use React.memo for components that don't need locale
- **Selective Re-rendering**: Only re-render components that use translations
- **Batched Updates**: Batch locale changes with other state updates
- **Debouncing**: Debounce rapid toggle clicks

### Storage Operations

- **Async Storage**: Use async localStorage operations to avoid blocking
- **Storage Throttling**: Throttle storage writes to reduce I/O
- **Memory Fallback**: Keep in-memory state as primary, sync to storage
- **Compression**: Consider compressing stored preferences if needed

## SEO Optimization

### Multi-Language SEO

- **Lang Attributes**: Proper HTML lang attribute for each language
- **Hreflang Tags**: Implement hreflang for language targeting (future enhancement)
- **Canonical URLs**: Ensure proper canonical URLs for each language version
- **Structured Data**: Provide language-appropriate structured data

### Content Strategy

- **Keyword Optimization**: Research English keywords for padel/tennis terms
- **Meta Tags**: Craft compelling English meta titles and descriptions
- **URL Structure**: Consider language-specific URL paths (future enhancement)
- **Content Quality**: Ensure English translations maintain search intent

## Future Considerations

### URL-Based Language Selection

- **Path Prefix**: Implement /en/ and /es/ URL prefixes
- **Subdomain**: Consider en.rivieraopen.com and es.rivieraopen.com
- **Query Parameter**: Support ?lang=en for sharing specific language versions
- **Automatic Detection**: Detect browser language and suggest appropriate version

### Advanced Features

- **Language Auto-Detection**: Detect user's browser language on first visit
- **Regional Variants**: Support en-US, en-GB, es-MX, es-ES variants
- **Translation Management**: Integrate with translation management system
- **A/B Testing**: Test different language toggle placements and designs

### Content Management

- **CMS Integration**: Connect with headless CMS for managing both languages
- **Translation Workflows**: Implement professional translation review process
- **Version Control**: Track translation versions and updates
- **Quality Assurance**: Automated translation quality checks
