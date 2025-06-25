# Rev X Rent

Rev X Rent is a modern, full-featured car rental platform built with Next.js, React, and MongoDB. It offers a seamless experience for both customers and administrators, supporting car rentals, user management, order processing, and more. The platform is designed for flexibility, scalability, and ease of use, with a focus on both individual and group rentals.

## 🚗 New: Pickup Request System & Admin Panel
- **Pickup Request System:** Anyone can request a car pickup (with or without an account). Requests include customer info, pickup/drop locations, time, car category, and headcount.
- **User/Email Lookup:** Logged-in users see their own requests. If a request was made while logged out, users can look up requests by email.
- **Admin Pickup Requests Panel:** Admins can view, update, and manage all pickup requests (status, price, etc.) from a dedicated admin page, accessible from the Admin Options menu.
- **JWT-based Authentication:** The platform now uses a custom JWT-based authentication system for all user and admin features, removing the need for next-auth and resolving deployment conflicts.

## Key Features

- **Car Rental Catalog**: Browse, search, and filter a wide range of vehicles by category (Economy, SUV, Luxury, Van) with real-time availability and detailed information.
- **Pickup Request System**: Anyone (even without an account) can request a car pickup by filling out a simple form (name, email, phone, pickup/drop locations, time, car category, headcount). Logged-in users can view their own pickup requests or look them up by email.
- **Admin Pickup Requests Panel**: Admins can view, update, and manage all pickup requests, including status and pricing, from a dedicated dashboard.
- **User Authentication & Profiles**: Secure signup, login, and profile management. Role-based access for users and admins. JWT-based authentication for all features.
- **Wishlist & Cart**: Save favorite cars to a wishlist, add cars to a cart, and manage rental or purchase options.
- **Order Management**: Place, track, and manage rental and purchase orders. Admins have a comprehensive dashboard for all orders, with advanced filtering and status management.
- **Admin Dashboard**: Manage users, cars, orders, and platform settings. Role-based access ensures only authorized users can access admin features.
- **Responsive UI**: Mobile-first, adaptive design with light/dark theme support and a modern, intuitive interface.
- **Email Notifications**: Automated emails for order updates, confirmations, and account actions.
- **Secure Payments**: Integrated payment processing for rental and purchase transactions (Stripe-ready).

### Recent Addition: Pickup Request Feature
- Prominently featured on the home page with a dynamic, animated call-to-action.
- Accessible from the main navigation bar ("Pickup Request" or "Ride_?").
- Open to all users (no login required to submit a request).
- Logged-in users can view a list of their own pickup requests, or look up requests by email.
- All requests are securely stored in the database and visible to admins for processing and management.
- Admins can update request status and pricing from the admin panel.
- JWT-based authentication is now used throughout the platform for secure, conflict-free deployment.

---

## Recent Features & Improvements (as of May 2025)

- **Pickup Request Admin Panel & JWT Auth Refactor**
  - Admins can view, update, and manage all pickup requests (status, price, etc.)
  - Users can look up requests by email if not logged in
  - All authentication now uses a custom JWT-based system (no next-auth)
  - Resolves all deployment and dependency conflicts
- **Payment Enablement for Orders**
  - Admins can enable/disable payment for any order
  - Users see a "Pay Now" button only when payment is enabled and order is in the correct status
- **Comprehensive Email Notifications**
  - Email notifications sent for all order changes (status, payment, shipping, tax, offers)
  - New email template for order updates
  - Robust error handling and parameter validation for email sending
- **Discounts & Offers System**
  - Fixed and percentage-based offers can be applied to orders
  - Accurate display and calculation of original total, discount, and final total
  - Admin UI for managing offers on orders
- **Order Management Enhancements**
  - Admin dashboard for all orders with advanced filtering, sorting, and search
  - Price range filter for orders
  - Tax and shipping fee adjustment (fixed, custom, percentage)
  - Visual status indicators and confirmation messages
- **Rental & Mixed Cart Functionality**
  - Full support for rental products, including duration and rate selection
  - Mixed cart checkout (purchase + rental in one order)
- **Persistent Cart & Wishlist**
  - MongoDB-backed storage with localStorage fallback
- **User Management**
  - Role-based access control (admin/user)
  - Admin dashboard for user management
- **API & Backend**
  - RESTful API for all major resources (products, users, orders, cart, wishlist)
  - Secure authentication and authorization

### Recent Technical Additions (from git log)
- Role-based access control and admin dashboard
- Wishlist and cart with persistent storage
- Rental system and multi-view filtering
- All-orders admin dashboard
- MongoDB storage for cart/wishlist
- Price range filter in catalog and orders
- Percentage-based tax adjustment

---

## Features

### Core Functionality
- **Product Management**
  - Create, read, update, and delete (CRUD) operations
  - Product details including name, brand, category, price, image, and description
  - Product listing with image and price display
  - Product search with real-time results

### User Authentication and Authorization
- **Secure Account System**
  - User registration with email, username, and password
  - Secure login with JWT authentication
  - Username availability checking in real-time
  - Password hashing and security
  - Protected routes for authenticated users
  - User profile management
  - HTTP-only cookies for enhanced security
  - Role-based access control (admin/user)
  - Dynamic navigation based on user role

### Admin Dashboard
- **User Management**
  - View all users with sorting and filtering
  - Create new user accounts
  - Edit existing user profiles
  - Delete user accounts
  - Toggle admin privileges dynamically
  - Real-time admin status updates across the application
  - Admin-first sorting (admin users displayed at the top)
  - Visual distinction of admin users in the table

- **Comprehensive Order Management**
  - View all customer orders in a single admin-only dashboard
  - Filter orders by status (Processing, Paid, Confirmed, Sent, Delivered, Cancelled)
  - Filter orders by type (Purchase, Rental, Combined)
  - Search orders by order number, customer name, or email
  - Sort orders by various fields (date, status, customer name, total)
  - View detailed order information including shipping details
  - Update order status with real-time confirmation
  - Visual status indicators with intuitive color-coding
  - Admin-specific actions for order management

### Admin All Orders Dashboard
- **Complete Order Management**:
  - Centralized view of all customer orders across the platform
  - Admin-only access with protected routes
  - Real-time status updates for order processing
- **Advanced Filtering and Sorting**:
  - Filter orders by status (Processing, Paid, Confirmed, Sent, Delivered, Cancelled)
  - Filter by order type (Purchase, Rental, Combined)
  - Search functionality by order number, customer name, or email
  - Multi-field sorting with ascending/descending options
- **Detailed Order Information**:
  - Expandable order details with shipping information
  - Complete financial breakdown with subtotals, tax, and shipping
  - Itemized list of products with type, price, and quantity
  - Special handling for rental items with duration and rates
- **Admin Actions**:
  - Status update dropdown with intuitive workflow
  - Visual confirmation of status changes
  - Color-coded status indicators
  - Responsive design for all device sizes

### Enhanced Catalog Experience
- **Multiple View Modes**
  - Grid view (All Products) - Default landing view
  - Categories view with horizontal product sliders
  - Brands view with horizontal product sliders

- **Advanced Filtering System**
  - Multi-select category filtering with custom checkbox UI
  - Multi-select brand filtering with custom checkbox UI
  - Cross-filtering capabilities between categories and brands
  - Search within filter dropdowns
  - **Price Range Filtering** with dual sliders and numeric inputs
  - Visual display of active filters for immediate feedback
  - Filter reset capabilities for quickly returning to default view

- **Smart Sorting Options**
  - Price: Low to High
  - Price: High to Low
  - Date: Newest First
  - Date: Oldest First

- **Dedicated Catalog Pages**
  - Category-specific product pages
  - Brand-specific product pages
  - Consistent filtering and sorting across all pages

### User Experience
- **Dark/Light Theme**
  - Toggle between dark and light modes
  - Theme preference saved in local storage
  - System preference detection

- **Improved Navigation UI**
  - Consolidated admin functionality in a dropdown menu
  - Streamlined header with optimized button placement
  - Reduced redundancy by removing duplicate navigation options
  - Role-based navigation that adapts to user permissions
  - Clear visual distinction for admin-only features
  - Mobile-responsive dropdown design

- **Search Functionality**
  - Real-time search with debounce
  - Search across multiple fields (name, brand, description, category)
  - Instant search results with product previews
  - Mobile-responsive search experience

- **Responsive Design**
  - Mobile-first approach
  - Adaptive layout for different screen sizes
  - Optimized navigation for mobile devices

### Business Features
- **E-commerce Capabilities**
  - Product purchase option
  - Product rental system with duration selection
  - Transaction history tracking
  - Public and admin-only features cleanly separated

### Shopping Features
- **Wishlist Functionality**
  - Add products to wishlist from product detail pages
  - User-specific wishlist storage tied to user ID
  - Persistent database storage with localStorage fallback
  - Authentication required for wishlist access
  - Dedicated wishlist dashboard displaying saved products
  - "Add All to Cart" functionality to transfer wishlist items to cart
  - Real-time wishlist counter in navigation header
  - Buy and Rent options for each wishlist item
  - Remove items from wishlist with one click
  - Data persistence across sessions and devices

- **Cart Functionality**
  - Add products to cart from product detail pages and wishlist
  - User-specific cart storage tied to user ID
  - Persistent database storage with localStorage fallback
  - Authentication required for cart access
  - Dedicated cart page showing selected products
  - Quantity controls with real-time price calculations
  - Buy and Rent options for each cart item
  - Checkout section with order summary
  - Real-time cart counter in navigation header
  - Data persistence across sessions and devices

- **Buy Functionality**
  - "Buy Now" buttons on product cards and detail pages
  - Direct checkout option bypassing shopping cart
  - User-specific checkout process requiring authentication
  - Comprehensive checkout form with shipping details
  - Order processing with unique order IDs
  - Confirmation messaging and automatic redirection to order history
  - Order details storage in user-specific order history
  - Complete purchase flow from product selection to confirmation

- **Rent Functionality**
  - "Rent" buttons on product cards and detail pages
  - Rental-specific checkout process
  - Duration selection for rental period (days)
  - Dynamic pricing calculation based on daily rate (10% of product price)
  - Automatic return date calculation
  - Rental-specific details in checkout summary
  - Clear distinction between purchases and rentals in order history
  - Complete rental flow from product selection to confirmation

- **Checkout Process**
  - Comprehensive checkout page for purchases and rentals
  - Required fields for shipping address, name, email and contact details
  - Rental duration field for rental orders
  - Dynamic price calculation for rentals based on duration
  - Real-time order summary during checkout
  - Order confirmation with transaction details
  - Order history dashboard for tracking purchases and rentals

- **Order Management**
  - Unified order history page for both purchases and rentals
  - Clear identification of order types (Purchase vs. Rental)
  - Detailed order information including shipping address
  - Order status tracking with multiple statuses (Processing, Paid, Confirmed, Sent, Delivered, Cancelled)
  - Admin-only order management dashboard for handling all customer orders
  - Status update functionality with visual confirmation
  - Expandable order details for complete transaction information
  - Rental-specific information including duration and return date
  - User-specific order history storage for privacy
  - Admin-controlled order status updates with intuitive workflow

### Recently Added Advanced Rental Functionality
- **Rental Product Catalog Integration**
  - Dedicated "Rental" tab in the product catalog to view all rentable products
  - "Rentable Only" toggle filter in the grid view for quickly finding rental products
  - Conditional display of rent buttons only for products with rental pricing
  - Intelligent filtering of products based on rental availability
  - Visual indicators for rentable products throughout the interface

- **Smart Rental Option Display**
  - Rent buttons only appear for products that have valid rental pricing
  - Consistent rental option visibility across product cards, detail pages, cart, and wishlist
  - Backend validation to ensure rental rates are properly defined
  - Elegant UI design that adapts based on product rental status

- **Enhanced Checkout Experience**
  - Support for mixed cart checkout with both purchase and rental items
  - Dynamic buy/rent toggle switches in checkout for each product
  - Separate quantity controls for purchase and rental items
  - Hourly and daily rental rate options with automatic price calculation
  - Duration selector for rental items with real-time subtotal updates
  - Proper tax and shipping calculations for mixed orders

- **Improved Order Management**
  - Combined order type indicators ("Purchase", "Rental", or "Combined")
  - Detailed display of each item's rental specifics (duration, rate, return date)
  - Clear visual distinction between purchased and rented items
  - Support for viewing complex order details with mixed item types
  - Order history dashboard with filter options for different order types

### Recently Added Features

#### Advanced Price Range Filter
- **Intuitive Dual-Slider Interface**: 
  - Interactive price range selection with min/max sliders
  - Visual feedback showing the selected price range
  - Automatic detection of available price ranges based on current products
- **Direct Numeric Input**:
  - Manual entry of specific price values for precise filtering
  - Real-time validation to prevent invalid ranges
  - Currency formatting for improved readability
- **Context-Aware Ranges**:
  - Dynamically adjusts min/max values based on the current category or brand
  - Remembers user selections within browsing session
- **Enhanced Filter Visibility**:
  - "Active Filters" section showing currently applied filters
  - Clear visual indicators of which filters are active
  - One-click reset option to clear price filters
- **Responsive Design**:
  - Adapts perfectly to mobile, tablet, and desktop views
  - Touch-friendly controls for mobile users

#### Modern Home Page with Enhanced Navigation
- **New Modern Homepage**:
  - Dedicated landing page separate from the catalog
  - Automatic image carousel with fade transitions
  - Featured product highlights from database
  - Category quick-access cards
  - New arrivals section with latest products
- **Try Before You Buy Section**:
  - Promotional section for rental services
  - Auto-rotating product image carousel
  - Feature list of rental benefits
- **Improved Navigation Structure**:
  - Dedicated navigation links for Home, Catalog, About, and Contact
  - Clear separation between catalog and home page
  - Breadcrumb navigation for improved user experience
- **Category Pages Improvements**:
  - Case-insensitive category matching for reliable product filtering
  - Improved empty state handling and user guidance
  - Category-specific product display with proper case handling
- **Image Display Optimization**:
  - Non-stretched image display with proper aspect ratio preservation
  - Background styling for consistent image presentation
  - Optimized image containers with proper centering
  - Fade effects for smooth image transitions in carousels

## Technology Stack

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation
- **React**: UI component library
- **CSS3**: Custom styling with responsive design
- **Context API**: State management for theme, authentication, and filters

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: NoSQL database for product and user storage
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT Authentication**: JSON Web Tokens for secure authentication
- **bcrypt**: Password hashing for security
- **cookie-parser**: HTTP cookie parsing middleware

### Development Features
- **In-memory Database**: For development without MongoDB connection
- **Dark/Light Theme**: Theme preference stored in localStorage
- **Responsive Design**: Mobile-first approach
- **Protected Routes**: HOC for securing routes that require authentication
- **Role-based HOC**: Extended HOC for admin-only routes

## Project Structure

```
Rev X Rent/
├── components/             # Reusable React components
│   ├── CategoryTabs.js     # Category tabs navigation
│   ├── FilterBar.js        # Advanced filtering and sorting component
│   ├── Layout.js           # Main layout with header, footer, and navigation
│   ├── ProductCard.js      # Individual product card component
│   ├── ProductSlider.js    # Horizontal product slider
│   ├── SearchBar.js        # Global search component
│   └── ThemeToggle.js      # Theme switcher component
│
├── lib/                    # Utility functions
│   ├── AuthContext.js      # Authentication context provider with role management
│   ├── auth.js             # Authentication utilities (JWT, cookies)
│   ├── middleware.js       # Custom middleware for cookie parsing
│   ├── mongodb.js          # Database connection and mock DB
│   ├── ThemeContext.js     # Theme context provider for dark/light mode
│   └── withAuth.js         # HOC for protected routes with admin role support
│
├── models/                 # Database models
│   ├── Product.js          # Product schema definition
│   ├── User.js             # User schema definition with isAdmin field
│   └── Order.js            # Order schema for persistent order storage
│
├── pages/                  # Next.js pages
│   ├── _app.js             # App wrapper component
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication API endpoints
│   │   │   ├── login.js    # Login endpoint with role information
│   │   │   ├── signup.js   # Registration endpoint
│   │   │   ├── logout.js   # Logout endpoint
│   │   │   ├── me.js       # Current user endpoint with role information
│   │   │   └── check-username.js # Username availability check
│   │   ├── products.js     # API for product listing and creation
│   │   ├── product/        # Product-specific API endpoints
│   │   │   └── [id].js     # Individual product operations
│   │   ├── orders.js       # API for order listing and creation
│   │   ├── order/          # Order-specific API endpoints
│   │   │   └── [id].js     # Individual order operations including status updates
│   │   ├── seed-orders.js  # Development endpoint for seeding test orders
│   │   ├── users.js        # API for user listing and creation
│   │   ├── users/          # User-specific API endpoints
│   │   │   └── [id].js     # Individual user operations including role management
│   │   └── transactions.js # Transaction processing
│   ├── brand/              # Brand-specific pages
│   │   └── [slug].js       # Brand catalog page
│   ├── category/           # Category-specific pages
│   │   └── [slug].js       # Category catalog page
│   ├── login.js            # User login page
│   ├── signup.js           # User registration page
│   ├── profile.js          # User profile page
│   ├── dashboard.js        # Admin user management dashboard (admin only)
│   ├── all-orders.js       # Admin-only dashboard for managing all customer orders
│   ├── index.js            # Homepage with product listing
│   ├── add-product.js      # Product creation form (admin only)
│   ├── product/            # Product pages
│   │   └── [id].js         # Product detail page
│   ├── update-product/     # Product update pages
│   │   └── [id].js         # Product edit form (admin only)
│   ├── cart.js             # Shopping cart page
│   ├── wishlist.js         # User wishlist page
│   ├── checkout.js         # Checkout process page for both purchases and rentals
│   └── orders.js           # Order history and details page
│
└── styles/                 # CSS styles
    └── globals.css         # Global styles including dark/light theme and admin UI
```

## Implemented Features in Detail

### User Authentication and Authorization System
- **Secure Registration**: Email, username, and password-based signup
- **Real-time Username Validation**: Check username availability as you type
- **Secure Login**: Username and password authentication
- **JWT-based Sessions**: Secure authentication using HTTP-only cookies
- **Protected Routes**: Authentication-required pages with automatic redirection
- **Role-based Access Control**: 
  - Admin-only routes with automatic redirection
  - Dynamic navigation based on user role
  - Real-time UI updates when user role changes
- **User Profile**: View and edit personal information
- **Logout Functionality**: Clear sessions and cookies
- **Form Validation**: Client-side validation for all authentication forms
- **Error Handling**: Clear error messages for authentication issues
- **Security Features**:
  - Password hashing with bcrypt and salt
  - HTTP-only cookies to prevent XSS attacks
  - JWT token verification on protected routes
  - Secure middleware for cookie parsing
  - Role verification for admin-only functionalities

### Admin Dashboard for User Management
- **Comprehensive User Management**:
  - List all registered users with search functionality
  - Add new users (with or without admin privileges)
  - Edit existing user information
  - Delete users from the system
  - Change user roles (promote to admin or demote to regular user)
- **Dynamic Authentication Refreshing**:
  - Real-time UI updates when user roles change
  - Navigation automatically updates to show/hide admin options
  - Header elements update to reflect current user status
- **Advanced Table Features**:
  - Search users by name, username, or email
  - Sort users with admins displayed at the top
  - Visual distinction of admin users with subtle color coding
  - Responsive table design for all screen sizes
- **Enhanced UX for Admins**:
  - Confirmation dialogs for critical actions
  - Visual feedback during loading states
  - Success and error messages for all operations
  - Auto-refresh user list after operations

### Enhanced Filtering and Sorting System
- **Multi-select Filtering**: Choose multiple categories and brands simultaneously
- **Cross-Filtering**: Filter products by both category and brand criteria
- **Custom Checkbox UI**: Modern user interface with checkmarks instead of traditional checkboxes
- **Search Within Filters**: Search functionality within dropdown menus for quick access
- **Empty State Handling**: Proper handling when no matches are found in filters
- **Sorting Options**: Multiple sorting criteria for price and date
- **Auto-Updating Results**: Results update dynamically as filters and sorting change

### View Modes
- **Grid View (All Products)**: Default view showing all products with filtering options
- **Categories View**: Products organized by category in horizontal sliders
- **Brands View**: Products organized by brand in horizontal sliders

### Catalog Pages
- **Category Pages**: Dedicated pages for each product category
- **Brand Pages**: Dedicated pages for each product brand
- **Breadcrumbs Navigation**: Clear breadcrumb trail showing "Products > Category/Brand"

### Product Management
- Complete CRUD operations for product management (admin only)
- Form validation for product creation and updates
- Product categorization system
- Image URL support for product display
- Buy/Rent buttons for all visitors regardless of login status

### Theme Switching
The application supports both light and dark modes with automatic system preference detection. The theme preference is saved in localStorage for persistent user experience.

### Real-time Search
- AJAX-powered search functionality
- Debounced input to reduce unnecessary API calls
- Search across multiple fields (name, brand, description, category)
- Real-time results display with product images and prices

### Shopping Features
- **Wishlist Functionality**
  - Add products to wishlist from product detail pages
  - User-specific wishlist storage tied to user ID
  - Persistent database storage with localStorage fallback
  - Authentication required for wishlist access
  - Dedicated wishlist dashboard displaying saved products
  - "Add All to Cart" functionality to transfer wishlist items to cart
  - Real-time wishlist counter in navigation header
  - Buy and Rent options for each wishlist item
  - Remove items from wishlist with one click
  - Data persistence across sessions and devices

- **Cart Functionality**
  - Add products to cart from product detail pages and wishlist
  - User-specific cart storage tied to user ID
  - Persistent database storage with localStorage fallback
  - Authentication required for cart access
  - Dedicated cart page showing selected products
  - Quantity controls with real-time price calculations
  - Buy and Rent options for each cart item
  - Checkout section with order summary
  - Real-time cart counter in navigation header
  - Data persistence across sessions and devices

- **Buy Functionality**
  - "Buy Now" buttons on product cards and detail pages
  - Direct checkout option bypassing shopping cart
  - User-specific checkout process requiring authentication
  - Comprehensive checkout form with shipping details
  - Order processing with unique order IDs
  - Confirmation messaging and automatic redirection to order history
  - Order details storage in user-specific order history
  - Complete purchase flow from product selection to confirmation

- **Rent Functionality**
  - "Rent" buttons on product cards and detail pages
  - Rental-specific checkout process
  - Duration selection for rental period (days)
  - Dynamic pricing calculation based on daily rate (10% of product price)
  - Automatic return date calculation
  - Rental-specific details in checkout summary
  - Clear distinction between purchases and rentals in order history
  - Complete rental flow from product selection to confirmation

- **Checkout Process**
  - Comprehensive checkout page for purchases and rentals
  - Required fields for shipping address, name, email and contact details
  - Rental duration field for rental orders
  - Dynamic price calculation for rentals based on duration
  - Real-time order summary during checkout
  - Order confirmation with transaction details
  - Order history dashboard for tracking purchases and rentals

- **Order Management**
  - Unified order history page for both purchases and rentals
  - Clear identification of order types (Purchase vs. Rental)
  - Detailed order information including shipping address
  - Order status tracking with multiple statuses (Processing, Paid, Confirmed, Sent, Delivered, Cancelled)
  - Admin-only order management dashboard for handling all customer orders
  - Status update functionality with visual confirmation
  - Expandable order details for complete transaction information
  - Rental-specific information including duration and return date
  - User-specific order history storage for privacy
  - Admin-controlled order status updates with intuitive workflow

### MongoDB Database Storage for Cart and Wishlist
- **Persistent Data Storage**
  - User data stored in MongoDB database for persistence across sessions and devices
  - Separate collections for cart and wishlist data with dedicated schemas
  - Data tied to user ID for privacy and security
  - Real-time updates across multiple tabs and devices
  - Automatic synchronization between local and remote data

- **Optimized Data Structure**
  - Efficient schema design for cart and wishlist items
  - Product information stored alongside references for faster loading
  - Quantity tracking for cart items
  - Timestamps for tracking when items were added
  - Support for special product types including rentable items

- **Intelligent Fallback Mechanism**
  - Primary storage in MongoDB database
  - Automatic fallback to localStorage if database is unreachable
  - Transparent synchronization between local and remote storage
  - Recovery mechanism to push local data to database when connection is restored
  - No data loss even when offline

- **API Integration**
  - RESTful API endpoints for cart and wishlist operations
  - Secure authentication for all operations
  - Automatic client-side state management
  - Optimized network requests to minimize data transfer
  - Comprehensive error handling

- **Performance Optimizations**
  - Efficient database queries with proper indexing
  - Minimized API calls through intelligent caching
  - Reduced payload size for network requests
  - Optimized rendering of cart and wishlist components
  - Background synchronization for uninterrupted user experience

### Responsive Design
The application is fully responsive and works well on mobile devices, tablets, and desktops.

## API Endpoints

### Authentication API Endpoints

#### POST /api/auth/signup
Register a new user account.
- **Request Body**: `{ name, email, username, password, confirmPassword }`
- **Response**: `{ success, data }` or `{ success, message }` on error

#### POST /api/auth/login
Authenticate a user and get a JWT token.
- **Request Body**: `{ username, password }`
- **Response**: `{ success, data }` (includes isAdmin status) or `{ success, message }` on error

#### POST /api/auth/logout
Log out the current user.
- **Response**: `{ success, message }`

#### GET /api/auth/me
Get the current authenticated user's information.
- **Headers**: Authentication token required
- **Response**: `{ success, data }` (includes isAdmin status) or `{ success, message }` on error

#### GET /api/auth/check-username
Check if a username is available.
- **Query Parameters**: `username`
- **Response**: `{ success, available }` or `{ success, message }` on error

### User Management API Endpoints

#### GET /api/users
Get all users (admin only).
- **Headers**: Authentication token required with admin privileges
- **Response**: Array of user objects or error message

#### POST /api/users
Create a new user (admin only).
- **Headers**: Authentication token required with admin privileges
- **Request Body**: `{ name, email, username, password, isAdmin }`
- **Response**: Created user object or error message

#### GET /api/users/:id
Get a specific user (admin only).
- **Headers**: Authentication token required with admin privileges
- **Response**: User object or error message

#### PUT /api/users/:id
Update a user's information (admin only).
- **Headers**: Authentication token required with admin privileges
- **Request Body**: `{ name, email, username, password (optional), isAdmin }`
- **Response**: Updated user object or error message

#### PATCH /api/users/:id
Update a user's admin status (admin only).
- **Headers**: Authentication token required with admin privileges
- **Request Body**: `{ isAdmin }`
- **Response**: Updated user object or error message

#### DELETE /api/users/:id
Delete a user (admin only).
- **Headers**: Authentication token required with admin privileges
- **Response**: Success message or error message

### Product API Endpoints

(Existing product API endpoints documentation)

### Order API Endpoints

#### GET /api/orders
Get a list of orders.
- **Headers**: Authentication token required
- **Response**: For regular users, returns their own orders. For admins, returns all orders.

#### POST /api/orders
Create a new order.
- **Headers**: Authentication token required
- **Request Body**: Full order details including items, customer information, amounts
- **Response**: Created order object with generated order number

#### GET /api/order/:id
Get details of a specific order.
- **Headers**: Authentication token required
- **Response**: Order details for specified ID (users can only access their own orders, admins can access any order)

#### PUT /api/order/:id
Update order status (admin only).
- **Headers**: Authentication token required with admin privileges
- **Request Body**: `{ status }` (Processing, Paid, Confirmed, Sent, Delivered, Cancelled)
- **Response**: Updated order object

#### DELETE /api/order/:id
Delete an order (admin only).
- **Headers**: Authentication token required with admin privileges
- **Response**: Success message (204 status code)

#### GET /api/seed-orders
Seed the database with sample orders for testing (admin only, development environment only).
- **Headers**: Authentication token required with admin privileges
- **Query Parameters**: `clear=true` (optional) to clear existing orders first
- **Response**: Collection of created sample orders

### Cart and Wishlist API Endpoints

#### GET /api/user/cart
Get the current user's cart.
- **Headers**: Authentication token required
- **Response**: Cart object with items array

#### PUT /api/user/cart
Update the user's cart.
- **Headers**: Authentication token required
- **Request Body**: `{ items: [...cartItems] }`
- **Response**: Updated cart object

#### DELETE /api/user/cart
Clear the user's cart.
- **Headers**: Authentication token required
- **Response**: Success message

#### GET /api/user/wishlist
Get the current user's wishlist.
- **Headers**: Authentication token required
- **Response**: Wishlist object with items array

#### PUT /api/user/wishlist
Update the user's wishlist.
- **Headers**: Authentication token required
- **Request Body**: `{ items: [...wishlistItems] }`
- **Response**: Updated wishlist object

#### DELETE /api/user/wishlist
Clear the user's wishlist.
- **Headers**: Authentication token required
- **Response**: Success message

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, in-memory fallback available)

### Installation

1. Clone the repository
```bash
git clone https://github.com/nahmxp/Rev-X-Rent.git
cd Rev-X-Rent
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key (optional, has development fallback)
```

> **Note**: The application includes a fallback in-memory database for development without MongoDB.
> **Note**: The application uses a hardcoded fallback JWT secret for development if JWT_SECRET is not provided.

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Account Setup

To access admin features, you'll need to create an admin account:

1. Register a new account through the signup page
2. If using the in-memory database, the first created account will automatically have admin privileges
3. For MongoDB deployments, you can manually set the `isAdmin` flag to `true` in the database or use an existing admin account to promote users

Once logged in as an admin, you'll see additional options in the navigation menu, including:
- Users Dashboard
- Add Product button
- Admin-specific actions throughout the interface

## Authentication Troubleshooting

If you encounter authentication issues:

1. Check browser cookies to ensure `auth_token` is being properly set
2. Verify that your admin user has the `isAdmin` flag set to `true` in the database
3. The application uses HTTP-only cookies for authentication tokens, so they won't be accessible via JavaScript
4. For development environments, the application uses a hardcoded JWT secret if none is provided in `.env.local`
5. If you're experiencing "Authentication required" errors, try logging out and back in

## Deployment

This application can be easily deployed to Vercel:

```bash
npm run build
npm start
```

Or using Vercel CLI:

```bash
vercel
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JSON Web Tokens](https://jwt.io/)
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)

### Order Management System
- **Dual-Interface Order Management**
  - User-specific "My Orders" page showing only personal orders
  - Admin-only "All Orders" dashboard with complete management capabilities
  - Clear separation between personal and administrative views
  - Persistent MongoDB storage for all order data

- **User Order Management Features**
  - User-specific order history tied to user ID
  - Filtering and sorting capabilities for personal orders
  - Detailed order information with item breakdown
  - Status tracking from processing to delivery
  - Visual status indicators for order progress
  - Support for both purchase and rental orders
  - Order history preservation across sessions

- **Admin Order Management Features**
  - Centralized dashboard for viewing all user orders
  - Advanced filtering by status, type, and user information
  - Search functionality by order number, customer name, or email
  - Complete status management workflow
  - Color-coded status indicators for quick assessment
  - Ability to view detailed customer and order information
  - Restricted access through admin authentication
  - Server-side filtering for optimized performance
  - Order type identification (Purchase, Rental, Combined)

- **Order Data Architecture**
  - Secure MongoDB storage with proper indexing
  - User ID association for privacy and data segmentation
  - Comprehensive schema supporting various order types
  - Complete item details including pricing and quantity
  - Shipping and contact information preservation
  - Status tracking with timestamp records
  - API endpoints optimized for different access patterns
  - Automatic order seeding for development testing

- **Order API System**
  - Dedicated endpoints for user-specific and admin-wide queries
  - Authentication middleware with role verification
  - Optimized queries for performance at scale
  - Proper error handling and status codes
  - Cross-user data isolation for security
  - Complete CRUD operations for order management