# Admin Interface

This directory contains the admin interface for managing Riviera Open content.

## Structure

```
/admin
├── /login                    # Authentication page
├── /dashboard                # Main dashboard with stats
├── /players                  # Player management
├── /tournaments              # Tournament management
├── /gallery                  # Gallery management
└── /audit-log                # Audit log viewer
```

## Authentication

The admin interface is protected by authentication middleware. Users must log in at `/admin/login` before accessing any admin pages.

### Default Credentials

Credentials are stored in environment variables:

- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password (hashed)

## Features

- **Dashboard**: Overview of all content with quick actions
- **Players**: Manage player profiles, contacts, and socials
- **Tournaments**: Manage tournaments, categories, winners, and photos
- **Gallery**: Manage photo gallery
- **Audit Log**: View all administrative actions

## Development

To access the admin interface in development:

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/login`
3. Log in with admin credentials
4. You'll be redirected to the dashboard

## Security

- All admin routes are protected by middleware
- Sessions are stored in HTTP-only cookies
- Unauthenticated users are redirected to login
- Sessions expire after 24 hours of inactivity
