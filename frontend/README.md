# Tripster - Travel Agency Web App Frontend

A modern, scalable Next.js frontend for the Tripster travel agency platform, built with industry best practices for a billion-user scale application.

## 🚀 Features

- **Next.js 14+** with App Router for optimal performance
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom design system
- **SEO Optimized** with metadata, sitemap, and structured data
- **Feature-based Architecture** for scalability
- **DTOs & Type Safety** throughout the application
- **Responsive Design** - Mobile-first approach
- **Dark Mode Support**

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (traveler)/        # Traveler routes
│   ├── (agency)/          # Agency routes
│   └── (admin)/           # Admin routes
├── features/               # Feature-based modules
│   ├── auth/
│   ├── trips/
│   ├── agencies/
│   └── bookings/
├── shared/                # Shared resources
│   ├── components/        # Reusable UI components
│   ├── utils/             # Utility functions
│   └── lib/              # Third-party configs
├── types/                 # TypeScript types
│   ├── api/              # API DTOs
│   └── entities/         # Domain entities
├── services/              # API service layer
└── config/               # Configuration files
```

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Run the app**
   **Recommended (avoids 404s):** Build once, then run the production server:
   ```bash
   npm run serve
   ```
   Then open **http://localhost:3000** (or the port shown). This serves the app and all `_next/static` assets correctly.
   If you see **404 for the page and for assets** (layout.css, webpack.js, main-app.js, etc.), you are likely on `next dev` with the file watcher broken — use `npm run serve` instead.
   **With hot reload:** `npm run dev` or `npm run dev:fix` (may 404 on some systems due to "too many open files").

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 🎨 Design System

- **Primary Color**: `#137fec` (Blue)
- **Font**: Plus Jakarta Sans
- **Icons**: Material Symbols Outlined
- **Dark Mode**: Full support with class-based switching

## 📱 Pages Implemented

- ✅ Home Page
- ✅ Login Page
- ✅ Registration Page
- ✅ Trip Listings Feed
- 🔄 Traveler Dashboard (In Progress)
- 🔄 Agency Dashboard (In Progress)
- 🔄 Admin Dashboard (In Progress)

## 🔧 Key Technologies

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Zustand** - State management (when needed)
- **React Query** - Server state management (when needed)
- **Zod** - Schema validation

## 📊 SEO Features

- Dynamic metadata generation
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt configuration
- Open Graph tags
- Twitter Card support

## 🏗️ Architecture Decisions

1. **Feature-based Structure**: Organized by features for better scalability
2. **Server Components First**: Default to Server Components, use Client Components only when needed
3. **Type Safety**: DTOs and entities for API communication
4. **Code Splitting**: Route-based and component-based code splitting
5. **Performance**: Image optimization, lazy loading, ISR for public content

## 📝 Next Steps

1. Connect to Django backend API
2. Implement authentication flow
3. Add state management (Zustand/React Query)
4. Implement remaining dashboard pages
5. Add form validation with Zod
6. Add error boundaries
7. Implement loading states
8. Add unit and integration tests

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_SITE_URL` | Frontend site URL | `http://localhost:3000` |

## 📄 License

Private - FYP Project
