# Design Document: Cloudinary File Uploads

## Overview

Replace the current local filesystem-based image upload system with Cloudinary cloud storage to enable deployment on Vercel's read-only filesystem. The integration maintains existing UI/UX while uploading **directly from the browser to Cloudinary** via a short-lived signed credential. File bytes never pass through a Vercel Function.

> **Current flow (authoritative):**  
> UI admin → `POST /api/admin/upload-signature` (JSON only) → browser POST multipart to Cloudinary → app stores `secure_url` / metadata.  
> The legacy proxied endpoint `POST /api/admin/upload` was removed. Vercel Firewall rule `block-legacy-admin-upload` continues to Deny that path at the edge.

## Main Algorithm/Workflow

```mermaid
sequenceDiagram
    participant UI as Admin UI
    participant Sig as upload-signature API
    participant Opt as Image Optimizer
    participant Cloud as Cloudinary Upload API
    participant CDN as Cloudinary CDN
    participant DB as Database

    UI->>Opt: Select file (client-side)
    Opt->>Opt: Resize & compress
    UI->>Sig: POST /api/admin/upload-signature (JSON folder)
    Sig->>Sig: Auth + rate limit + sign params
    Sig-->>UI: signature, timestamp, apiKey, cloudName, folder
    UI->>Cloud: POST multipart (file + signed params)
    Cloud->>CDN: Store image
    Cloud-->>UI: secure_url, public_id
    UI->>DB: Store URL via existing admin APIs
    UI->>CDN: Display image
```

## Core Interfaces/Types

```typescript
// Cloudinary configuration
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  secure: boolean;
}

// Upload options
interface CloudinaryUploadOptions {
  folder: string;
  publicId?: string;
  resourceType: "image" | "video" | "raw" | "auto";
  transformation?: CloudinaryTransformation;
  overwrite?: boolean;
  uniqueFilename?: boolean;
}

// Transformation options for responsive images
interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "limit";
  quality?: "auto" | number;
  fetchFormat?: "auto" | "webp" | "avif";
}

// Upload result
interface CloudinaryUploadResult {
  publicId: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  createdAt: string;
  bytes: number;
  url: string;
  secureUrl: string;
}

// Service response
interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

// Validation result
interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

## Key Functions with Formal Specifications

### Function 1: configureCloudinary()

```typescript
function configureCloudinary(): void;
```

**Preconditions:**

- Environment variables `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are defined
- Environment variables are non-empty strings
- Function is called before any upload operations

**Postconditions:**

- Cloudinary SDK is configured with valid credentials
- Configuration is stored in singleton instance
- Subsequent upload operations can access configuration

**Loop Invariants:** N/A

### Function 2: validateImage()

```typescript
function validateImage(file: File): ValidationResult;
```

**Preconditions:**

- `file` parameter is defined (not null/undefined)
- `file` is a File object with `type` and `size` properties

**Postconditions:**

- Returns ValidationResult object
- `valid === true` if and only if file passes all validation checks
- If `valid === false`, `error` contains descriptive message
- No mutations to input parameter

**Loop Invariants:** N/A

### Function 3: uploadToCloudinary()

```typescript
async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions,
): Promise<UploadResult>;
```

**Preconditions:**

- `file` is validated and well-formed
- `file.size` is within allowed limits (≤ 5MB)
- `file.type` is in allowed types list
- Cloudinary SDK is configured
- `options.folder` is non-empty string
- Network connection is available

**Postconditions:**

- Returns UploadResult with valid Cloudinary URL
- `result.url` is HTTPS URL pointing to Cloudinary CDN
- `result.publicId` uniquely identifies the uploaded resource
- File is stored in Cloudinary with specified folder structure
- Original file is not modified
- On error, throws Error with descriptive message

**Loop Invariants:** N/A

### Function 4: deleteFromCloudinary()

```typescript
async function deleteFromCloudinary(publicId: string): Promise<void>;
```

**Preconditions:**

- `publicId` is non-empty string
- `publicId` is valid Cloudinary public ID format
- Cloudinary SDK is configured

**Postconditions:**

- Resource is deleted from Cloudinary if it exists
- If resource doesn't exist, operation completes without error
- No return value on success
- On error, throws Error with descriptive message

**Loop Invariants:** N/A

### Function 5: extractPublicIdFromUrl()

```typescript
function extractPublicIdFromUrl(url: string): string | null;
```

**Preconditions:**

- `url` is defined (not null/undefined)
- `url` is string type

**Postconditions:**

- Returns public ID string if URL is valid Cloudinary URL
- Returns null if URL is not Cloudinary URL or invalid format
- No side effects on input parameter

**Loop Invariants:** N/A

## Algorithmic Pseudocode

### Main Upload Algorithm

```typescript
ALGORITHM uploadImage(file: File, folder: string)
INPUT: file of type File, folder of type string
OUTPUT: result of type UploadResult

BEGIN
  // Step 1: Validate input
  ASSERT file !== null AND file !== undefined
  ASSERT folder !== null AND folder !== ""

  validation ← validateImage(file)
  IF validation.valid = false THEN
    THROW Error(validation.error)
  END IF

  // Step 2: Convert File to Buffer
  arrayBuffer ← AWAIT file.arrayBuffer()
  buffer ← Buffer.from(arrayBuffer)

  // Step 3: Generate unique public ID
  ext ← extractExtension(file.name)
  publicId ← generateUUID() + ext

  // Step 4: Configure upload options
  options ← {
    folder: folder,
    publicId: publicId,
    resourceType: 'image',
    transformation: {
      quality: 'auto',
      fetchFormat: 'auto'
    },
    overwrite: false,
    uniqueFilename: true
  }

  // Step 5: Upload to Cloudinary via stream
  uploadResult ← AWAIT uploadStream(buffer, options)

  ASSERT uploadResult.secureUrl !== null
  ASSERT uploadResult.publicId !== null

  // Step 6: Return formatted result
  result ← {
    url: uploadResult.secureUrl,
    publicId: uploadResult.publicId,
    width: uploadResult.width,
    height: uploadResult.height,
    format: uploadResult.format,
    bytes: uploadResult.bytes
  }

  RETURN result
END
```

**Preconditions:**

- file is validated File object
- folder is non-empty string representing target folder in Cloudinary
- Cloudinary SDK is configured with valid credentials

**Postconditions:**

- Image is uploaded to Cloudinary
- Returns UploadResult with secure HTTPS URL
- File is stored in specified folder structure
- Unique public ID prevents collisions

**Loop Invariants:** N/A

### Validation Algorithm

```typescript
ALGORITHM validateImage(file: File)
INPUT: file of type File
OUTPUT: validation of type ValidationResult

BEGIN
  allowedTypes ← ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  maxSizeBytes ← 5 * 1024 * 1024  // 5MB

  // Check file exists
  IF file = null OR file = undefined THEN
    RETURN { valid: false, error: "No file provided" }
  END IF

  // Check file type
  IF file.type NOT IN allowedTypes THEN
    RETURN {
      valid: false,
      error: "Invalid file type. Allowed: JPEG, JPG, PNG, WebP"
    }
  END IF

  // Check file size
  IF file.size > maxSizeBytes THEN
    RETURN {
      valid: false,
      error: "File size exceeds 5MB limit"
    }
  END IF

  // All validations passed
  RETURN { valid: true }
END
```

**Preconditions:**

- file parameter is provided (may be null/undefined)

**Postconditions:**

- Returns ValidationResult indicating validity
- true if and only if file passes all checks
- No side effects on input

**Loop Invariants:** N/A

### Deletion Algorithm

```typescript
ALGORITHM deleteImage(url: string)
INPUT: url of type string (Cloudinary URL)
OUTPUT: void

BEGIN
  // Step 1: Extract public ID from URL
  publicId ← extractPublicIdFromUrl(url)

  IF publicId = null THEN
    // Not a Cloudinary URL, skip deletion
    RETURN
  END IF

  // Step 2: Delete from Cloudinary
  TRY
    AWAIT cloudinary.uploader.destroy(publicId)
  CATCH error
    // Log error but don't throw (idempotent operation)
    console.error("Failed to delete from Cloudinary:", error)
  END TRY
END
```

**Preconditions:**

- url is string (may be empty or invalid)
- Cloudinary SDK is configured

**Postconditions:**

- If URL is valid Cloudinary URL, resource is deleted
- If URL is not Cloudinary URL, operation is no-op
- Operation is idempotent (safe to call multiple times)
- Errors are logged but not thrown

**Loop Invariants:** N/A

## Example Usage

```typescript
// Example 1: Upload image from gallery admin
const file = event.target.files[0];

// Client-side optimization (existing)
const optimizedFile = await optimizeImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
});

// Direct signed upload (file never hits Vercel)
import { uploadAdminImageDirect } from "@/lib/admin/client/directCloudinaryUpload";

const { url, publicId } = await uploadAdminImageDirect(optimizedFile, "gallery");
// url: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/riviera-open/gallery/abc-123.jpg"

// Example 2: Upload tournament photo
const { url } = await uploadAdminImageDirect(optimizedFile, "tournaments");
// Store URL in database
await fetch(`/api/admin/tournaments/${tournamentId}/photos`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ photoUrl: url }),
});

// Example 3: Delete image (future enhancement)
const publicId = extractPublicIdFromUrl(imageUrl);
if (publicId) {
  await cloudinaryService.deleteImage(publicId);
}

// Example 4: Generate responsive image URL
const responsiveUrl = cloudinary.url(publicId, {
  transformation: [
    { width: 800, height: 600, crop: "fill" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
});
// Returns optimized URL with WebP/AVIF format for modern browsers
```

## Correctness Properties

```typescript
// Property 1: Upload preserves image integrity
∀ file: File, folder: string.
  validateImage(file).valid = true ⟹
    ∃ result: UploadResult.
      uploadImage(file, folder) = result ∧
      result.url ≠ null ∧
      result.url.startsWith("https://") ∧
      result.publicId ≠ null

// Property 2: Validation rejects invalid files
∀ file: File.
  (file.size > 5MB ∨ file.type ∉ allowedTypes) ⟹
    validateImage(file).valid = false ∧
    validateImage(file).error ≠ null

// Property 3: Folder structure is preserved
∀ file: File, folder: string.
  validateImage(file).valid = true ⟹
    ∃ result: UploadResult.
      uploadImage(file, folder) = result ∧
      result.url.includes(`/riviera-open/${folder}/`)

// Property 4: Public IDs are unique
∀ file1: File, file2: File, folder: string.
  uploadImage(file1, folder).publicId ≠
  uploadImage(file2, folder).publicId

// Property 5: Deletion is idempotent
∀ publicId: string.
  deleteImage(publicId) ∧ deleteImage(publicId) ⟹
    no error thrown

// Property 6: URLs are always HTTPS
∀ file: File, folder: string.
  validateImage(file).valid = true ⟹
    uploadImage(file, folder).url.startsWith("https://res.cloudinary.com/")

// Property 7: Validation is pure (no side effects)
∀ file: File.
  validateImage(file) ∧ validateImage(file) ⟹
    file is unchanged

// Property 8: Upload failure preserves system state
∀ file: File, folder: string.
  uploadImage(file, folder) throws Error ⟹
    no partial data in database ∧
    no orphaned files in Cloudinary
```

## Error Handling

### Error Scenario 1: Missing Environment Variables

**Condition**: Cloudinary credentials not configured in environment
**Response**: Throw configuration error at startup
**Recovery**: Application fails to start; requires environment variable setup

### Error Scenario 2: Invalid File Type

**Condition**: User uploads non-image file or unsupported format
**Response**: Return 400 error with descriptive message
**Recovery**: User selects valid file type

### Error Scenario 3: File Size Exceeds Limit

**Condition**: File size > 5MB after client-side optimization
**Response**: Return 400 error with size limit message
**Recovery**: User compresses image or selects smaller file

### Error Scenario 4: Network Failure During Upload

**Condition**: Network connection lost or Cloudinary API unavailable
**Response**: Catch error, return 500 with retry message
**Recovery**: User retries upload; no partial data stored

### Error Scenario 5: Invalid Cloudinary Credentials

**Condition**: API key/secret incorrect or expired
**Response**: Throw authentication error
**Recovery**: Update environment variables with valid credentials

### Error Scenario 6: Cloudinary Storage Quota Exceeded

**Condition**: Account storage limit reached
**Response**: Return 507 Insufficient Storage error
**Recovery**: Upgrade Cloudinary plan or delete unused images

## Testing Strategy

### Unit Testing Approach

Test each function in isolation with mocked dependencies:

1. **Configuration Tests**
   - Valid environment variables load correctly
   - Missing variables throw configuration error
   - Invalid credentials are detected

2. **Validation Tests**
   - Valid files pass validation
   - Invalid file types are rejected
   - Oversized files are rejected
   - Null/undefined files are rejected

3. **Upload Tests**
   - Valid file uploads successfully
   - Upload returns correct URL format
   - Public ID is generated uniquely
   - Folder structure is applied correctly
   - Upload errors are handled gracefully

4. **Deletion Tests**
   - Valid public ID deletes successfully
   - Invalid public ID doesn't throw error
   - Non-Cloudinary URLs are ignored
   - Deletion is idempotent

5. **URL Extraction Tests**
   - Valid Cloudinary URLs extract public ID
   - Invalid URLs return null
   - Edge cases (malformed URLs) handled

### Property-Based Testing Approach

**Property Test Library**: fast-check (already in dependencies)

1. **Property: Upload preserves file metadata**
   - Generate random valid files
   - Upload each file
   - Verify returned metadata matches input

2. **Property: Validation is consistent**
   - Generate random files (valid and invalid)
   - Validate multiple times
   - Verify same result each time

3. **Property: Public IDs are unique**
   - Generate multiple files
   - Upload all files
   - Verify all public IDs are distinct

4. **Property: URL format is always valid**
   - Generate random valid files
   - Upload each file
   - Verify URL matches Cloudinary format pattern

### Integration Testing Approach

Test complete upload workflow with real Cloudinary test account:

1. **End-to-End Upload Flow**
   - Upload file via API endpoint
   - Verify file appears in Cloudinary dashboard
   - Verify URL is accessible
   - Verify image renders correctly

2. **Gallery Integration**
   - Upload photo via gallery admin
   - Verify photo appears in gallery
   - Verify URL stored in database

3. **Tournament Photo Integration**
   - Upload photo via tournament admin
   - Verify photo added to tournament
   - Verify URL stored in database

4. **Error Recovery**
   - Simulate network failures
   - Verify graceful error handling
   - Verify no partial data

## Performance Considerations

1. **Client-Side Optimization**: Maintain existing image optimization before upload to reduce bandwidth and upload time

2. **Streaming Upload**: Use Cloudinary's upload_stream API to avoid buffering entire file in memory

3. **Automatic Format Optimization**: Configure Cloudinary to automatically serve WebP/AVIF for modern browsers

4. **CDN Delivery**: Cloudinary's global CDN ensures fast image delivery worldwide

5. **Lazy Transformation**: Generate responsive image variants on-demand rather than pre-generating all sizes

6. **Caching**: Cloudinary URLs are immutable and cache-friendly (include version number)

## Security Considerations

1. **Secure Credentials**: Store API key/secret in environment variables, never in code

2. **HTTPS Only**: Always use secure URLs (secureUrl from upload result)

3. **Server-Side Validation**: Validate files on server even though client validates

4. **Signed Uploads** (Future): Consider signed uploads for additional security

5. **Access Control**: Cloudinary resources are public by default; consider private resources for sensitive images

6. **Rate Limiting**: Implement rate limiting on upload endpoint to prevent abuse

7. **CSRF Protection**: Existing CSRF protection applies to upload endpoint

## Dependencies

### New Dependencies

```json
{
  "cloudinary": "^2.0.0"
}
```

### Environment Variables

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Existing Dependencies (Maintained)

- Next.js 16.0.7 (API routes)
- React 19.2.0 (admin UI)
- TypeScript 5 (type safety)
- Image optimization utilities (client-side)

## Migration Strategy

### Phase 1: Setup Cloudinary Account

1. Create Cloudinary account (free tier: 25GB storage, 25GB bandwidth/month)
2. Obtain cloud name, API key, and API secret
3. Add environment variables to Vercel project settings
4. Add environment variables to local `.env.local`

### Phase 2: Implement Cloudinary Integration

1. Install cloudinary npm package
2. Create `lib/cloudinary/config.ts` with SDK configuration
3. Create `lib/cloudinary/upload.ts` with upload utilities
4. Update `lib/admin/services/FileUploadService.ts` to use Cloudinary
5. Use `POST /api/admin/upload-signature` + browser direct upload to Cloudinary (do not proxy file bytes through Vercel). Legacy `/api/admin/upload` removed; WAF Deny remains.

### Phase 3: Testing

1. Test upload in local development
2. Test upload in Vercel preview deployment
3. Verify images display correctly
4. Test error scenarios

### Phase 4: Migrate Existing Images (Optional)

If existing images in `/public/uploads/`:

1. Create migration script to upload existing images to Cloudinary
2. Update database URLs to point to Cloudinary
3. Verify all images display correctly
4. Remove local `/public/uploads/` directory

### Phase 5: Deploy to Production

1. Deploy to Vercel production
2. Verify uploads work in production
3. Monitor Cloudinary usage dashboard
4. Set up alerts for quota limits

## Folder Organization in Cloudinary

```
riviera-open/
├── players/
│   ├── {uuid}.jpg
│   ├── {uuid}.png
│   └── ...
├── tournaments/
│   ├── {uuid}.jpg
│   ├── {uuid}.webp
│   └── ...
└── gallery/
    ├── {uuid}.jpg
    ├── {uuid}.png
    └── ...
```

Each uploaded file:

- Stored in appropriate folder based on context
- Named with UUID to prevent collisions
- Preserves original file extension
- Accessible via Cloudinary CDN URL
