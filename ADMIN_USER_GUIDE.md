# Riviera Open Admin Interface - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Player Management](#player-management)
4. [Tournament Management](#tournament-management)
5. [Gallery Management](#gallery-management)
6. [Audit Log](#audit-log)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Admin Interface

1. Navigate to `/admin` in your browser
2. You will be redirected to the login page
3. Enter your admin credentials:
   - **Username**: `admin` (or as configured in environment)
   - **Password**: `admin123` (or as configured in environment)
4. Click "Login" to access the dashboard

### Navigation

The admin interface features a responsive navigation bar with the following sections:

- **Dashboard**: Overview and quick stats
- **Players**: Manage player profiles
- **Tournaments**: Manage tournaments, categories, and winners
- **Gallery**: Manage photo gallery
- **Audit Log**: View all administrative actions

**Mobile Navigation**: On mobile devices, tap the menu icon (☰) to access the navigation menu.

---

## Dashboard

The dashboard provides an overview of your content:

- Total number of players
- Total number of tournaments
- Recent activity
- Quick access to common tasks

---

## Player Management

### Viewing Players

1. Click **Players** in the navigation
2. View the list of all players with:
   - Name
   - Category (Open, 1-6)
   - Gender (Male/Female)
   - Points
   - Rank

### Searching and Filtering Players

**Search by Name**:

- Use the search box at the top of the players list
- Type the player's first or last name
- Results update automatically (with 300ms debounce)

**Filter by Category**:

- Use the "Category" dropdown
- Select a specific category (Open, 1, 2, 3, 4, 5, 6)
- Click "Clear Filters" to reset

**Filter by Gender**:

- Use the "Gender" dropdown
- Select Male or Female
- Combine with category filter for precise results

**Sorting**:

- Click column headers to sort
- Available sort options: Name, Points, Rank, Category
- Click again to reverse sort order

**Pagination**:

- Navigate through pages using the pagination controls
- Default: 20 players per page

### Creating a New Player

1. Click **"New Player"** button
2. Fill in the required fields:
   - **First Name** (required)
   - **Last Name** (required)
   - **Photo URL** (required)
   - **Category** (required): Select from Open, 1-6
   - **Gender** (required): Male or Female
   - **Points** (required): Non-negative integer
   - **Email** (required): Valid email format
   - **Phone** (required): Valid phone format

3. Optional fields:
   - **Instagram URL**: Full URL (e.g., https://instagram.com/username)
   - **Facebook URL**: Full URL
   - **Twitter URL**: Full URL

4. Click **"Create Player"**
5. Success message will appear
6. Player rank is automatically calculated based on points

**Note**: Rank is automatically assigned based on points within the player's category.

### Editing a Player

1. Click on a player's name in the list
2. Click **"Edit"** button
3. Modify the desired fields
4. Click **"Update Player"**
5. Rankings are automatically recalculated if points or category changed

### Deleting a Player

1. Click on a player's name
2. Click **"Delete"** button
3. Confirm the deletion in the modal
4. Player and all associated data (contacts, socials, tournament results) will be removed

**Warning**: This action cannot be undone!

### Bulk Operations

**Bulk Delete**:

1. Select multiple players using checkboxes
2. Click **"Bulk Actions"** dropdown
3. Select **"Delete Selected"**
4. Confirm the operation
5. View results summary (successful/failed)

**Bulk Update Category**:

1. Select multiple players
2. Click **"Bulk Actions"** → **"Update Category"**
3. Select new category
4. Confirm the operation
5. Rankings are recalculated for affected players

### Exporting Player Data

1. Apply any desired filters
2. Click **"Export"** button
3. CSV file will download with all player data
4. Export respects current filters

---

## Tournament Management

### Viewing Tournaments

1. Click **Tournaments** in the navigation
2. View list with:
   - Name
   - Date
   - Location
   - Genre (Open/Women)
   - Status (upcoming/in-progress/completed)

### Filtering Tournaments

**By Status**:

- Use the "Status" dropdown
- Select: Upcoming, In Progress, or Completed

**By Genre**:

- Use the "Genre" dropdown
- Select: Open or Women

**Sorting**:

- Click column headers to sort by Date, Name, or Status

### Creating a New Tournament

1. Click **"New Tournament"** button
2. Fill in required fields:
   - **Name** (required)
   - **Date** (required): Use date picker
   - **Club** (required)
   - **Location** (required)
   - **Genre** (required): Open or Women
   - **Status** (required): upcoming, in-progress, or completed
   - **Registration Open** (required): Toggle on/off
   - **Description** (optional)

3. Click **"Create Tournament"**
4. You'll be redirected to the tournament detail page

### Editing a Tournament

1. Click on a tournament name
2. Click **"Edit"** button
3. Modify fields as needed
4. Click **"Update Tournament"**

### Managing Tournament Categories

Categories represent skill levels within a tournament (Open, 1, 2, 3, 4, 5, 6).

**Adding a Category**:

1. Go to tournament detail page
2. Scroll to "Categories" section
3. Select category from dropdown
4. Click **"Add Category"**
5. Category appears in the list

**Removing a Category**:

1. Find the category in the list
2. Click **"Remove"** button
3. Confirm deletion
4. All associated winners and results are also removed

**Note**: You cannot add duplicate categories to the same tournament.

### Managing Tournament Winners

**Setting a Winner**:

1. Go to tournament detail page
2. Scroll to "Winners" section
3. Select a category
4. For First Place or Second Place:
   - Search for player by name
   - Select player from dropdown
   - Player name and photo auto-fill
   - Click **"Set Winner"**

**Removing a Winner**:

1. Find the winner in the list
2. Click **"Remove"** button
3. Confirm removal

**Note**: Each category can have one first place and one second place winner.

### Managing Tournament Photos

**Uploading Photos**:

1. Go to tournament detail page
2. Scroll to "Photos" section
3. Click **"Upload Photo"** button
4. Select image file (JPEG, PNG, WebP)
5. Maximum file size: 5MB
6. Image is automatically optimized (resized to max 1920x1920, 85% quality)
7. Photo appears in the list

**Reordering Photos**:

1. Drag and drop photos to reorder
2. Order is saved automatically
3. Display order affects how photos appear on the public website

**Deleting Photos**:

1. Click **"Delete"** button on a photo
2. Confirm deletion
3. Photo is removed from tournament

### Bulk Tournament Operations

**Bulk Status Update**:

1. Select multiple tournaments using checkboxes
2. Click **"Bulk Actions"** → **"Update Status"**
3. Select new status
4. Confirm operation

### Deleting a Tournament

1. Click on tournament name
2. Click **"Delete"** button
3. Confirm deletion
4. Tournament and all associated data (categories, winners, photos, results) are removed

**Warning**: This action cannot be undone!

### Exporting Tournament Data

1. Apply any desired filters
2. Click **"Export"** button
3. CSV file downloads with all tournament data
4. Export respects current filters

---

## Gallery Management

The gallery manages standalone photos that appear on the website's gallery page.

### Viewing Gallery Photos

1. Click **Gallery** in the navigation
2. Photos display in a grid layout
3. View photo metadata (title, description, display order)

### Uploading Gallery Photos

1. Click **"Upload Photo"** button
2. Select image file (JPEG, PNG, WebP, max 5MB)
3. Image is automatically optimized
4. Add optional metadata:
   - **Title**: Photo title
   - **Description**: Photo description
   - **Display Order**: Number for ordering (lower numbers appear first)
5. Click **"Upload"**

### Editing Photo Metadata

1. Click **"Edit"** on a photo
2. Modify title, description, or display order
3. Click **"Save"**

### Reordering Gallery Photos

1. Use drag-and-drop to reorder photos
2. Or manually set display order numbers
3. Changes save automatically

### Deleting Gallery Photos

1. Click **"Delete"** button on a photo
2. Confirm deletion
3. Photo is removed from gallery

---

## Audit Log

The audit log tracks all administrative actions for accountability and troubleshooting.

### Viewing the Audit Log

1. Click **Audit Log** in the navigation
2. View chronological list of all actions
3. Each entry shows:
   - Timestamp
   - User (admin username)
   - Action (create, update, delete, bulk_update, bulk_delete)
   - Entity Type (player, tournament, category, winner, photo, gallery)
   - Entity ID
   - Details/changes

### Filtering the Audit Log

**By Action**:

- Use "Action" dropdown
- Select: create, update, delete, bulk_update, or bulk_delete

**By Entity Type**:

- Use "Entity Type" dropdown
- Select: player, tournament, category, winner, photo, or gallery

**By Date Range**:

- Use date pickers to set start and end dates
- View actions within specific time period

**By User**:

- Filter by admin username (if multiple admins)

### Pagination

- Navigate through audit log pages
- Default: 50 entries per page

---

## Troubleshooting

### Login Issues

**Problem**: Cannot log in with credentials

**Solutions**:

1. Verify username and password are correct
2. Check if credentials are set in environment variables
3. Clear browser cookies and try again
4. Check browser console for errors
5. Note: Login attempts are rate-limited (5 attempts per 15 minutes)

---

### Session Expired

**Problem**: "Session expired" message appears

**Solution**:

1. Sessions expire after 24 hours of inactivity
2. Click "Login" to authenticate again
3. Your work is saved, you just need to re-authenticate

---

### File Upload Fails

**Problem**: Photo upload fails or shows error

**Solutions**:

1. Check file size (must be under 5MB)
2. Verify file type (JPEG, PNG, WebP only)
3. Check internet connection
4. Try a different image
5. Clear browser cache
6. Note: Uploads are rate-limited (10 per hour)

---

### Validation Errors

**Problem**: Form shows validation errors

**Solutions**:

1. Check all required fields are filled (marked with \*)
2. Verify email format is correct
3. Ensure phone number contains only valid characters
4. Check URLs start with http:// or https://
5. Verify points and rank are non-negative integers
6. Ensure category is one of: Open, 1, 2, 3, 4, 5, 6

---

### Search Not Working

**Problem**: Search doesn't return expected results

**Solutions**:

1. Wait for debounce (300ms after typing)
2. Check spelling of search term
3. Try partial name instead of full name
4. Clear all filters and try again
5. Refresh the page

---

### Bulk Operation Fails

**Problem**: Bulk operation shows failures

**Solutions**:

1. Check the error details in the results summary
2. Verify you have permission for the operation
3. Ensure selected items are valid
4. Try operation on smaller batches
5. Check audit log for details
6. Note: Bulk operations are rate-limited (5 per hour)

---

### Page Loads Slowly

**Problem**: Admin pages load slowly

**Solutions**:

1. Check internet connection
2. Clear browser cache
3. Reduce number of items per page
4. Use filters to narrow results
5. Close other browser tabs
6. Check if server is under heavy load

---

### Changes Not Saving

**Problem**: Edits don't save or disappear

**Solutions**:

1. Check for validation errors
2. Ensure you clicked "Save" or "Update" button
3. Check for error messages
4. Verify session hasn't expired
5. Check browser console for errors
6. Try refreshing and re-entering changes

---

### CSRF Token Error

**Problem**: "Invalid CSRF token" error appears

**Solutions**:

1. Refresh the page to get a new token
2. Tokens expire after 1 hour
3. Clear browser cache
4. Log out and log back in
5. Check browser console for errors

---

### Rate Limit Exceeded

**Problem**: "Too many requests" error (429)

**Solutions**:

1. Wait for the time specified in the error message
2. Rate limits:
   - Login: 5 attempts per 15 minutes
   - API: 100 requests per minute
   - Uploads: 10 per hour
   - Bulk operations: 5 per hour
3. Avoid rapid repeated actions
4. Contact administrator if limits are too restrictive

---

### Mobile Display Issues

**Problem**: Interface doesn't display correctly on mobile

**Solutions**:

1. Rotate device to landscape mode for tables
2. Use horizontal scroll for wide tables
3. Tap menu icon (☰) to access navigation
4. Zoom out if content is cut off
5. Update browser to latest version
6. Try different mobile browser

---

### Keyboard Navigation Issues

**Problem**: Cannot navigate with keyboard

**Solutions**:

1. Use Tab key to move between elements
2. Use Enter or Space to activate buttons
3. Use Escape to close modals
4. Use arrow keys in dropdowns
5. Ensure focus indicators are visible
6. Check browser accessibility settings

---

## Best Practices

### Data Entry

- Always fill required fields (marked with \*)
- Use consistent naming conventions
- Verify data before saving
- Double-check URLs and email addresses
- Use descriptive photo titles

### Photo Management

- Optimize images before upload when possible
- Use descriptive filenames
- Keep file sizes reasonable (under 2MB recommended)
- Maintain consistent aspect ratios
- Order photos logically

### Tournament Management

- Add categories before setting winners
- Set tournament status appropriately
- Keep registration status updated
- Add photos after tournament completion
- Export data regularly for backups

### Security

- Log out when finished
- Don't share admin credentials
- Use strong passwords
- Monitor audit log regularly
- Report suspicious activity

### Performance

- Use filters to narrow large lists
- Export data in smaller batches
- Close unused browser tabs
- Clear browser cache periodically
- Avoid bulk operations on very large datasets

---

## Keyboard Shortcuts

- **Tab**: Navigate to next element
- **Shift + Tab**: Navigate to previous element
- **Enter**: Submit form or activate button
- **Space**: Toggle checkbox or activate button
- **Escape**: Close modal or cancel action
- **Arrow Keys**: Navigate dropdown options

---

## Accessibility Features

- **Screen Reader Support**: All elements have proper ARIA labels
- **Keyboard Navigation**: Full keyboard support throughout
- **Focus Indicators**: Clear visual focus indicators
- **Color Contrast**: WCAG AA compliant
- **Error Announcements**: Screen readers announce errors
- **Loading States**: Clear indication of loading operations

---

## Support

For additional help or to report issues:

1. Check the audit log for error details
2. Review browser console for technical errors
3. Contact your system administrator
4. Refer to the technical documentation

---

## Version Information

- **Admin Interface Version**: 1.0.0
- **Last Updated**: January 2026
- **Compatible Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Chrome Mobile

---

## Appendix: Field Validation Rules

### Player Fields

- **First Name**: 1-100 characters, required
- **Last Name**: 1-100 characters, required
- **Photo URL**: Valid URL, required
- **Category**: Open, 1, 2, 3, 4, 5, or 6, required
- **Gender**: Male or Female, required
- **Points**: Non-negative integer, required
- **Rank**: Auto-calculated, read-only
- **Email**: Valid email format, required
- **Phone**: Valid phone format, required
- **Social URLs**: Valid URLs, optional

### Tournament Fields

- **Name**: 1-200 characters, required
- **Date**: Valid date, required
- **Club**: 1-200 characters, required
- **Location**: 1-200 characters, required
- **Genre**: Open or Women, required
- **Status**: upcoming, in-progress, or completed, required
- **Registration Open**: Boolean, required
- **Description**: Text, optional

### Photo Fields

- **File Type**: JPEG, JPG, PNG, WebP
- **File Size**: Maximum 5MB
- **Optimization**: Automatic (max 1920x1920, 85% quality)
- **Title**: Text, optional
- **Description**: Text, optional
- **Display Order**: Integer, optional

---

_End of Admin User Guide_
