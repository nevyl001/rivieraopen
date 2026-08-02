# Implementation Plan: Admin Interface

## Overview

This implementation plan breaks down the admin interface into discrete, incremental tasks. Each task builds on previous work and includes specific requirements references. The plan follows a phased approach: foundation → player management → tournament management → photo management → advanced features → testing and polish.

## Tasks

- [x] 1. Set up admin route structure and authentication foundation
  - Create `/app/admin` directory structure
  - Set up admin layout component with navigation
  - Create login page at `/app/admin/login/page.tsx`
  - Implement basic authentication middleware
  - _Requirements: 1.1, 1.5, 11.1_

- [x] 2. Implement authentication system
  - [x] 2.1 Create AdminAuthProvider service
    - Implement login, logout, validateSession, getCurrentUser methods
    - Use environment variables for admin credentials
    - Store sessions in HTTP-only cookies
    - _Requirements: 1.2, 1.3_

  - [x] 2.2 Create authentication middleware
    - Implement route protection for /admin routes
    - Redirect unauthenticated users to login
    - Handle session expiration
    - _Requirements: 1.1, 1.4_

  - [x]\* 2.3 Write property test for authentication
    - **Property 1: Authentication Session Validity**
    - **Property 20: Session Expiration Enforcement**
    - **Validates: Requirements 1.1, 1.4**

  - [x]\* 2.4 Write unit tests for authentication
    - Test login with valid credentials
    - Test login with invalid credentials
    - Test session validation
    - Test logout functionality
    - _Requirements: 1.2, 1.3, 1.5_

- [x] 3. Create admin dashboard and base UI components
  - Create dashboard page at `/app/admin/dashboard/page.tsx`
  - Build reusable UI components (Table, Form, Button, Input, Modal)
  - Implement navigation menu with links to all sections
  - Add loading states and error boundaries
  - _Requirements: 11.1, 11.2, 11.3_

- [-] 4. Implement validation service
  - [x] 4.1 Create ValidationService with Zod schemas
    - Implement validatePlayer, validateTournament, validateCategory
    - Implement validateEmail, validatePhone, validateUrl
    - Define validation rules for all entity types
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x]\* 4.2 Write property test for validation
    - **Property 2: Player Data Integrity**
    - **Property 3: Tournament Data Integrity**
    - **Validates: Requirements 2.2, 2.3, 3.1-3.7, 4.2, 4.3, 5.1-5.5**

  - [x]\* 4.3 Write unit tests for validation
    - Test category validation (valid and invalid values)
    - Test gender validation
    - Test email format validation
    - Test phone format validation
    - Test points and rank validation (non-negative)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5. Build player management - list and view
  - [x] 5.1 Create PlayerAdminService
    - Implement listPlayers with pagination
    - Implement getPlayer
    - Use existing repository pattern
    - _Requirements: 2.1_

  - [x] 5.2 Create players list page at `/app/admin/players/page.tsx`
    - Display players in table with name, category, gender, points, rank
    - Implement pagination controls
    - Add sort functionality for columns
    - _Requirements: 2.1, 2.6, 11.5_

  - [x] 5.3 Create player detail page at `/app/admin/players/[id]/page.tsx`
    - Display full player information
    - Show contacts and socials
    - Add edit and delete buttons
    - _Requirements: 2.1_

  - [ ]\* 5.4 Write property test for pagination
    - **Property 11: Pagination Consistency**
    - **Validates: Requirements 11.5**

  - [ ]\* 5.5 Write property test for sorting
    - **Property 12: Sort Order Correctness**
    - **Validates: Requirements 2.6, 4.6**

- [x] 6. Build player management - create and update
  - [x] 6.1 Implement create and update methods in PlayerAdminService
    - Implement createPlayer with validation
    - Implement updatePlayer with validation
    - Handle contacts and socials creation/update
    - Create API routes for POST and PUT operations
    - _Requirements: 2.2, 2.3_

  - [x] 6.2 Create player form component
    - Build form with all player fields
    - Implement client-side validation with Zod
    - Add required field indicators
    - Handle form submission
    - _Requirements: 2.2, 2.3, 11.3_

  - [x] 6.3 Create new player page at `/app/admin/players/new/page.tsx`
    - Use player form component
    - Handle successful creation
    - Display validation errors
    - _Requirements: 2.2, 3.7, 11.4_

  - [x] 6.4 Add edit functionality to player detail page
    - Reuse player form component
    - Pre-fill form with existing data
    - Handle successful update
    - _Requirements: 2.3, 15.4_

  - [x]\* 6.5 Write unit tests for player CRUD
    - Test player creation with valid data
    - Test player creation with missing fields
    - Test player update
    - Test form data preservation on error
    - _Requirements: 2.2, 2.3, 3.7, 15.4_

- [x] 7. Build player management - delete and search
  - [x] 7.1 Implement delete and search in PlayerAdminService
    - Implement deletePlayer with cascade delete
    - Implement searchPlayers
    - Implement filterPlayers
    - _Requirements: 2.4, 2.5, 10.1_

  - [x] 7.2 Add delete functionality to player detail page
    - Add delete button with confirmation modal
    - Handle successful deletion
    - Redirect to players list after delete
    - _Requirements: 2.4, 11.6_

  - [x] 7.3 Add search and filter to players list page
    - Add search input for name search
    - Add filter dropdowns for category and gender
    - Implement real-time search/filter
    - _Requirements: 2.5, 12.1, 12.3, 12.4, 12.5_

  - [x]\* 7.4 Write property test for cascade delete
    - **Property 4: Cascade Delete Consistency**
    - **Validates: Requirements 2.4, 10.1**

  - [x]\* 7.5 Write property test for search
    - **Property 9: Search Result Consistency**
    - **Validates: Requirements 2.5, 12.1**

  - [x]\* 7.6 Write property test for filters
    - **Property 10: Filter Combination Correctness**
    - **Validates: Requirements 2.5, 4.5, 12.3**

- [x] 8. Checkpoint - Ensure player management works end-to-end
  - Test creating, viewing, editing, deleting players
  - Test search and filter functionality
  - Test pagination and sorting
  - Ensure all tests pass, ask the user if questions arise

- [x] 9. Build tournament management - list and view
  - [x] 9.1 Create TournamentAdminService
    - Implement listTournaments with pagination
    - Implement getTournament with full details
    - Use existing repository pattern
    - _Requirements: 4.1_

  - [x] 9.2 Create tournaments list page at `/app/admin/tournaments/page.tsx`
    - Display tournaments in table with name, date, location, genre, status
    - Implement pagination controls
    - Add sort functionality
    - Add filter for status and genre
    - _Requirements: 4.1, 4.5, 4.6_

  - [x] 9.3 Create tournament detail page at `/app/admin/tournaments/[id]/page.tsx`
    - Display full tournament information
    - Show categories, winners, and photos
    - Add edit and delete buttons
    - Add navigation to category/winner/photo management
    - _Requirements: 4.1_

- [x] 10. Build tournament management - create and update
  - [x] 10.1 Implement create and update in TournamentAdminService
    - Implement createTournament with validation
    - Implement updateTournament with validation
    - _Requirements: 4.2, 4.3_

  - [x] 10.2 Create tournament form component
    - Build form with all tournament fields
    - Implement client-side validation
    - Add date picker for tournament date
    - Add toggle for registration status
    - _Requirements: 4.2, 4.3, 11.3_

  - [x] 10.3 Create new tournament page at `/app/admin/tournaments/new/page.tsx`
    - Use tournament form component
    - Handle successful creation
    - Display validation errors
    - _Requirements: 4.2, 5.5, 11.4_

  - [x] 10.4 Add edit functionality to tournament detail page
    - Reuse tournament form component
    - Pre-fill form with existing data
    - Handle successful update
    - _Requirements: 4.3_

  - [ ]\* 10.5 Write unit tests for tournament CRUD
    - Test tournament creation with valid data
    - Test tournament creation with missing fields
    - Test tournament update
    - Test date validation
    - _Requirements: 4.2, 4.3, 5.3, 5.5_

- [x] 11. Build tournament management - delete
  - [x] 11.1 Implement deleteTournament in TournamentAdminService
    - Implement cascade delete for categories, winners, photos, results
    - _Requirements: 4.4, 10.2_

  - [x] 11.2 Add delete functionality to tournament detail page
    - Add delete button with confirmation modal
    - Handle successful deletion
    - Redirect to tournaments list after delete
    - _Requirements: 4.4, 11.6_

  - [x]\* 11.3 Write property test for tournament cascade delete
    - **Property 5: Tournament Cascade Delete Consistency**
    - **Validates: Requirements 4.4, 10.2**

- [x] 12. Build tournament category management
  - [x] 12.1 Implement category methods in TournamentAdminService
    - Implement addCategory with duplicate prevention
    - Implement removeCategory with cascade delete
    - Implement listCategories
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 10.3_

  - [x] 12.2 Create category management UI in tournament detail page
    - Display list of current categories
    - Add form to add new category
    - Add delete button for each category
    - Show confirmation for category deletion
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x]\* 12.3 Write property test for category uniqueness
    - **Property 7: Unique Category Per Tournament**
    - **Validates: Requirements 6.4**

  - [x]\* 12.4 Write property test for category cascade delete
    - **Property 6: Category Cascade Delete Consistency**
    - **Validates: Requirements 6.3, 10.3**

  - [x]\* 12.5 Write unit tests for category management
    - Test adding valid category
    - Test adding duplicate category (should fail)
    - Test removing category
    - Test category validation
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13. Build tournament winner management
  - [x] 13.1 Implement winner methods in TournamentAdminService
    - Implement setWinner with placement validation
    - Implement removeWinner
    - Implement player lookup for auto-fill
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 13.2 Create winner management UI
    - Display first and second place winners for each category
    - Add form to set/update winners
    - Implement player search/select with auto-fill
    - Add delete button for winners
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x]\* 13.3 Write property test for winner uniqueness
    - **Property 8: Winner Placement Uniqueness**
    - **Validates: Requirements 7.6**

  - [x]\* 13.4 Write property test for winner auto-fill
    - **Property 19: Winner Auto-fill Correctness**
    - **Validates: Requirements 7.5**

  - [x]\* 13.5 Write unit tests for winner management
    - Test setting first place winner
    - Test setting second place winner
    - Test duplicate placement prevention
    - Test player auto-fill
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

- [x] 14. Checkpoint - Ensure tournament management works end-to-end
  - Test creating, viewing, editing, deleting tournaments
  - Test adding and removing categories
  - Test setting and removing winners
  - Ensure all tests pass, ask the user if questions arise

- [x] 15. Implement file upload service
  - [x] 15.1 Create FileUploadService
    - Implement uploadImage with validation
    - Implement validateImage (type and size checks)
    - Implement deleteImage
    - Store files in /public/uploads/ with UUID filenames
    - _Requirements: 8.2, 8.5, 8.6_

  - [x] 15.2 File upload via Cloudinary signed direct upload
    - Current: UI admin → `POST /api/admin/upload-signature` → Cloudinary directo
    - Legacy proxied `POST /api/admin/upload` removed; WAF Deny retained
    - Validate file type/size on client; store returned secure_url
    - _Requirements: 8.2, 8.5, 8.6_

  - [x]\* 15.3 Write property test for file validation
    - **Property 14: File Upload Validation**
    - **Validates: Requirements 8.5, 8.6**

  - [x]\* 15.4 Write unit tests for file upload
    - Test valid image upload
    - Test invalid file type rejection
    - Test oversized file rejection
    - Test filename generation
    - _Requirements: 8.2, 8.5, 8.6_

- [x] 16. Build tournament photo management
  - [x] 16.1 Implement photo methods in TournamentAdminService
    - Implement addPhoto
    - Implement removePhoto
    - Implement reorderPhotos
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 16.2 Create photo management UI
    - Display tournament photos in order
    - Add photo upload component
    - Implement drag-and-drop reordering
    - Add delete button for each photo
    - Show upload progress
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 16.3_

  - [x]\* 16.3 Write property test for photo ordering
    - **Property 18: Photo Display Order Consistency**
    - **Validates: Requirements 8.3, 9.5**

  - [x]\* 16.4 Write unit tests for photo management
    - Test photo upload
    - Test photo deletion
    - Test photo reordering
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 17. Build gallery management
  - [x] 17.1 Create GalleryAdminService
    - Implement listPhotos with pagination
    - Implement uploadPhoto
    - Implement updatePhoto
    - Implement deletePhoto
    - Implement reorderPhotos
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 17.2 Create gallery management page at `/app/admin/gallery/page.tsx`
    - Display gallery photos in grid
    - Add upload button
    - Implement photo metadata editing
    - Add delete functionality
    - Implement drag-and-drop reordering
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x]\* 17.3 Write unit tests for gallery management
    - Test photo upload with metadata
    - Test photo update
    - Test photo deletion
    - Test photo reordering
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 18. Implement audit logging
  - [x] 18.1 Create AuditLogService
    - Implement log method to record actions
    - Implement listLogs with pagination
    - Implement filterLogs
    - Store logs in JSON file or database table
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 18.2 Integrate audit logging into all services
    - Add audit log calls to PlayerAdminService
    - Add audit log calls to TournamentAdminService
    - Add audit log calls to GalleryAdminService
    - Log all create, update, delete operations
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 18.3 Create audit log viewer page at `/app/admin/audit-log/page.tsx`
    - Display audit logs in table
    - Show timestamp, user, action, entity type, entity ID
    - Implement filtering by action, entity type, date range
    - Add pagination
    - _Requirements: 13.4, 13.5_

  - [x]\* 18.4 Write property test for audit logging
    - **Property 13: Audit Log Completeness**
    - **Validates: Requirements 13.1, 13.2, 13.3**

  - [x]\* 18.5 Write unit tests for audit logging
    - Test log creation on create operation
    - Test log creation on update operation
    - Test log creation on delete operation
    - Test log filtering
    - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [x] 19. Implement bulk operations for players
  - [x] 19.1 Add bulk methods to PlayerAdminService
    - Implement bulkDelete
    - Implement bulkUpdateCategory
    - Return detailed results with success/failure counts
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

  - [x] 19.2 Add bulk operation UI to players list page
    - Add checkboxes for row selection
    - Add bulk action dropdown (delete, update category)
    - Show confirmation modal with affected count
    - Display operation results
    - _Requirements: 18.1, 18.2, 18.3, 18.5_

  - [x]\* 19.3 Write property test for bulk operations
    - **Property 15: Bulk Operation Atomicity**
    - **Validates: Requirements 18.3, 18.4, 18.5**

  - [x]\* 19.4 Write unit tests for bulk operations
    - Test bulk delete with multiple players
    - Test bulk category update
    - Test partial failure handling
    - Test result summary
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 20. Implement bulk operations for tournaments
  - [x] 20.1 Add bulkUpdateStatus to TournamentAdminService
    - Implement bulk status update
    - Return detailed results
    - _Requirements: 18.2, 18.4, 18.5_

  - [x] 20.2 Add bulk operation UI to tournaments list page
    - Add checkboxes for row selection
    - Add bulk status update action
    - Show confirmation modal
    - Display operation results
    - _Requirements: 18.2, 18.5_

- [x] 21. Implement data export functionality
  - [x] 21.1 Add export methods to services
    - Implement exportPlayers in PlayerAdminService
    - Implement exportTournaments in TournamentAdminService
    - Generate CSV format with all fields
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [x] 21.2 Add export buttons to list pages
    - Add export button to players list page
    - Add export button to tournaments list page
    - Respect current filters when exporting
    - Trigger file download
    - _Requirements: 17.1, 17.2, 17.3, 17.5_

  - [ ]\* 21.3 Write property test for export completeness
    - **Property 17: Export Data Completeness**
    - **Validates: Requirements 17.3, 17.4**

  - [ ]\* 21.4 Write unit tests for data export
    - Test player export with all fields
    - Test tournament export with all fields
    - Test filtered export
    - Test CSV format correctness
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 22. Checkpoint - Ensure advanced features work
  - Test audit logging for all operations
  - Test bulk delete and bulk update
  - Test data export
  - Ensure all tests pass, ask the user if questions arise

- [x] 23. Implement responsive design
  - [x] 23.1 Make admin layout responsive
    - Implement mobile navigation (hamburger menu)
    - Adjust layout for tablet and mobile
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 23.2 Make tables responsive
    - Implement horizontal scrolling for tables on mobile
    - Consider card layout for mobile
    - _Requirements: 14.5_

  - [x] 23.3 Make forms responsive
    - Adjust form layouts for mobile
    - Use appropriate input types for mobile
    - _Requirements: 14.4_

  - [ ]\* 23.4 Test responsive design manually
    - Test on desktop (1920x1080)
    - Test on tablet (768x1024)
    - Test on mobile (375x667)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 24. Add error handling and user feedback
  - [x] 24.1 Create error boundary components
    - Implement global error boundary
    - Implement page-level error boundaries
    - Display user-friendly error messages
    - _Requirements: 15.1, 15.3, 15.5_

  - [x] 24.2 Add loading states
    - Add loading spinners for async operations
    - Add skeleton loaders for lists
    - Add progress bars for uploads
    - _Requirements: 16.3_

  - [x] 24.3 Add success/error toast notifications
    - Implement toast notification system
    - Show success messages for operations
    - Show error messages with details
    - _Requirements: 11.2, 11.4, 15.2_

  - [ ]\* 24.4 Write property test for form data preservation
    - **Property 16: Form Data Preservation on Error**
    - **Validates: Requirements 15.4**

  - [ ]\* 24.5 Write unit tests for error handling
    - Test error boundary rendering
    - Test validation error display
    - Test network error handling
    - Test form data preservation
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 25. Implement performance optimizations
  - [x] 25.1 Add debouncing to search inputs
    - Implement 300ms debounce for search
    - _Requirements: 16.5_

  - [x] 25.2 Optimize image uploads
    - Add client-side image compression
    - Add image resizing before upload
    - _Requirements: 16.3_

  - [x] 25.3 Add loading performance checks
    - Ensure list pages load within 2 seconds
    - Ensure form submissions respond within 3 seconds
    - _Requirements: 16.1, 16.2_

- [x] 26. Write integration tests
  - [x]\* 26.1 Write player management integration tests
    - Test complete player CRUD flow
    - Test player search and filter
    - Test cascade delete
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x]\* 26.2 Write tournament management integration tests
    - Test complete tournament CRUD flow
    - Test category management
    - Test winner management
    - Test photo management
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 7.1, 7.2, 8.1, 8.2_

  - [ ]\* 26.3 Write authentication integration tests
    - Test login flow
    - Test protected route access
    - Test session expiration
    - Test logout flow
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]\* 26.4 Write audit log integration tests
    - Test audit log creation for all operations
    - Test audit log filtering
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 27. Security hardening
  - [x] 27.1 Implement CSRF protection
    - Add CSRF tokens to forms
    - Validate CSRF tokens on submission
    - _Requirements: 1.1_

  - [x] 27.2 Add rate limiting
    - Implement rate limiting on API routes
    - Limit login attempts
    - _Requirements: 1.3_

  - [x] 27.3 Sanitize user inputs
    - Add input sanitization to all forms
    - Prevent XSS attacks
    - _Requirements: 3.7, 5.5_

  - [ ]\* 27.4 Perform security audit
    - Review authentication implementation
    - Review file upload security
    - Review input validation
    - Test for common vulnerabilities

- [x] 28. Final polish and documentation
  - [x] 28.1 Add accessibility improvements
    - Ensure keyboard navigation works
    - Add ARIA labels
    - Test with screen reader
    - Ensure color contrast meets WCAG AA
    - _Requirements: 11.1, 11.3_

  - [x] 28.2 Create admin user guide
    - Document how to use each feature
    - Add screenshots
    - Create troubleshooting section

  - [x] 28.3 Update README with admin interface section
    - Document admin credentials
    - Document how to access admin interface
    - Document environment setup

- [x] 29. Final checkpoint - Complete testing
  - Run all unit tests
  - Run all property-based tests
  - Run all integration tests
  - Perform manual testing of all features
  - Ensure all tests pass, ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (100+ iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- The implementation leverages existing repository pattern and works with both dev and prod environments
