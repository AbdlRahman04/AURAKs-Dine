# AURAK Cafeteria - Smart Ordering System

## Overview

A web-based cafeteria ordering system designed for AURAK (American University of Ras Al Khaimir) that enables students to pre-order meals online, skip queues, and pick up orders at their convenience. The system features dual interfaces: a student-facing menu browsing and ordering system, and an admin panel for kitchen staff to manage menu items and track orders.

The application prioritizes speed and efficiency, implementing Material Design 3 principles with a mobile-first approach for students and desktop-optimized workflows for administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast Hot Module Replacement (HMR)
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component Strategy**
- shadcn/ui components built on Radix UI primitives for accessible, composable interfaces
- Tailwind CSS with custom design tokens following Material Design 3 guidelines
- Design system defined in `design_guidelines.md` with specific typography scale, spacing system, and color tokens
- CSS variables for theming with light/dark mode support

**State Management**
- TanStack Query (React Query) for server state management and caching
- React Context API for cart state (`CartContext`) - maintains shopping cart across student browsing sessions
- No global state library (Redux/Zustand) - keeping architecture simple with React's built-in tools

**Design Patterns**
- Mobile-first responsive design with specific breakpoints (md: 768px, lg: 1024px)
- Progressive disclosure: critical information displayed upfront, detailed views on demand
- Component composition pattern using shadcn/ui's slot-based architecture
- Custom hooks for cross-cutting concerns (`useAuth`, `useCart`, `useToast`, `useIsMobile`)

### Backend Architecture

**Server Framework**
- Express.js running on Node.js with TypeScript
- HTTP server created via Node's native `http` module
- WebSocket server (via `ws` library) for real-time order status updates

**Authentication & Session Management**
- Replit Auth via OpenID Connect (OIDC) for SSO authentication
- Passport.js strategy for auth middleware integration
- Session-based authentication using `express-session`
- Sessions stored in PostgreSQL using `connect-pg-simple`
- Role-based access control (student vs admin) implemented at route level

**API Design**
- RESTful API endpoints under `/api` prefix
- Authentication middleware (`isAuthenticated`, `isAdmin`) protecting routes
- Request logging middleware for debugging and monitoring
- JSON request/response format with Zod validation

**Real-time Communication**
- WebSocket connections for live order status updates to student and admin clients
- Broadcast pattern for kitchen display updates when order status changes

### Data Storage

**Database**
- PostgreSQL hosted on Neon (serverless Postgres)
- Drizzle ORM for type-safe database queries and migrations
- Connection pooling via `@neondatabase/serverless` with WebSocket support

**Schema Design**
- `users` table: stores student/admin profiles with Replit Auth integration
  - Supports 8-digit student IDs (FR-04)
  - Role-based access (student/admin)
  - Profile preferences (pickup location, contact details)
- `menu_items` table: cafeteria menu with categories, pricing, availability, dietary info
  - Support for specials with alternate pricing
  - Nutritional information and allergen tracking
  - Preparation time estimates
- `orders` table: order records with status tracking, pickup times, payment integration
- `order_items` table: junction table linking orders to menu items with quantities and customizations
- `favorites` table: student-specific menu item favorites
- `sessions` table: auth session persistence
- `audit_logs` table: system activity tracking for compliance

**Storage Pattern**
- Repository pattern via `storage.ts` interface
- All database operations abstracted behind IStorage interface
- Supports ACID transactions for order creation (order + order items created atomically)

### External Dependencies

**Payment Processing**
- Stripe integration for payment handling
  - Stripe.js and React Stripe.js for client-side payment elements
  - Server-side Stripe SDK for payment intent creation and webhooks
  - Environment variables: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`

**Authentication Provider**
- Replit Authentication (OpenID Connect)
  - Requires `REPL_ID`, `REPLIT_DOMAINS`, `ISSUER_URL`, `SESSION_SECRET` environment variables
  - Handles user registration, login, and profile management

**Database Service**
- Neon serverless PostgreSQL
  - WebSocket-based connection for serverless environments
  - `DATABASE_URL` environment variable for connection string

**Font Resources**
- Google Fonts: Inter (primary UI font) and Roboto Mono (order numbers)
- Loaded via HTML link tags in client/index.html

**Image Hosting**
- Unsplash for menu item placeholder images (in seed data)
- Image URLs stored as strings in database, supporting future CDN integration

**Development Tools**
- Replit-specific Vite plugins for development experience
  - `@replit/vite-plugin-runtime-error-modal`: Error overlay
  - `@replit/vite-plugin-cartographer`: Code navigation
  - `@replit/vite-plugin-dev-banner`: Development mode indicator