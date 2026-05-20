# Implementation Plan

- [x] 1. Set up localization infrastructure

  - Create directory structure for translation files and utilities
  - Set up TypeScript interfaces for translation keys and locale configuration
  - Install and configure necessary dependencies for internationalization
  - _Requirements: 10.5_

- [x] 1.1 Create translation file structure

  - Create lib/locales/es/ directory with JSON files for each content area
  - Define TypeScript interfaces for translation key structure
  - Set up translation file organization (common, home, tournaments, rankings, gallery, contact, seo)
  - _Requirements: 10.5_

- [x] 1.2 Implement translation utilities and hooks

  - Create useTranslation hook for accessing translations in components
  - Implement translation key resolution with parameter interpolation
  - Add fallback logic for missing translations
  - _Requirements: 10.4_

- [x] 1.3 Write property test for translation fallback behavior

  - **Property 7: Translation Fallback Behavior**
  - **Validates: Requirements 10.4**

- [x] 2. Create Spanish translation content

  - Translate all navigation, UI components, and static content to Spanish
  - Ensure proper Spanish grammar and cultural context
  - Maintain consistency in terminology across all translations
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 2.4_

- [x] 2.1 Translate navigation and common UI elements

  - Create common.json with navigation items, buttons, status indicators, and labels
  - Translate header navigation: "Inicio", "Torneos", "Rankings", "Galería", "Contacto"
  - Translate common buttons and UI elements
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2.2 Write property test for navigation translation consistency

  - **Property 1: Navigation Translation Consistency**
  - **Validates: Requirements 1.1, 1.2, 1.4**

- [x] 2.3 Translate homepage content

  - Create home.json with hero section, descriptions, and call-to-action text
  - Translate hero title to "Circuito Profesional de Pádel"
  - Translate CTA buttons to "Ver Rankings" and "Próximos Torneos"
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.4 Translate tournament-related content

  - Create tournaments.json with tournament labels, status indicators, and descriptions
  - Translate registration status to "Registro Abierto"/"Registro Cerrado"
  - Translate level labels to use "Nivel" prefix
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 2.5 Translate rankings and player content

  - Create rankings.json with player profile labels and ranking terminology
  - Translate profile fields: "Puntos Totales", "Ranking Actual"
  - Translate contact labels: "Email", "Teléfono"
  - Translate placement indicators: "1er Lugar", "2do Lugar"
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2.6 Translate gallery and media content

  - Create gallery.json with photo navigation and filter labels
  - Translate modal buttons: "Anterior", "Siguiente", "Cerrar"
  - Translate filter categories and metadata labels
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 2.7 Translate contact and form content

  - Create contact.json with form labels, validation messages, and instructions
  - Translate all form elements including placeholders and error messages
  - Translate success and confirmation messages
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 2.8 Write property test for UI component translation completeness

  - **Property 2: UI Component Translation Completeness**
  - **Validates: Requirements 2.4, 7.1, 7.2, 7.5**

- [x] 2.9 Write property test for form and interaction translation

  - **Property 3: Form and Interaction Translation**
  - **Validates: Requirements 6.1, 6.2, 6.4, 6.5**

- [x] 3. Implement locale-aware formatting utilities

  - Create formatters for dates, numbers, and currency using Spanish conventions
  - Implement Spanish month names and date formatting
  - Set up number formatting with Spanish decimal and thousands separators
  - _Requirements: 3.5, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 3.1 Create date formatting utilities

  - Implement Spanish date formatting with month names
  - Create relative date formatting ("hace 2 días", "en 3 semanas")
  - Set up day/month/year convention for Spanish dates
  - _Requirements: 3.5, 8.1, 8.5_

- [x] 3.2 Create number and currency formatting utilities

  - Implement Spanish decimal and thousands separators
  - Set up 24-hour time format for Spanish conventions
  - Create currency formatting for Spanish-speaking regions
  - _Requirements: 4.5, 8.2, 8.3, 8.4_

- [x] 3.3 Write property test for locale-aware formatting

  - **Property 5: Locale-Aware Formatting**
  - **Validates: Requirements 3.5, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 4. Update components to use translations

  - Integrate translation hooks into all existing components
  - Replace hardcoded English text with translation keys
  - Ensure proper noun preservation while translating labels
  - _Requirements: 3.2, 6.3_

- [x] 4.1 Update header and navigation components

  - Integrate useTranslation hook in Header and Navigation components
  - Replace hardcoded navigation labels with translation keys
  - Update social media aria-labels for accessibility
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4.2 Update homepage components

  - Integrate translations in Hero, UpcomingTournaments, FeaturedPlayers components
  - Replace hardcoded text with translation keys
  - Implement proper Spanish formatting for dates and content
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4.3 Update tournament components

  - Integrate translations in TournamentCard and tournament-related components
  - Preserve club names and locations while translating labels
  - Implement Spanish date formatting for tournament dates
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 4.4 Update rankings and player components

  - Integrate translations in ranking tables and player profile components
  - Translate field labels while preserving player names and data
  - Implement Spanish number formatting for points and statistics
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4.5 Update gallery components

  - Integrate translations in PhotoGrid, PhotoModal, and gallery components
  - Translate navigation buttons and filter options
  - Preserve photo metadata while translating labels
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.6 Update contact and form components

  - Integrate translations in contact forms and validation
  - Translate all form elements including error and success messages
  - Preserve actual contact information while translating labels
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4.7 Update sponsors and footer components

  - Integrate translations in FeaturedSponsors and Footer components
  - Translate sponsor section headings and descriptions
  - Translate footer sections: "About", "Quick Links", "Contact", "Follow Us"
  - Preserve contact information and links while translating labels
  - _Requirements: 2.1, 2.4, 6.3_

- [x] 4.8 Write property test for content translation with proper noun preservation

  - **Property 4: Content Translation with Proper Noun Preservation**
  - **Validates: Requirements 3.2, 6.3**

- [x] 5. Implement SEO and metadata localization

  - Create Spanish meta titles and descriptions for all pages
  - Implement Spanish Open Graph tags for social media sharing
  - Add Spanish alt text for images and accessibility
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 5.1 Create SEO translation content

  - Create seo.json with Spanish meta titles and descriptions for all pages
  - Translate Open Graph titles and descriptions
  - Create Spanish alt text for images
  - _Requirements: 9.1, 9.2, 9.4_

- [x] 5.2 Update page metadata and titles

  - Integrate Spanish page titles in all route components
  - Update document titles to display Spanish text in browser tabs
  - Ensure proper language declaration in HTML
  - _Requirements: 9.3, 9.5_

- [x] 5.3 Write property test for SEO and metadata translation

  - **Property 6: SEO and Metadata Translation**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

- [x] 6. Update UI components and interactive elements

  - Translate all button text, status badges, and interactive elements
  - Implement Spanish loading and error messages
  - Update tooltips and help text to Spanish
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6.1 Update button and badge components

  - Integrate translations in Button and Badge components
  - Translate status indicators: "Próximo", "En Progreso", "Completado"
  - Ensure styling is preserved with Spanish text
  - _Requirements: 7.1, 7.2_

- [x] 6.2 Update loading and error states

  - Implement Spanish loading messages throughout the application
  - Create Spanish error messages with clear instructions
  - Update tooltip and help text to Spanish
  - _Requirements: 7.3, 7.4, 7.5_

- [x] 7. Testing and validation

  - Ensure all tests pass with Spanish localization
  - Validate translation completeness and accuracy
  - Test responsive design with Spanish text lengths
  - _Requirements: All requirements validation_

- [x] 7.1 Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 7.2 Write unit tests for translation utilities

  - Create unit tests for useTranslation hook functionality
  - Test translation key resolution and parameter interpolation
  - Test formatter utilities with Spanish locale
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7.3 Write integration tests for localized components

  - Test complete page rendering with Spanish content
  - Test navigation flow entirely in Spanish
  - Test form submission with Spanish labels and validation
  - _Requirements: 1.1, 2.1, 6.1_

- [x] 8. Final validation and optimization

  - Perform final review of all Spanish content
  - Optimize performance with Spanish translations
  - Validate SEO implementation with Spanish content
  - _Requirements: All requirements final validation_

- [x] 8.1 Final content review and optimization

  - Review all Spanish translations for accuracy and consistency
  - Optimize bundle size with translation files
  - Validate proper Spanish grammar and cultural context
  - _Requirements: 2.5, 10.1, 10.2, 10.3_

- [x] 8.2 Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
