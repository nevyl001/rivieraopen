# Implementation Plan: English Translation

## Overview

This implementation plan will extend the Riviera Open website to support both English and Spanish languages with dynamic switching. The approach builds upon the existing Spanish localization infrastructure by adding English translations, implementing a locale context for state management, creating language toggle components, and persisting user preferences. The implementation follows an incremental approach, starting with infrastructure, then translations, then UI components, and finally integration and testing.

## Tasks

- [x] 1. Create English translation files

  - Create complete English translation files mirroring Spanish structure
  - Ensure all translation keys match between English and Spanish
  - Translate all content while preserving proper nouns
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 1.1 Create English common translations

  - Create lib/locales/en/common.json with navigation, buttons, status, labels, and footer content
  - Translate all UI elements to English
  - Ensure key structure matches Spanish common.json exactly
  - _Requirements: 1.1, 1.5_

- [x] 1.2 Create English home page translations

  - Create lib/locales/en/home.json with hero section and page sections
  - Translate homepage content maintaining marketing message impact
  - _Requirements: 1.1, 1.5_

- [x] 1.3 Create English tournament translations

  - Create lib/locales/en/tournaments.json with tournament labels, status, and levels
  - Translate tournament-related content
  - _Requirements: 1.1, 1.5_

- [x] 1.4 Create English rankings translations

  - Create lib/locales/en/rankings.json with player profile and ranking labels
  - Translate rankings and player content
  - _Requirements: 1.1, 1.5_

- [x] 1.5 Create English gallery translations

  - Create lib/locales/en/gallery.json with photo navigation and filters
  - Translate gallery and media content
  - _Requirements: 1.1, 1.5_

- [x] 1.6 Create English contact translations

  - Create lib/locales/en/contact.json with form labels, validation, and messages
  - Translate contact forms and information
  - _Requirements: 1.1, 1.5_

- [x] 1.7 Create English SEO translations

  - Create lib/locales/en/seo.json with meta titles, descriptions, and keywords
  - Translate SEO metadata for all pages
  - _Requirements: 1.1, 1.5, 8.1_

- [x] 1.8 Write property test for translation completeness and structure consistency

  - **Property 1: Translation Completeness and Structure Consistency**
  - **Validates: Requirements 1.1, 1.5, 12.1, 12.4**

- [x] 2. Update locale configuration for English support

  - Add English to supported locales
  - Configure English date and number formatting
  - Update locale utilities to handle both languages
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2.1 Update i18n config to support English

  - Add 'en' to LOCALES array in lib/i18n/config.ts
  - Add English locale configuration with formatting rules
  - Update type definitions for SupportedLocale
  - _Requirements: 6.1_

- [x] 2.2 Add English formatting utilities

  - Update lib/i18n/formatters.ts to handle English date formatting (month/day/year)
  - Add English number formatting (comma for thousands, period for decimal)
  - Add English time formatting (12-hour with AM/PM)
  - Add English relative time formatting ("ago", "in")
  - _Requirements: 6.2, 6.3, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2.3 Write property test for English date formatting

  - **Property 6: English Date Formatting**
  - **Validates: Requirements 6.2, 10.1, 10.2**

- [x] 2.4 Write property test for English number formatting

  - **Property 7: English Number Formatting**
  - **Validates: Requirements 6.3, 10.3**

- [x] 2.5 Write property test for relative time formatting

  - **Property 11: Relative Time Formatting**
  - **Validates: Requirements 10.4**

- [x] 2.6 Write property test for 12-hour time formatting

  - **Property 12: 12-Hour Time Formatting**
  - **Validates: Requirements 10.5**

- [x] 3. Create locale context for state management

  - Implement React context for global locale state
  - Add localStorage integration for preference persistence
  - Provide locale state and setter to all components
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.5_

- [x] 3.1 Create LocaleContext and LocaleProvider

  - Create lib/contexts/LocaleContext.tsx with context and provider
  - Implement locale state management with useState
  - Initialize locale from localStorage or default to Spanish
  - Implement setLocale function that updates state and localStorage
  - Handle localStorage errors gracefully with fallback to Spanish
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3.2 Create useLocale hook for consuming context

  - Create hook to access locale context
  - Provide current locale and setLocale function
  - Handle missing context provider gracefully
  - _Requirements: 7.1_

- [x] 3.3 Write property test for locale persistence round trip

  - **Property 3: Locale Persistence Round Trip**
  - **Validates: Requirements 4.1, 4.2**

- [x] 3.4 Write unit tests for LocaleContext

  - Test initialization with stored preference
  - Test default to Spanish when no preference exists
  - Test localStorage error handling
  - _Requirements: 4.3, 4.4_

- [-] 4. Update translation hook to use locale context

  - Modify useTranslation hook to consume locale from context
  - Ensure hook triggers re-render on locale changes
  - Update formatters to use context locale
  - _Requirements: 5.1, 7.1, 7.2, 7.3_

- [x] 4.1 Update useTranslation to consume LocaleContext

  - Import and use useLocale hook in useTranslation
  - Replace hardcoded DEFAULT_LOCALE with locale from context
  - Ensure translations reload when locale changes
  - Update all formatters to use context locale
  - _Requirements: 7.1, 7.3_

- [ ] 4.2 Write property test for dynamic content re-rendering

  - **Property 4: Dynamic Content Re-rendering**
  - **Validates: Requirements 5.1, 5.2, 5.4, 7.2**

- [ ] 4.3 Write property test for hook locale consistency

  - **Property 8: Hook Locale Consistency**
  - **Validates: Requirements 7.1, 7.5**

- [ ] 4.4 Write property test for translation loading for active locale

  - **Property 9: Translation Loading for Active Locale**
  - **Validates: Requirements 7.3**

- [ ] 4.5 Write unit test for translation loading fallback

  - Test fallback to alternate language when translation loading fails
  - _Requirements: 7.4_

- [-] 5. Create language toggle component

  - Build reusable LanguageToggle component
  - Support header and footer variants
  - Implement accessibility features (ARIA labels, keyboard navigation)
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 9.1, 9.3, 11.1, 11.2, 11.3, 11.4_

- [x] 5.1 Create LanguageToggle component

  - Create components/ui/LanguageToggle.tsx
  - Implement toggle UI with EN/ES indicators
  - Use useLocale hook to get and set current locale
  - Add click handler to switch between languages
  - Implement visual states for active/inactive languages
  - Support variant prop for header/footer styling
  - _Requirements: 2.1, 2.2, 2.3, 11.1, 11.2, 11.3, 11.4_

- [x] 5.2 Add accessibility features to LanguageToggle

  - Add ARIA labels for current language and available options
  - Add ARIA live region for language change announcements
  - Ensure keyboard accessibility (focusable, Enter/Space to activate)
  - Add proper button role and semantic HTML
  - _Requirements: 9.1, 9.3_

- [ ] 5.3 Write property test for language toggle functionality

  - **Property 2: Language Toggle Functionality**
  - **Validates: Requirements 2.2, 2.3, 3.2, 3.3**

- [ ] 5.4 Write unit tests for LanguageToggle component

  - Test toggle renders with current language indicator
  - Test ARIA labels and accessibility attributes
  - _Requirements: 2.1, 3.1, 9.1_

- [x] 6. Integrate language toggle into header and footer

  - Add LanguageToggle to Header component
  - Add LanguageToggle to Footer component
  - Ensure both toggles stay synchronized
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 6.1 Add language toggle to Header

  - Import and render LanguageToggle in Header component
  - Position toggle in desktop navigation area
  - Position toggle in mobile menu
  - Use header variant styling
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 6.2 Add language toggle to Footer

  - Import and render LanguageToggle in Footer component
  - Position toggle in footer layout
  - Use footer variant styling
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 7. Wrap application with LocaleProvider

  - Add LocaleProvider to root layout
  - Ensure all components have access to locale context
  - Test locale state is accessible throughout app
  - _Requirements: 7.1, 7.5_

- [x] 7.1 Add LocaleProvider to root layout

  - Import LocaleProvider in app/layout.tsx
  - Wrap children with LocaleProvider
  - Ensure provider is at root level for global access
  - _Requirements: 7.1, 7.5_

- [x] 8. Implement HTML lang attribute updates

  - Update document lang attribute when locale changes
  - Ensure proper language declaration for accessibility and SEO
  - _Requirements: 5.5, 8.4_

- [x] 8.1 Add lang attribute management to LocaleProvider

  - Update document.documentElement.lang in LocaleProvider when locale changes
  - Use useEffect to sync lang attribute with locale state
  - Ensure lang attribute updates on initial load and locale changes
  - _Requirements: 5.5, 8.4_

- [ ] 8.2 Write property test for HTML lang attribute synchronization

  - **Property 5: HTML Lang Attribute Synchronization**
  - **Validates: Requirements 5.5, 8.4**

- [x] 9. Update SEO metadata for both languages

  - Ensure meta titles and descriptions use current locale
  - Update document title when locale changes
  - Test Open Graph tags reflect current language
  - _Requirements: 8.1, 8.3_

- [x] 9.1 Update metadata generation to use locale

  - Review and update metadata in page components to use translations
  - Ensure SEO translations are loaded for current locale
  - _Requirements: 8.1_

- [x] 9.2 Write property test for document title updates

  - **Property 10: Document Title Updates**
  - **Validates: Requirements 8.3**

- [ ] 9.3 Write unit test for English SEO metadata

  - Test English meta titles and descriptions are provided
  - _Requirements: 8.1_

- [x] 10. Implement missing translation fallback

  - Add fallback logic for missing translation keys
  - Log warnings in development mode for missing keys
  - Ensure graceful degradation when translations are incomplete
  - _Requirements: 12.2, 12.3_

- [x] 10.1 Add missing key fallback to translation utilities

  - Update getTranslationByPath in lib/i18n/translations.ts
  - Implement fallback to alternate locale for missing keys
  - Add development mode warnings for missing keys
  - _Requirements: 12.2, 12.3_

- [ ] 10.2 Write property test for missing translation fallback

  - **Property 13: Missing Translation Fallback**
  - **Validates: Requirements 12.3**

- [ ] 10.3 Write unit test for missing key warnings

  - Test warnings are logged in development mode for missing keys
  - _Requirements: 12.2_

- [x] 11. Testing and validation

  - Run all property-based tests
  - Run all unit tests
  - Perform integration testing for language switching
  - Test accessibility features
  - _Requirements: All requirements validation_

- [x] 11.1 Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11.2 Write integration tests for full language switch flow

  - Test complete flow from toggle click to content update
  - Test persistence across page reloads
  - Test scroll position maintained during language switch
  - _Requirements: 5.1, 5.3, 4.2_

- [ ] 11.3 Write integration tests for cross-component consistency

  - Test multiple components reflect same locale
  - Test header and footer toggles stay synchronized
  - _Requirements: 3.3, 7.5_

- [x] 12. Final validation and optimization

  - Verify all English translations are complete and accurate
  - Test performance of language switching
  - Validate SEO implementation for both languages
  - Perform final accessibility audit
  - _Requirements: All requirements final validation_

- [x] 12.1 Final content and functionality review

  - Review all English translations for accuracy and completeness
  - Test language switching performance
  - Verify localStorage persistence works correctly
  - Test on multiple browsers and devices
  - _Requirements: 1.1, 1.3, 4.1, 4.2_

- [x] 12.2 Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
