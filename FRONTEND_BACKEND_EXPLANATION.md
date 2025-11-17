# Frontend vs Backend - Complete Explanation

## 🎨 Frontend (Client-Side) - What Users See

### Location: `client/` directory

### What It Does:
- Displays the user interface
- Handles user interactions (clicks, forms, etc.)
- Makes requests to backend API
- Shows data to users

### Key Files:

#### 1. **`client/src/App.tsx`** - Main Application
```typescript
// This is the root component of your React app
// It sets up routing and renders different pages
```
- **Purpose**: Main application component
- **What it does**: Handles routing, shows different pages based on URL
- **Shows**: Login page, menu page, admin pages, etc.

#### 2. **`client/src/main.tsx`** - Entry Point
```typescript
// This is where your React app starts
// It renders the App component into the HTML
```
- **Purpose**: Application entry point
- **What it does**: Renders React app into the browser

#### 3. **`client/src/pages/`** - All Pages
- `LoginPage.tsx` - Login screen
- `RegisterPage.tsx` - Registration screen
- `MenuPage.tsx` - Menu browsing
- `CheckoutPage.tsx` - Checkout process
- `OrdersPage.tsx` - User's orders
- `ProfilePage.tsx` - User profile
- `admin/MenuManagementPage.tsx` - Admin menu management
- `admin/KitchenDisplayPage.tsx` - Kitchen display
- etc.

#### 4. **`client/src/components/`** - Reusable Components
- `ui/` - Basic UI components (buttons, forms, etc.)
- `student/` - Student-specific components
- `admin/` - Admin-specific components
- `LandingPage.tsx` - Home page component

#### 5. **`client/src/contexts/`** - State Management
- `CartContext.tsx` - Shopping cart state
- `LanguageContext.tsx` - Language selection
- `ThemeContext.tsx` - Dark/light theme

#### 6. **`client/src/hooks/`** - Custom Hooks
- `useAuth.ts` - Authentication logic
- `use-mobile.tsx` - Mobile detection

#### 7. **`client/src/lib/`** - Utilities
- `authUtils.ts` - Authentication helpers
- `currency.ts` - Currency formatting
- `queryClient.ts` - API request configuration

### Technologies Used:
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching

---

## ⚙️ Backend (Server-Side) - The Logic

### Location: `server/` directory

### What It Does:
- Handles business logic
- Connects to database
- Processes API requests
- Returns data to frontend

### Key Files:

#### 1. **`server/index.ts`** - Server Entry Point
```typescript
// This starts your Express server
// Sets up middleware and starts listening for requests
```
- **Purpose**: Starts the Express server
- **What it does**: 
  - Creates Express app
  - Sets up middleware
  - Registers routes
  - Starts server on a port

#### 2. **`server/routes.ts`** - API Endpoints
```typescript
// Defines all API endpoints
// GET /api/menu-items
// POST /api/orders
// etc.
```
- **Purpose**: Defines all API routes
- **What it does**: 
  - Handles HTTP requests (GET, POST, PUT, DELETE)
  - Processes requests
  - Calls storage functions
  - Returns JSON responses

**Example endpoints:**
- `GET /api/menu-items` - Get all menu items
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `PATCH /api/profile` - Update user profile
- etc.

#### 3. **`server/storage.ts`** - Database Operations
```typescript
// Functions that interact with the database
// getAllMenuItems()
// createOrder()
// etc.
```
- **Purpose**: Database operations layer
- **What it does**: 
  - Reads from database
  - Writes to database
  - Uses Drizzle ORM to query database

**Example functions:**
- `getAllMenuItems()` - Get all menu items from database
- `createOrder()` - Save new order to database
- `getUserOrders()` - Get orders for a user
- etc.

#### 4. **`server/db.ts`** - Database Connection
```typescript
// Connects to PostgreSQL database
// Exports db instance for use throughout app
```
- **Purpose**: Database connection
- **What it does**: 
  - Creates connection to PostgreSQL
  - Exports database instance
  - Used by storage.ts to access database

#### 5. **`server/localAuth.ts`** - Authentication
```typescript
// Handles user login, registration, session management
```
- **Purpose**: Authentication logic
- **What it does**: 
  - User registration
  - User login
  - Password hashing
  - Session management

#### 6. **`server/init-db.ts`** - Database Setup
```typescript
// Creates database tables
// Run once to set up database
```
- **Purpose**: Initialize database
- **What it does**: Creates all database tables

### Technologies Used:
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety

---

## 🔄 How Frontend and Backend Communicate

### The Flow:

1. **User clicks button** (Frontend)
   ```
   User clicks "Add to Cart" button
   ```

2. **Frontend makes API request** (Frontend)
   ```typescript
   // In React component
   fetch('/api/menu-items')
     .then(res => res.json())
     .then(data => setMenuItems(data))
   ```

3. **Backend receives request** (Backend)
   ```typescript
   // In server/routes.ts
   app.get('/api/menu-items', async (req, res) => {
     const items = await storage.getAllMenuItems();
     res.json(items);
   })
   ```

4. **Backend queries database** (Backend)
   ```typescript
   // In server/storage.ts
   async getAllMenuItems() {
     return await db.select().from(menuItems);
   }
   ```

5. **Backend returns data** (Backend)
   ```json
   {
     "id": 1,
     "name": "Burger",
     "price": "10.00"
   }
   ```

6. **Frontend displays data** (Frontend)
   ```typescript
   // React component updates and shows menu items
   ```

### Visual Flow:

```
User Browser (Frontend)
    ↓
    [User clicks button]
    ↓
    [Makes HTTP request: GET /api/menu-items]
    ↓
Express Server (Backend)
    ↓
    [Receives request in routes.ts]
    ↓
    [Calls storage.getAllMenuItems()]
    ↓
    [Queries database using db.ts]
    ↓
PostgreSQL Database
    ↓
    [Returns data]
    ↓
Express Server
    ↓
    [Returns JSON response]
    ↓
User Browser
    ↓
    [Displays data to user]
```

---

## 📁 Complete File Structure

```
QuickDineFlow/
│
├── client/                          # FRONTEND
│   ├── src/
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   │
│   │   ├── pages/                  # All pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   └── admin/
│   │   │       ├── MenuManagementPage.tsx
│   │   │       └── KitchenDisplayPage.tsx
│   │   │
│   │   ├── components/             # UI components
│   │   │   ├── ui/                 # Basic components
│   │   │   ├── student/            # Student components
│   │   │   └── admin/              # Admin components
│   │   │
│   │   ├── contexts/               # State management
│   │   │   ├── CartContext.tsx
│   │   │   ├── LanguageContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── hooks/                  # Custom hooks
│   │   │   └── useAuth.ts
│   │   │
│   │   └── lib/                    # Utilities
│   │       ├── authUtils.ts
│   │       └── queryClient.ts
│   │
│   └── public/                     # Static files
│
├── server/                          # BACKEND
│   ├── index.ts                    # Server entry point
│   ├── routes.ts                   # API endpoints
│   ├── storage.ts                  # Database operations
│   ├── db.ts                       # Database connection
│   ├── localAuth.ts                # Authentication
│   └── init-db.ts                  # Database setup
│
└── shared/                          # SHARED CODE
    └── schema.ts                   # Database schema (used by both)
```

---

## 🎯 Key Differences

### Frontend:
- ✅ Runs in the browser
- ✅ What users see and interact with
- ✅ Makes HTTP requests to backend
- ✅ Displays data
- ✅ Handles user input

### Backend:
- ✅ Runs on the server
- ✅ Users don't see it directly
- ✅ Receives HTTP requests
- ✅ Processes business logic
- ✅ Connects to database

---

## 💡 Example: Adding Item to Cart

### Frontend Code (`client/src/pages/MenuPage.tsx`):
```typescript
function MenuPage() {
  const { addToCart } = useCart();
  
  const handleAddToCart = (item) => {
    addToCart(item);  // Updates frontend state
  };
  
  return (
    <button onClick={() => handleAddToCart(menuItem)}>
      Add to Cart
    </button>
  );
}
```

### Backend Code (`server/routes.ts`):
```typescript
// This endpoint is called when user places order
app.post('/api/orders', isAuthenticated, async (req, res) => {
  const order = await storage.createOrder(req.body);
  res.json(order);
});
```

### Backend Database Code (`server/storage.ts`):
```typescript
async createOrder(orderData) {
  // Save to database
  const [order] = await db.insert(orders)
    .values(orderData)
    .returning();
  return order;
}
```

---

## 📝 What to Write in Your Report

### Frontend Section:

```
The frontend is implemented using React with TypeScript, providing a modern, 
component-based user interface. The application follows a single-page 
application (SPA) architecture, where all pages are rendered client-side 
without full page reloads.

Key components:
- Pages: Login, Menu, Checkout, Orders, Profile, Admin panels
- Reusable UI components: Buttons, forms, cards, modals
- State management: React Context API for global state (cart, theme, language)
- Data fetching: React Query for efficient API communication

The frontend communicates with the backend through RESTful API endpoints, 
sending HTTP requests and receiving JSON responses.
```

### Backend Section:

```
The backend is implemented using Node.js with Express.js framework, providing 
RESTful API endpoints for the frontend. The backend handles:

- Authentication and authorization
- Business logic processing
- Database operations through Drizzle ORM
- Payment processing integration (Stripe)
- Session management

The backend follows a layered architecture:
- Routes layer: Handles HTTP requests (`server/routes.ts`)
- Storage layer: Database operations (`server/storage.ts`)
- Database layer: Connection and schema (`server/db.ts`, `shared/schema.ts`)

This separation ensures maintainability and testability of the codebase.
```

---

This should help you explain the frontend/backend separation in your report!

