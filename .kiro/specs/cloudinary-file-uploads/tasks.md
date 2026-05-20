# Implementation Plan: Cloudinary File Uploads

## Overview

Replace the local filesystem-based image upload system with Cloudinary cloud storage. The implementation will maintain the existing API interface while routing uploads through Cloudinary's SDK, storing returned URLs in the database, and leveraging Cloudinary's CDN for optimized image delivery.

## Tasks

- [x] 1. Install Cloudinary SDK and configure environment
  - Add cloudinary package to dependencies
  - Create environment variable template in .env.local.example
  - Document required environment variables in README
  - _Requirements: 1.1, 1.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 2. Create Cloudinary configuration module
  - [x] 2.1 Create lib/cloudinary/config.ts with SDK configuration
    - Implement configureCloudinary() function to load credentials from environment
    - Validate required environment variables are present
    - Export configured Cloudinary instance as singleton
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x]\* 2.2 Write property test for configuration validation
    - **Property 1: Configuration requires all credentials**
    - **Validates: Requirements 1.2**
  - [x]\* 2.3 Write unit tests for configuration module
    - Test valid credentials load successfully
    - Test missing credentials throw configuration error
    - Test singleton instance is reused
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Create Cloudinary upload utilities
  - [x] 3.1 Create lib/cloudinary/upload.ts with core upload functions
    - Implement validateImage() function with file type and size validation
    - Implement uploadToCloudinary() function with streaming upload
    - Implement extractPublicIdFromUrl() helper function
    - Define TypeScript interfaces for upload options and results
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5_
  - [x]\* 3.2 Write property test for file validation
    - **Property 2: Validation rejects invalid files**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  - [x]\* 3.3 Write property test for upload URL format
    - **Property 6: URLs are always HTTPS**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  - [x]\* 3.4 Write property test for public ID uniqueness
    - **Property 4: Public IDs are unique**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  - [x]\* 3.5 Write unit tests for upload utilities
    - Test validateImage with valid and invalid files
    - Test uploadToCloudinary with mocked Cloudinary SDK
    - Test extractPublicIdFromUrl with various URL formats
    - Test error handling for network failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.5, 3.6, 3.7, 3.8_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create Cloudinary deletion utilities
  - [x] 5.1 Add deleteFromCloudinary() function to lib/cloudinary/upload.ts
    - Implement deletion with public ID extraction
    - Handle non-Cloudinary URLs gracefully
    - Ensure idempotent deletion behavior
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x]\* 5.2 Write property test for deletion idempotency
    - **Property 5: Deletion is idempotent**
    - **Validates: Requirements 6.4**
  - [x]\* 5.3 Write unit tests for deletion
    - Test deletion with valid Cloudinary URL
    - Test deletion with non-Cloudinary URL (no-op)
    - Test deletion with invalid public ID
    - Test error logging without throwing
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Update FileUploadService to use Cloudinary
  - [x] 6.1 Refactor lib/admin/services/FileUploadService.ts
    - Replace filesystem operations with Cloudinary upload calls
    - Update uploadImage() to call uploadToCloudinary() with folder parameter
    - Update deleteImage() to call deleteFromCloudinary()
    - Maintain existing interface (UploadResult, ValidationResult)
    - Add folder parameter support for organizing uploads
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3_
  - [x]\* 6.2 Write property test for upload preserves metadata
    - **Property 1: Upload preserves image integrity**
    - **Validates: Requirements 3.5, 7.1, 7.2**
  - [x]\* 6.3 Write property test for folder structure
    - **Property 3: Folder structure is preserved**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  - [x]\* 6.4 Write unit tests for updated FileUploadService
    - Test uploadImage with valid file returns Cloudinary URL
    - Test uploadImage with invalid file throws error
    - Test deleteImage with Cloudinary URL
    - Test folder parameter is passed correctly
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4_

- [x] 7. Update upload API endpoint
  - [x] 7.1 Update app/api/admin/upload/route.ts to handle folder parameter
    - Extract optional folder parameter from form data
    - Pass folder parameter to fileUploadService.uploadImage()
    - Update response to include publicId field
    - Add proper error status codes (400, 500, 507)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [x]\* 7.2 Write integration tests for upload API endpoint
    - Test POST with valid file returns 200 and Cloudinary URL
    - Test POST with invalid file type returns 400
    - Test POST with oversized file returns 400
    - Test POST with folder parameter stores in correct folder
    - Test POST without file returns 400
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Add automatic format optimization configuration
  - [x] 9.1 Update lib/cloudinary/upload.ts to include transformation options
    - Add fetchFormat: 'auto' to upload options
    - Add quality: 'auto' to upload options
    - Document automatic WebP/AVIF format delivery
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  - [x]\* 9.2 Write unit tests for transformation options
    - Test upload options include fetchFormat: 'auto'
    - Test upload options include quality: 'auto'
    - _Requirements: 12.1, 12.2_

- [x] 10. Update error handling for all error scenarios
  - [x] 10.1 Add comprehensive error handling to FileUploadService
    - Handle missing environment variables with clear error message
    - Handle invalid file types with 400 status
    - Handle file size exceeded with 400 status
    - Handle network failures with 500 status and retry message
    - Handle invalid credentials with authentication error
    - Handle storage quota exceeded with 507 status
    - Ensure no partial data on upload failure
    - _Requirements: 8.4, 8.5, 8.6, 10.1, 10.2, 10.3, 10.4_
  - [x]\* 10.2 Write property test for error recovery
    - **Property 8: Upload failure preserves system state**
    - \*\*Validates: Requirements 10.1, 10.2\_
  - [x]\* 10.3 Write unit tests for error scenarios
    - Test network failure during upload
    - Test invalid credentials error
    - Test storage quota exceeded error
    - Test no partial data on failure
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Update documentation
  - [x] 12.1 Update README.md with Cloudinary setup instructions
    - Document how to create Cloudinary account
    - Document how to obtain credentials
    - Document how to add environment variables locally
    - Document how to add environment variables to Vercel
    - _Requirements: 1.1, 1.2, 11.1, 11.2, 11.3_
  - [x] 12.2 Create migration guide for existing images (optional)
    - Document how to migrate existing /public/uploads/ images to Cloudinary
    - Document how to update database URLs
    - Document how to verify migration success
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing API interface is maintained for backward compatibility
- Client-side image optimization remains unchanged
- All Cloudinary URLs use HTTPS for security
