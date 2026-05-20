# Riviera Open - Professional Padel Circuit

Official website for the Riviera Open Padel Circuit featuring tournaments, player rankings, photo galleries, and sponsor information.

## Features

- 🏆 Tournament listings and details
- 📊 Player rankings across 7 skill levels
- 👤 Player profiles with tournament history
- 📸 Photo gallery from tournaments
- 📰 News and announcements
- 🤝 Sponsors showcase
- 📱 Fully responsive design
- ♿ Accessible (WCAG 2.1 AA compliant)
- ⚡ Optimized performance
- 🔐 Secure admin interface for content management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Fonts**: Google Fonts (Playfair Display, Inter)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for test database)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Set up test database (requires Docker)
npm run test:db:setup

# Run integration tests (requires test database)
npm run test:integration

# Stop test database
npm run test:db:stop

# Reset test database to clean state
npm run test:db:reset
```

### Environment Switching

Quickly switch between dev (mock data) and prod (SQL database) modes:

```bash
# Switch to dev mode (mock data, no database needed)
npm run env:switch dev

# Switch to prod mode (SQL database, starts database if needed)
npm run env:switch prod

# Interactive demo of both environments
npm run env:demo
```

**Current environment** is determined by `.env.local`:

- `NEXT_PUBLIC_ENV=dev` → Mock repositories (fast, no database)
- `NEXT_PUBLIC_ENV=prod` → SQL repositories (realistic, requires database)

See [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md) for detailed testing instructions.

### Test Database Setup

The project includes a PostgreSQL test database for integration testing:

1. **Start the test database**:

   ```bash
   npm run test:db:setup
   ```

   This will:
   - Start a PostgreSQL 16 container on port 5433
   - Create the `riviera_open_test` database
   - Run schema migrations
   - Seed test data

2. **Run integration tests**:

   ```bash
   npm run test:integration
   ```

3. **Stop the test database**:

   ```bash
   npm run test:db:stop
   ```

4. **Reset to clean state**:
   ```bash
   npm run test:db:reset
   ```

**Test Database Connection Details**:

- Host: `localhost`
- Port: `5433`
- Database: `riviera_open_test`
- User: `testuser`
- Password: `testpassword`
- Connection String: `postgresql://testuser:testpassword@localhost:5433/riviera_open_test`

## Project Structure

```
riviera-open-web/
├── app/                    # Next.js app directory
│   ├── (routes)/          # Page routes
│   ├── admin/             # Admin interface
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── home/             # Homepage sections
│   ├── tournaments/      # Tournament components
│   ├── rankings/         # Rankings components
│   ├── players/          # Player components
│   ├── gallery/          # Gallery components
│   ├── sponsors/         # Sponsor components
│   └── news/             # News components
├── lib/                   # Utilities and data
│   ├── admin/            # Admin services and utilities
│   ├── data/             # Data layer and repositories
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
└── public/               # Static assets
```

## Admin Interface

The admin interface provides a secure, web-based content management system for managing all website content.

### Accessing the Admin Interface

1. Navigate to `/admin` in your browser
2. Log in with admin credentials
3. Manage players, tournaments, gallery, and more

### Admin Credentials

**Development**:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Production**:
Set secure credentials in environment variables:

```env
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password
```

### Admin Features

- **Player Management**: Create, edit, delete players; manage rankings
- **Tournament Management**: Create tournaments, add categories, set winners
- **Photo Management**: Upload and organize tournament and gallery photos
- **Bulk Operations**: Perform actions on multiple items at once
- **Data Export**: Export players and tournaments to CSV
- **Audit Log**: Track all administrative actions
- **Search & Filter**: Quickly find specific content
- **Responsive Design**: Works on desktop, tablet, and mobile

### Security Features

- Session-based authentication with HTTP-only cookies
- CSRF protection on all state-changing operations
- Rate limiting on login attempts (5 per 15 minutes)
- Input sanitization to prevent XSS and SQL injection
- Audit logging of all administrative actions
- Automatic session expiration (24 hours)

### Admin User Guide

For detailed instructions on using the admin interface, see [ADMIN_USER_GUIDE.md](ADMIN_USER_GUIDE.md).

### Admin Environment Setup

The admin interface works with both dev (mock) and prod (database) environments:

**Development Mode** (Mock Data):

```env
NEXT_PUBLIC_ENV=dev
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Production Mode** (Database):

```env
NEXT_PUBLIC_ENV=prod
DATABASE_URL=postgresql://user:password@host:port/database
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms

The site can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Render

## Environment Variables

### Development

Create a `.env.local` file in the root directory (copy from `.env.local.example`):

```env
# Environment (dev or prod)
NEXT_PUBLIC_ENV=dev

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Production

For production deployment, set:

```env
# Environment
NEXT_PUBLIC_ENV=prod

# Database connection string
DATABASE_URL=postgresql://user:password@host:port/database

# Admin credentials (use secure values!)
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_secure_password

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Cloudinary Setup

The admin interface uses Cloudinary for cloud-based image storage and delivery:

1. **Create a Cloudinary account** (free tier includes 25GB storage):
   - Go to https://cloudinary.com/users/register/free
   - Sign up for a free account

2. **Get your credentials**:
   - Log in to https://console.cloudinary.com/
   - Find your credentials on the dashboard:
     - Cloud Name
     - API Key
     - API Secret

3. **Add credentials to environment variables**:
   - **Local development**: Add to `.env.local`
   - **Vercel deployment**: Add to project settings → Environment Variables

4. **Folder structure** (automatically created):
   - `riviera-open/players/` - Player photos
   - `riviera-open/tournaments/` - Tournament photos
   - `riviera-open/gallery/` - Gallery photos

**Note**: File uploads will not work without Cloudinary credentials. The free tier is sufficient for most use cases.

### Testing

For integration tests, the test database connection is automatically configured:

```env
DATABASE_URL=postgresql://testuser:testpassword@localhost:5433/riviera_open_test
```

## Performance

- Lighthouse Score: 90+ across all metrics
- Optimized images with WebP/AVIF
- Server-side rendering for SEO
- Automatic code splitting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2024 Riviera Open. All rights reserved.
