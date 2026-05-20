# Design Document: Admin Interface

## Overview

The Admin Interface is a secure, web-based content management system built as a Next.js application. It provides a comprehensive dashboard for managing all Riviera Open website content including players, tournaments, categories, winners, photos, and galleries. The interface follows modern admin panel design patterns with a focus on usability, performance, and data integrity.

The system is designed to work seamlessly with the existing dual-environment architecture (dev/mock and prod/database), providing a unified interface regardless of the underlying data source.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Interface (Next.js)                │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Layer   │  │  UI Layer    │  │  API Layer   │      │
│  │ - Login      │  │ - Dashboard  │  │ - REST API   │      │
│  │ - Session    │  │ - Forms      │  │ - Validation │      │
│  │ - Middleware │  │ - Tables     │  │ - Error      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Repository Layer (Existing)                     │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Mock Repositories   │  │  SQL Repositories    │        │
│  │  (Dev Environment)   │  │  (Prod Environment)  │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Storage                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │   Mock Data Files    │  │  PostgreSQL Database │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Authentication**: NextAuth.js (or simple session-based auth)
- **UI Components**: React with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: Server Actions and API Routes
- **File Upload**: Next.js API routes with file handling
- **State Management**: React Context for global state
- **Icons**: Lucide React (already in project)

### Route Structure

```
/admin
├── /login                    # Authentication page
├── /dashboard                # Main dashboard with stats
├── /players
│   ├── /                     # List all players
│   ├── /new                  # Create new player
│   └── /[id]                 # View/edit player
├── /tournaments
│   ├── /                     # List all tournaments
│   ├── /new                  # Create new tournament
│   └── /[id]
│       ├── /                 # View/edit tournament
│       ├── /categories       # Manage categories
│       ├── /winners          # Manage winners
│       └── /photos           # Manage photos
├── /gallery
│   ├── /                     # Manage gallery photos
│   └── /upload               # Upload new photos
├── /audit-log                # View audit log
└── /settings                 # Admin settings
```

## Components and Interfaces

### 1. Authentication System

#### AdminAuthProvider

```typescript
interface AdminAuthProvider {
  login(credentials: AdminCredentials): Promise<AdminSession>;
  logout(): Promise<void>;
  validateSession(sessionId: string): Promise<boolean>;
  getCurrentUser(): Promise<AdminUser | null>;
}

interface AdminCredentials {
  username: string;
  password: string;
}

interface AdminSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

interface AdminUser {
  id: string;
  username: string;
  role: "admin" | "super_admin";
  createdAt: Date;
}
```

**Implementation Notes:**

- Use environment variables for admin credentials (simple approach)
- Store session in HTTP-only cookies
- Implement middleware to protect admin routes
- Session expires after 24 hours of inactivity

#### AuthMiddleware

```typescript
interface AuthMiddleware {
  checkAuth(request: Request): Promise<AuthResult>;
  redirectToLogin(request: Request): Response;
}

interface AuthResult {
  authenticated: boolean;
  user?: AdminUser;
}
```

### 2. Player Management

#### PlayerAdminService

```typescript
interface PlayerAdminService {
  // CRUD operations
  listPlayers(options: ListOptions): Promise<PaginatedResult<Player>>;
  getPlayer(id: string): Promise<Player | null>;
  createPlayer(data: CreatePlayerData): Promise<Player>;
  updatePlayer(id: string, data: UpdatePlayerData): Promise<Player>;
  deletePlayer(id: string): Promise<void>;

  // Bulk operations
  bulkDelete(ids: string[]): Promise<BulkOperationResult>;
  bulkUpdateCategory(
    ids: string[],
    category: string,
  ): Promise<BulkOperationResult>;

  // Search and filter
  searchPlayers(query: string): Promise<Player[]>;
  filterPlayers(filters: PlayerFilters): Promise<Player[]>;

  // Export
  exportPlayers(filters?: PlayerFilters): Promise<CSVData>;
}

interface CreatePlayerData {
  firstName: string;
  lastName: string;
  photo: string;
  category: PlayerCategory;
  gender: "Male" | "Female";
  points: number;
  rank: number;
  contact: {
    email: string;
    phone: string;
  };
  socials?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

interface UpdatePlayerData extends Partial<CreatePlayerData> {}

interface PlayerFilters {
  category?: PlayerCategory;
  gender?: "Male" | "Female";
  pointsMin?: number;
  pointsMax?: number;
  search?: string;
}

interface ListOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: PlayerFilters;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface BulkOperationResult {
  successful: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}
```

### 3. Tournament Management

#### TournamentAdminService

```typescript
interface TournamentAdminService {
  // CRUD operations
  listTournaments(options: ListOptions): Promise<PaginatedResult<Tournament>>;
  getTournament(id: string): Promise<TournamentDetail | null>;
  createTournament(data: CreateTournamentData): Promise<Tournament>;
  updateTournament(id: string, data: UpdateTournamentData): Promise<Tournament>;
  deleteTournament(id: string): Promise<void>;

  // Category management
  addCategory(
    tournamentId: string,
    category: string,
  ): Promise<TournamentCategory>;
  removeCategory(categoryId: string): Promise<void>;
  listCategories(tournamentId: string): Promise<TournamentCategory[]>;

  // Winner management
  setWinner(
    categoryId: string,
    placement: 1 | 2,
    data: WinnerData,
  ): Promise<CategoryWinner>;
  removeWinner(categoryId: string, placement: 1 | 2): Promise<void>;

  // Photo management
  addPhoto(tournamentId: string, photoUrl: string): Promise<TournamentPhoto>;
  removePhoto(photoId: string): Promise<void>;
  reorderPhotos(tournamentId: string, photoIds: string[]): Promise<void>;

  // Bulk operations
  bulkUpdateStatus(
    ids: string[],
    status: TournamentStatus,
  ): Promise<BulkOperationResult>;

  // Export
  exportTournaments(filters?: TournamentFilters): Promise<CSVData>;
}

interface CreateTournamentData {
  name: string;
  date: Date;
  club: string;
  location: string;
  genre: "Open" | "Women";
  status: TournamentStatus;
  registrationOpen: boolean;
  description?: string;
}

interface UpdateTournamentData extends Partial<CreateTournamentData> {}

interface TournamentDetail extends Tournament {
  categories: TournamentCategory[];
  photos: TournamentPhoto[];
}

interface WinnerData {
  playerId: string;
  playerName: string;
  photo: string;
}

interface TournamentFilters {
  status?: TournamentStatus;
  genre?: "Open" | "Women";
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
```

### 4. Gallery Management

#### GalleryAdminService

```typescript
interface GalleryAdminService {
  listPhotos(options: ListOptions): Promise<PaginatedResult<GalleryPhoto>>;
  uploadPhoto(file: File, metadata: PhotoMetadata): Promise<GalleryPhoto>;
  updatePhoto(id: string, metadata: PhotoMetadata): Promise<GalleryPhoto>;
  deletePhoto(id: string): Promise<void>;
  reorderPhotos(photoIds: string[]): Promise<void>;
}

interface GalleryPhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  displayOrder: number;
  uploadedAt: Date;
}

interface PhotoMetadata {
  title?: string;
  description?: string;
  displayOrder?: number;
}
```

### 5. File Upload Service

#### FileUploadService

```typescript
interface FileUploadService {
  uploadImage(file: File, options: UploadOptions): Promise<UploadResult>;
  validateImage(file: File): ValidationResult;
  deleteImage(url: string): Promise<void>;
}

interface UploadOptions {
  maxSizeMB: number;
  allowedTypes: string[];
  folder: string;
}

interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

**Implementation Notes:**

- Store uploaded files in `/public/uploads/` directory
- Generate unique filenames using UUID
- Validate file type and size before upload
- Support image optimization (resize, compress)
- Maximum file size: 5MB
- Allowed types: jpg, jpeg, png, webp

### 6. Audit Logging

#### AuditLogService

```typescript
interface AuditLogService {
  log(entry: AuditLogEntry): Promise<void>;
  listLogs(options: AuditLogOptions): Promise<PaginatedResult<AuditLogEntry>>;
  filterLogs(filters: AuditLogFilters): Promise<AuditLogEntry[]>;
}

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  username: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "bulk_update"
  | "bulk_delete";
type EntityType =
  | "player"
  | "tournament"
  | "category"
  | "winner"
  | "photo"
  | "gallery";

interface AuditLogOptions extends ListOptions {
  filters?: AuditLogFilters;
}

interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  dateFrom?: Date;
  dateTo?: Date;
}
```

**Implementation Notes:**

- Store audit logs in a separate database table or JSON file
- Log all create, update, and delete operations
- Include before/after values for updates
- Retain logs for 90 days minimum

### 7. Validation Service

#### ValidationService

```typescript
interface ValidationService {
  validatePlayer(data: CreatePlayerData | UpdatePlayerData): ValidationResult;
  validateTournament(
    data: CreateTournamentData | UpdateTournamentData,
  ): ValidationResult;
  validateCategory(category: string): ValidationResult;
  validateWinner(data: WinnerData): ValidationResult;
  validateEmail(email: string): ValidationResult;
  validatePhone(phone: string): ValidationResult;
  validateUrl(url: string): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

**Validation Rules:**

- **Player Category**: Must be one of: Open, 1, 2, 3, 4, 5, 6
- **Player Gender**: Must be Male or Female
- **Points**: Non-negative integer
- **Rank**: Non-negative integer
- **Email**: Valid email format (RFC 5322)
- **Phone**: Valid phone format (international or local)
- **Tournament Genre**: Must be Open or Women
- **Tournament Status**: Must be upcoming, in-progress, or completed
- **Winner Placement**: Must be 1 or 2
- **Photo URL**: Valid URL or file path
- **Required Fields**: All required fields must be present and non-empty

## Data Models

### Admin User Schema

```typescript
interface AdminUserSchema {
  id: string; // UUID
  username: string; // Unique username
  passwordHash: string; // Bcrypt hashed password
  role: "admin" | "super_admin";
  createdAt: Date;
  lastLoginAt?: Date;
}
```

### Audit Log Schema

```typescript
interface AuditLogSchema {
  id: string; // UUID
  timestamp: Date;
  userId: string; // Reference to admin user
  username: string;
  action: string; // create, update, delete, etc.
  entityType: string; // player, tournament, etc.
  entityId: string; // ID of affected entity
  changes: JSON; // Before/after values
  metadata: JSON; // Additional context
}
```

### File Upload Schema

```typescript
interface FileUploadSchema {
  id: string; // UUID
  filename: string; // Original filename
  storedFilename: string; // UUID-based filename
  url: string; // Public URL
  mimeType: string;
  size: number; // Bytes
  uploadedBy: string; // Admin user ID
  uploadedAt: Date;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Authentication Session Validity

_For any_ admin session, if the session is valid, then the session expiration time must be in the future and the session must exist in the session store.
**Validates: Requirements 1.1, 1.4**

### Property 2: Player Data Integrity

_For any_ player creation or update operation, if the operation succeeds, then all required fields must be present and all field values must pass validation rules.
**Validates: Requirements 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

### Property 3: Tournament Data Integrity

_For any_ tournament creation or update operation, if the operation succeeds, then all required fields must be present and all field values must pass validation rules.
**Validates: Requirements 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 4: Cascade Delete Consistency

_For any_ player deletion, all associated records (contacts, socials, tournament results) must also be deleted, and querying for those records must return empty results.
**Validates: Requirements 2.4, 10.1**

### Property 5: Tournament Cascade Delete Consistency

_For any_ tournament deletion, all associated records (categories, winners, photos, results) must also be deleted, and querying for those records must return empty results.
**Validates: Requirements 4.4, 10.2**

### Property 6: Category Cascade Delete Consistency

_For any_ tournament category deletion, all associated winners and results must also be deleted, and querying for those records must return empty results.
**Validates: Requirements 6.3, 10.3**

### Property 7: Unique Category Per Tournament

_For any_ tournament, attempting to add a duplicate category must fail, and the tournament must have at most one instance of each category value.
**Validates: Requirements 6.4**

### Property 8: Winner Placement Uniqueness

_For any_ tournament category, there must be at most one winner for placement 1 and at most one winner for placement 2.
**Validates: Requirements 7.6**

### Property 9: Search Result Consistency

_For any_ search query on players, all returned results must contain the search term in at least one searchable field (first name, last name, email).
**Validates: Requirements 2.5, 12.1**

### Property 10: Filter Combination Correctness

_For any_ set of filters applied to players or tournaments, all returned results must satisfy all filter conditions (AND logic).
**Validates: Requirements 2.5, 4.5, 12.3**

### Property 11: Pagination Consistency

_For any_ paginated list, the sum of all page sizes must equal the total count, and no record must appear on multiple pages.
**Validates: Requirements 11.5**

### Property 12: Sort Order Correctness

_For any_ sorted list, adjacent items must be in the correct order according to the sort field and direction.
**Validates: Requirements 2.6, 4.6**

### Property 13: Audit Log Completeness

_For any_ create, update, or delete operation that succeeds, an audit log entry must be created with the correct action, entity type, and entity ID.
**Validates: Requirements 13.1, 13.2, 13.3**

### Property 14: File Upload Validation

_For any_ file upload attempt, if the file type is not in the allowed list or the file size exceeds the maximum, the upload must fail with a validation error.
**Validates: Requirements 8.5, 8.6**

### Property 15: Bulk Operation Atomicity

_For any_ bulk operation, if any individual operation fails, the failure must be recorded in the result, and successful operations must not be rolled back.
**Validates: Requirements 18.3, 18.4, 18.5**

### Property 16: Form Data Preservation on Error

_For any_ form submission that fails validation, the form must retain all user-entered data for correction.
**Validates: Requirements 15.4**

### Property 17: Export Data Completeness

_For any_ data export operation, the exported data must include all records matching the current filters and all relevant fields.
**Validates: Requirements 17.3, 17.4**

### Property 18: Photo Display Order Consistency

_For any_ photo reordering operation, the new display order values must be sequential and unique within the tournament.
**Validates: Requirements 8.3, 9.5**

### Property 19: Winner Auto-fill Correctness

_For any_ winner selection where a player ID is provided, the player name and photo must match the player record in the database.
**Validates: Requirements 7.5**

### Property 20: Session Expiration Enforcement

_For any_ admin request, if the session has expired, the request must be rejected and the user must be redirected to login.
**Validates: Requirements 1.4**

## Error Handling

### Error Categories

1. **Validation Errors** (400 Bad Request)
   - Missing required fields
   - Invalid field values
   - Constraint violations
   - Format errors

2. **Authentication Errors** (401 Unauthorized)
   - Invalid credentials
   - Expired session
   - Missing session

3. **Authorization Errors** (403 Forbidden)
   - Insufficient permissions
   - Role-based access denial

4. **Not Found Errors** (404 Not Found)
   - Entity does not exist
   - Route not found

5. **Conflict Errors** (409 Conflict)
   - Duplicate category
   - Duplicate winner placement
   - Concurrent modification

6. **Server Errors** (500 Internal Server Error)
   - Database errors
   - File system errors
   - Unexpected exceptions

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ValidationError[];
    timestamp: Date;
  };
}
```

### Error Handling Strategy

1. **Client-Side Validation**: Validate forms before submission using Zod schemas
2. **Server-Side Validation**: Re-validate all data on the server
3. **User-Friendly Messages**: Display clear, actionable error messages
4. **Error Logging**: Log all errors for debugging and monitoring
5. **Graceful Degradation**: Provide fallback UI for non-critical errors
6. **Retry Mechanisms**: Allow users to retry failed operations
7. **Form State Preservation**: Keep form data on validation errors

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and error conditions for individual components and functions.

**Test Coverage:**

- Validation functions (email, phone, URL, category, etc.)
- Authentication logic (login, session validation, logout)
- Data transformation functions
- Error handling functions
- UI component rendering
- Form submission handlers

**Example Unit Tests:**

- Test that invalid email formats are rejected
- Test that expired sessions are detected
- Test that required fields trigger validation errors
- Test that cascade deletes remove all related records
- Test that pagination calculates correct page counts

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using the fast-check library (already in project).

**Configuration:**

- Minimum 100 iterations per property test
- Each test tagged with: **Feature: admin-interface, Property {number}: {property_text}**

**Property Test Coverage:**

- Property 1: Authentication session validity
- Property 2: Player data integrity
- Property 3: Tournament data integrity
- Property 4-6: Cascade delete consistency
- Property 7-8: Uniqueness constraints
- Property 9-10: Search and filter correctness
- Property 11-12: Pagination and sorting
- Property 13: Audit log completeness
- Property 14: File upload validation
- Property 15: Bulk operation atomicity
- Property 16: Form data preservation
- Property 17: Export data completeness
- Property 18: Photo ordering consistency
- Property 19: Winner auto-fill correctness
- Property 20: Session expiration enforcement

### Integration Testing

Integration tests will verify the interaction between components and the database.

**Test Coverage:**

- End-to-end CRUD operations for players
- End-to-end CRUD operations for tournaments
- Authentication flow (login → access protected route → logout)
- File upload and retrieval
- Cascade delete operations
- Bulk operations
- Search and filter operations
- Audit log creation

### Manual Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Access admin routes without authentication (should redirect)
- [ ] Create a new player with all fields
- [ ] Create a player with missing required fields (should fail)
- [ ] Update player information
- [ ] Delete a player and verify cascade delete
- [ ] Search for players by name
- [ ] Filter players by category and gender
- [ ] Create a new tournament
- [ ] Add categories to tournament
- [ ] Set winners for categories
- [ ] Upload tournament photos
- [ ] Reorder photos
- [ ] Delete tournament and verify cascade delete
- [ ] Perform bulk delete on players
- [ ] Export player data to CSV
- [ ] View audit log
- [ ] Test responsive design on mobile
- [ ] Test form validation errors
- [ ] Test session expiration

## Implementation Notes

### Phase 1: Foundation (Core Infrastructure)

- Set up admin route structure
- Implement authentication system
- Create base layout and navigation
- Set up middleware for route protection

### Phase 2: Player Management

- Build player list page with pagination
- Create player form (create/edit)
- Implement player CRUD operations
- Add search and filter functionality

### Phase 3: Tournament Management

- Build tournament list page
- Create tournament form
- Implement tournament CRUD operations
- Add category management
- Add winner management

### Phase 4: Photo Management

- Implement file upload service
- Build photo upload UI
- Add photo reordering
- Implement gallery management

### Phase 5: Advanced Features

- Add audit logging
- Implement bulk operations
- Add data export functionality
- Build audit log viewer

### Phase 6: Polish and Testing

- Add loading states and error boundaries
- Implement responsive design improvements
- Write comprehensive tests
- Perform security audit

### Security Considerations

1. **Authentication**: Use secure password hashing (bcrypt)
2. **Session Management**: HTTP-only cookies, secure flag in production
3. **CSRF Protection**: Implement CSRF tokens for forms
4. **Input Sanitization**: Sanitize all user inputs
5. **SQL Injection Prevention**: Use parameterized queries (already handled by repositories)
6. **File Upload Security**: Validate file types, scan for malware
7. **Rate Limiting**: Implement rate limiting on API routes
8. **Audit Logging**: Log all administrative actions

### Performance Optimizations

1. **Pagination**: Limit results to 20-50 items per page
2. **Lazy Loading**: Load images and large datasets on demand
3. **Debouncing**: Debounce search inputs (300ms delay)
4. **Caching**: Cache frequently accessed data (player lists, tournament lists)
5. **Optimistic Updates**: Update UI immediately, sync with server
6. **Image Optimization**: Compress and resize uploaded images
7. **Database Indexing**: Ensure proper indexes on frequently queried fields

### Accessibility

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader Support**: Proper ARIA labels and semantic HTML
3. **Focus Management**: Clear focus indicators
4. **Color Contrast**: WCAG AA compliance
5. **Form Labels**: All form inputs have associated labels
6. **Error Announcements**: Screen reader announcements for errors

## Future Enhancements

1. **Multi-language Support**: Admin interface in Spanish
2. **Role-Based Permissions**: Different permission levels for admins
3. **Advanced Analytics**: Dashboard with charts and statistics
4. **Batch Import**: Import players/tournaments from CSV
5. **Image Cropping**: Built-in image editor for photos
6. **Email Notifications**: Notify admins of important events
7. **Activity Dashboard**: Real-time view of recent changes
8. **Version History**: Track and revert changes to records
9. **Advanced Search**: Full-text search with filters
10. **Mobile App**: Native mobile app for admin tasks
