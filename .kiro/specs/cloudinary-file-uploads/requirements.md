# Requirements Document: Cloudinary File Uploads

## Introduction

This document specifies the requirements for replacing the local filesystem-based image upload system with Cloudinary cloud storage. The system must enable deployment on Vercel's read-only filesystem while maintaining existing UI/UX, routing uploads through Cloudinary's SDK, storing returned URLs in the database, and leveraging Cloudinary's CDN for optimized image delivery.

## Glossary

- **Upload_Service**: The server-side service responsible for handling file uploads to Cloudinary
- **Cloudinary_SDK**: The Cloudinary Node.js SDK used for upload operations
- **Admin_UI**: The administrative user interface for uploading images
- **Validation_Service**: The component responsible for validating file types and sizes
- **CDN**: Cloudinary's Content Delivery Network for serving images
- **Public_ID**: A unique identifier assigned to each uploaded resource in Cloudinary
- **Secure_URL**: An HTTPS URL pointing to a resource stored in Cloudinary's CDN

## Requirements

### Requirement 1: Cloudinary Configuration

**User Story:** As a system administrator, I want the system to configure Cloudinary credentials at startup, so that upload operations can authenticate with Cloudinary's API.

#### Acceptance Criteria

1. WHEN the application starts, THE Upload_Service SHALL load Cloudinary credentials from environment variables
2. IF environment variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET are missing, THEN THE Upload_Service SHALL throw a configuration error and prevent application startup
3. WHEN Cloudinary credentials are loaded, THE Upload_Service SHALL configure the Cloudinary_SDK with the provided credentials
4. THE Upload_Service SHALL store the configuration in a singleton instance accessible to all upload operations

### Requirement 2: File Validation

**User Story:** As a system, I want to validate uploaded files before processing, so that only valid image files are accepted and invalid files are rejected with clear error messages.

#### Acceptance Criteria

1. WHEN a file is submitted for upload, THE Validation_Service SHALL verify the file is not null or undefined
2. WHEN a file is submitted for upload, THE Validation_Service SHALL verify the file type is one of: image/jpeg, image/jpg, image/png, or image/webp
3. WHEN a file is submitted for upload, THE Validation_Service SHALL verify the file size does not exceed 5 megabytes
4. IF a file fails validation, THEN THE Validation_Service SHALL return a validation result with valid set to false and a descriptive error message
5. IF a file passes all validation checks, THEN THE Validation_Service SHALL return a validation result with valid set to true
6. THE Validation_Service SHALL not modify the input file during validation

### Requirement 3: Image Upload

**User Story:** As an administrator, I want to upload images to Cloudinary, so that images are stored in cloud storage and accessible via CDN URLs.

#### Acceptance Criteria

1. WHEN a validated file is uploaded, THE Upload_Service SHALL convert the file to a buffer for streaming
2. WHEN uploading a file, THE Upload_Service SHALL generate a unique public ID using UUID with the original file extension
3. WHEN uploading a file, THE Upload_Service SHALL configure upload options with the specified folder, resource type as image, and automatic quality and format optimization
4. WHEN uploading a file, THE Upload_Service SHALL use the Cloudinary_SDK upload stream method to transfer the file
5. WHEN an upload completes successfully, THE Upload_Service SHALL return an upload result containing the secure URL, public ID, width, height, format, and file size in bytes
6. WHEN an upload completes successfully, THE Secure_URL SHALL start with https://res.cloudinary.com/
7. IF an upload fails, THEN THE Upload_Service SHALL throw an error with a descriptive message
8. WHEN an upload fails, THE Upload_Service SHALL ensure no partial data is stored in the database or Cloudinary

### Requirement 4: Folder Organization

**User Story:** As a system administrator, I want uploaded images organized into folders by context, so that images are logically grouped and easy to manage in Cloudinary.

#### Acceptance Criteria

1. WHEN uploading a player image, THE Upload_Service SHALL store the file in the riviera-open/players folder
2. WHEN uploading a tournament image, THE Upload_Service SHALL store the file in the riviera-open/tournaments folder
3. WHEN uploading a gallery image, THE Upload_Service SHALL store the file in the riviera-open/gallery folder
4. WHEN an upload completes, THE Secure_URL SHALL include the specified folder path in the URL structure

### Requirement 5: Public ID Uniqueness

**User Story:** As a developer, I want each uploaded image to have a unique public ID, so that images never collide or overwrite each other.

#### Acceptance Criteria

1. WHEN generating a public ID, THE Upload_Service SHALL use a UUID-based identifier
2. WHEN generating a public ID, THE Upload_Service SHALL append the original file extension to the UUID
3. WHEN uploading multiple files, THE Upload_Service SHALL ensure each file receives a distinct public ID
4. WHEN configuring upload options, THE Upload_Service SHALL set overwrite to false to prevent accidental overwrites
5. WHEN configuring upload options, THE Upload_Service SHALL set uniqueFilename to true to ensure filename uniqueness

### Requirement 6: Image Deletion

**User Story:** As an administrator, I want to delete images from Cloudinary when they are no longer needed, so that storage is managed efficiently.

#### Acceptance Criteria

1. WHEN a Cloudinary URL is provided for deletion, THE Upload_Service SHALL extract the public ID from the URL
2. IF the URL is not a valid Cloudinary URL, THEN THE Upload_Service SHALL skip deletion without throwing an error
3. WHEN a valid public ID is extracted, THE Upload_Service SHALL call the Cloudinary_SDK destroy method with the public ID
4. WHEN deletion is called multiple times with the same public ID, THE Upload_Service SHALL complete without throwing an error
5. IF deletion fails, THEN THE Upload_Service SHALL log the error but not throw an exception

### Requirement 7: URL Format and Security

**User Story:** As a security-conscious developer, I want all image URLs to use HTTPS, so that images are served securely over encrypted connections.

#### Acceptance Criteria

1. WHEN an upload completes, THE Upload_Service SHALL return the secure URL from the Cloudinary upload result
2. THE Secure_URL SHALL use the HTTPS protocol
3. THE Secure_URL SHALL point to the Cloudinary CDN domain res.cloudinary.com
4. THE Secure_URL SHALL include the cloud name in the URL path
5. THE Secure_URL SHALL include a version number for cache invalidation

### Requirement 8: API Endpoint Integration

**User Story:** As an administrator using the admin UI, I want to upload images through the existing upload API endpoint, so that the integration is seamless with the current interface.

#### Acceptance Criteria

1. WHEN a POST request is made to /api/admin/upload with a file, THE Upload_Service SHALL validate the file
2. WHEN a POST request includes a folder parameter, THE Upload_Service SHALL use the specified folder for organizing the upload
3. WHEN an upload succeeds, THE API endpoint SHALL return a JSON response with url, publicId, width, height, format, and bytes fields
4. IF validation fails, THEN THE API endpoint SHALL return a 400 status code with an error message
5. IF upload fails due to network or Cloudinary errors, THEN THE API endpoint SHALL return a 500 status code with an error message
6. IF Cloudinary storage quota is exceeded, THEN THE API endpoint SHALL return a 507 status code with an insufficient storage message

### Requirement 9: Client-Side Optimization Compatibility

**User Story:** As a developer, I want the Cloudinary integration to work with existing client-side image optimization, so that bandwidth is minimized and upload times are reduced.

#### Acceptance Criteria

1. WHEN the Admin_UI optimizes an image before upload, THE Upload_Service SHALL accept the optimized file
2. WHEN an optimized file is uploaded, THE Upload_Service SHALL process it identically to non-optimized files
3. THE Upload_Service SHALL not perform additional optimization on files that are already optimized by the client

### Requirement 10: Error Recovery and Data Integrity

**User Story:** As a system operator, I want upload failures to be handled gracefully, so that the system remains in a consistent state and no partial data is stored.

#### Acceptance Criteria

1. IF an upload fails after starting, THEN THE Upload_Service SHALL ensure no URL is stored in the database
2. IF an upload fails after starting, THEN THE Upload_Service SHALL ensure no orphaned files remain in Cloudinary
3. WHEN an upload error occurs, THE Upload_Service SHALL return a descriptive error message to the client
4. WHEN a network failure occurs during upload, THE Upload_Service SHALL allow the client to retry the operation

### Requirement 11: Environment Configuration

**User Story:** As a developer, I want Cloudinary credentials stored in environment variables, so that sensitive credentials are not exposed in source code.

#### Acceptance Criteria

1. THE Upload_Service SHALL read CLOUDINARY_CLOUD_NAME from environment variables
2. THE Upload_Service SHALL read CLOUDINARY_API_KEY from environment variables
3. THE Upload_Service SHALL read CLOUDINARY_API_SECRET from environment variables
4. THE Upload_Service SHALL not store credentials in source code or version control
5. THE Upload_Service SHALL not log credentials in application logs

### Requirement 12: Automatic Format Optimization

**User Story:** As a developer, I want Cloudinary to automatically optimize image formats, so that modern browsers receive WebP or AVIF formats for better performance.

#### Acceptance Criteria

1. WHEN configuring upload options, THE Upload_Service SHALL set fetchFormat to auto
2. WHEN configuring upload options, THE Upload_Service SHALL set quality to auto
3. WHEN a browser requests an image, THE CDN SHALL serve WebP format to browsers that support it
4. WHEN a browser requests an image, THE CDN SHALL serve AVIF format to browsers that support it
5. WHEN a browser does not support modern formats, THE CDN SHALL serve the original format
