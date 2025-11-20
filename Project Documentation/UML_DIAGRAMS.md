# QuickDineFlow - UML Diagrams Documentation

This document contains the extracted information for creating Use-Case, Class, Activity, and Sequence diagrams for the QuickDineFlow project.

---

## 1. USE-CASE DIAGRAM

### Actors:
- **Student** (Primary User)
- **Admin** (Kitchen Staff/Administrator)
- **System** (External System - Stripe Payment Gateway)

### Student Use Cases:

#### Authentication & Profile
- Register Account
- Login
- View Profile
- Update Profile

#### Menu & Browsing
- Browse Menu
- Search Menu Items
- Filter Menu by Category
- View Menu Item Details

#### Shopping Cart
- Add Item to Cart
- Remove Item from Cart
- Update Cart Quantity
- Customize Order Item
- Select Size Variant
- View Cart

#### Ordering
- Place Order
- Select Pickup Time
- Choose Payment Method (Card/Cash)
- Process Payment (via Stripe)
- View Order History
- View Order Details
- Cancel Order (if status is 'received')

#### Favorites
- Add Item to Favorites
- Remove Item from Favorites
- View Favorites

#### Feedback
- Submit Feedback

#### Payment Management
- Save Payment Methods
- Manage Payment Methods

### Admin Use Cases:

#### Authentication
- Login (Admin Access)

#### Order Management
- View All Orders
- Update Order Status (received → preparing → ready → completed)
- View Kitchen Display

#### Menu Management
- Create Menu Item
- Update Menu Item
- Delete Menu Item
- Manage Menu Availability

#### Feedback Management
- View All Feedback
- Update Feedback Status
- Respond to Feedback

#### Analytics
- View Analytics Dashboard
- View Daily Statistics
- View Weekly Statistics

#### Audit
- Create Audit Log
- View Audit Logs

### System Use Cases:
- Process Payment (Stripe)
- Send Real-time Updates (WebSocket)
- Generate Order Number

---

## 2. CLASS DIAGRAM

### Main Classes:

#### User
```
Attributes:
- id: string (PK)
- email: string (unique)
- password: string (hashed)
- firstName: string
- lastName: string
- profileImageUrl: string
- studentId: string (unique, 10 digits)
- role: string ('student' | 'admin')
- preferredPickupLocation: string
- phoneNumber: string
- dietaryRestrictions: string[]
- allergies: string[]
- stripeCustomerId: string
- createdAt: timestamp
- updatedAt: timestamp

Methods:
+ getUser(id: string): User
+ getUserByEmail(email: string): User
+ createUser(userData: UpsertUser): User
+ updateUserProfile(id: string, updates: Partial<User>): User
```

#### MenuItem
```
Attributes:
- id: integer (PK)
- name: string
- nameAr: string (Arabic name)
- description: string
- descriptionAr: string (Arabic description)
- price: decimal
- category: string (breakfast, lunch, snacks, beverages)
- imageUrl: string
- isAvailable: boolean
- preparationTime: integer (minutes)
- isSpecial: boolean
- specialPrice: decimal
- nutritionalInfo: jsonb
- allergens: string[]
- dietaryTags: string[]
- sizeVariants: jsonb
- createdAt: timestamp
- updatedAt: timestamp

Methods:
+ getAllMenuItems(): MenuItem[]
+ getMenuItemById(id: number): MenuItem
+ createMenuItem(item: InsertMenuItem): MenuItem
+ updateMenuItem(id: number, updates: Partial<MenuItem>): MenuItem
+ deleteMenuItem(id: number): void
```

#### Order
```
Attributes:
- id: integer (PK)
- userId: string (FK → User.id)
- orderNumber: string (unique)
- status: string (received, preparing, ready, completed, cancelled)
- pickupTime: timestamp
- specialInstructions: string
- subtotal: decimal
- tax: decimal
- total: decimal
- paymentMethod: string ('card' | 'cash')
- paymentIntentId: string (Stripe)
- paymentStatus: string (pending, completed, failed)
- createdAt: timestamp
- updatedAt: timestamp

Methods:
+ createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Order
+ getOrderById(id: number): OrderWithItems
+ getUserOrders(userId: string): OrderWithItems[]
+ getAllOrders(): OrderWithItems[]
+ updateOrderStatus(id: number, status: string): Order
+ cancelOrder(id: number): Order
```

#### OrderItem
```
Attributes:
- id: integer (PK)
- orderId: integer (FK → Order.id)
- menuItemId: integer (FK → MenuItem.id)
- menuItemName: string (snapshot)
- quantity: integer
- unitPrice: decimal (snapshot)
- selectedSize: string
- customizations: string
- subtotal: decimal
```

#### Favorite
```
Attributes:
- id: integer (PK)
- userId: string (FK → User.id)
- menuItemId: integer (FK → MenuItem.id)
- createdAt: timestamp

Methods:
+ addFavorite(favorite: InsertFavorite): Favorite
+ removeFavorite(userId: string, menuItemId: number): void
+ getUserFavorites(userId: string): number[]
+ getUserFavoriteItems(userId: string): MenuItem[]
```

#### Feedback
```
Attributes:
- id: integer (PK)
- userId: string (FK → User.id)
- orderId: integer (FK → Order.id, nullable)
- category: string (food_quality, service, menu_suggestion, general)
- message: string
- rating: integer (1-5, optional)
- status: string (pending, reviewed, resolved, dismissed)
- adminResponse: string
- createdAt: timestamp
- updatedAt: timestamp

Methods:
+ createFeedback(feedbackData: InsertFeedback): Feedback
+ getAllFeedback(): Feedback[]
+ getUserFeedback(userId: string): Feedback[]
+ updateFeedbackStatus(id: number, status: string): Feedback
```

#### PaymentMethod
```
Attributes:
- id: integer (PK)
- userId: string (FK → User.id)
- stripePaymentMethodId: string
- cardBrand: string
- cardLast4: string
- cardExpMonth: integer
- cardExpYear: integer
- isDefault: boolean
- createdAt: timestamp

Methods:
+ getUserPaymentMethods(userId: string): PaymentMethod[]
+ addPaymentMethod(paymentMethod: InsertPaymentMethod): PaymentMethod
+ deletePaymentMethod(id: number, userId: string): void
+ setDefaultPaymentMethod(userId: string, paymentMethodId: number): void
```

#### AuditLog
```
Attributes:
- id: integer (PK)
- userId: string (FK → User.id)
- action: string
- entityType: string
- entityId: string
- details: jsonb
- createdAt: timestamp

Methods:
+ createAuditLog(log: InsertAuditLog): void
```

#### CartContext (Frontend)
```
Attributes:
- items: CartItem[]

Methods:
+ addItem(menuItem: MenuItem, quantity?: number, customizations?: string, selectedSize?: string): void
+ removeItem(menuItemId: number, selectedSize?: string): void
+ updateQuantity(menuItemId: number, quantity: number, selectedSize?: string): void
+ clearCart(): void
+ getItemCount(): number
+ getSubtotal(): number
+ getTax(): number
+ getTotal(): number
```

#### DatabaseStorage (Service Layer)
```
Methods:
+ getUser(id: string): Promise<User>
+ getUserByEmail(email: string): Promise<User>
+ createUser(user: UpsertUser): Promise<User>
+ updateUserProfile(id: string, updates: Partial<User>): Promise<User>
+ getAllMenuItems(): Promise<MenuItem[]>
+ getMenuItemById(id: number): Promise<MenuItem>
+ createMenuItem(item: InsertMenuItem): Promise<MenuItem>
+ updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem>
+ deleteMenuItem(id: number): Promise<void>
+ createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order>
+ getOrderById(id: number): Promise<OrderWithItems>
+ getUserOrders(userId: string): Promise<OrderWithItems[]>
+ getAllOrders(): Promise<OrderWithItems[]>
+ updateOrderStatus(id: number, status: string): Promise<Order>
+ cancelOrder(id: number): Promise<Order>
+ addFavorite(favorite: InsertFavorite): Promise<Favorite>
+ removeFavorite(userId: string, menuItemId: number): Promise<void>
+ getUserFavorites(userId: string): Promise<number[]>
+ getUserFavoriteItems(userId: string): Promise<MenuItem[]>
+ createAuditLog(log: InsertAuditLog): Promise<void>
+ getDailyStats(date?: Date): Promise<any>
+ getWeeklyStats(): Promise<any>
+ createFeedback(feedbackData: InsertFeedback): Promise<Feedback>
+ getAllFeedback(): Promise<Feedback[]>
+ getUserFeedback(userId: string): Promise<Feedback[]>
+ updateFeedbackStatus(id: number, status: string): Promise<Feedback>
+ getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>
+ addPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>
+ deletePaymentMethod(id: number, userId: string): Promise<void>
+ setDefaultPaymentMethod(userId: string, paymentMethodId: number): Promise<void>
+ updateUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User>
```

### Relationships:
- **User 1---* Order** (one-to-many: one user can have many orders)
- **User 1---* Favorite** (one-to-many: one user can have many favorites)
- **User 1---* Feedback** (one-to-many: one user can submit many feedbacks)
- **User 1---* PaymentMethod** (one-to-many: one user can have many payment methods)
- **User 1---* AuditLog** (one-to-many: one admin can create many audit logs)
- **Order 1---* OrderItem** (one-to-many: one order contains many order items)
- **MenuItem *---* OrderItem** (many-to-many through OrderItem: menu items appear in many orders)
- **MenuItem *---* Favorite** (many-to-many: menu items can be favorited by many users)
- **Order 0..1---* Feedback** (one-to-many, optional: one order can have multiple feedbacks, but feedback can exist without order)

---

## 3. ACTIVITY DIAGRAM

### Activity 0: Complete User Journey - Registration to Checkout

```
[Start]
    ↓
[Access Landing Page]
    ↓
{User Account Exists?}
    ├─ No → [Navigate to Registration Page]
    │        ↓
    │        [Enter Registration Details]
    │        - Email
    │        - Password
    │        - Confirm Password
    │        - First Name
    │        - Last Name
    │        - Student ID (optional)
    │        ↓
    │        [Validate Form Data]
    │        ↓
    │        {Validation Passed?}
    │        ├─ No → [Show Error Messages]
    │        │        ↓
    │        │        [Return to Registration Form]
    │        └─ Yes → [Check if Email Already Exists]
    │                 ↓
    │                 {Email Exists?}
    │                 ├─ Yes → [Show Error: Email Already Registered]
    │                 │        ↓
    │                 │        [Return to Registration Form]
    │                 └─ No → [Hash Password]
    │                          ↓
    │                          [Create User in Database]
    │                          ↓
    │                          [Auto Login User]
    │                          ↓
    │                          [Create Session]
    │                          ↓
    │                          [Redirect to Menu Page]
    │
    └─ Yes → [Navigate to Login Page]
             ↓
             [Enter Credentials]
             - Email
             - Password
             ↓
             [Validate Credentials]
             ↓
             {Credentials Valid?}
             ├─ No → [Show Error: Invalid Credentials]
             │        ↓
             │        [Return to Login Form]
             └─ Yes → [Create Session]
                      ↓
                      {User Role?}
                      ├─ Admin → [Redirect to Admin Dashboard]
                      └─ Student → [Redirect to Menu Page]
    ↓
[Menu Page Loaded]
    ↓
[Fetch Menu Items from API]
    ↓
[Display Menu Items]
    ↓
{User Action?}
    ├─ Browse Menu → [View Menu Items by Category]
    │                  ↓
    │                  [Filter by Category (optional)]
    │                  - Breakfast
    │                  - Lunch
    │                  - Snacks
    │                  - Beverages
    │                  ↓
    │                  [Search Menu Items (optional)]
    │                  ↓
    │                  [View Menu Item Details]
    │                  ↓
    │                  [Return to Menu Browsing]
    │
    ├─ Select Menu Item → [View Item Details]
    │                      ↓
    │                      {Item Has Size Variants?}
    │                      ├─ Yes → [Select Size]
    │                      │        - Small
    │                      │        - Medium
    │                      │        - Large
    │                      └─ No → [Continue]
    │                      ↓
    │                      [Add Customizations (optional)]
    │                      - Special instructions
    │                      - Dietary preferences
    │                      ↓
    │                      [Select Quantity]
    │                      ↓
    │                      [Add to Cart]
    │                      ↓
    │                      [Update Cart State]
    │                      ↓
    │                      [Show Success Notification]
    │                      ↓
    │                      {Add More Items?}
    │                      ├─ Yes → [Return to Menu Browsing]
    │                      └─ No → [Continue]
    │
    ├─ View Cart → [Display Cart Items]
    │                ↓
    │                [Show Cart Summary]
    │                - Item count
    │                - Subtotal
    │                - Tax calculation
    │                - Total
    │                ↓
    │                {Cart Empty?}
    │                ├─ Yes → [Show Empty Cart Message]
    │                │        ↓
    │                │        [Return to Menu]
    │                └─ No → [Allow Cart Modifications]
    │                         - Update quantity
    │                         - Remove items
    │                         - Modify customizations
    │                         ↓
    │                         {Proceed to Checkout?}
    │                         ├─ No → [Return to Menu]
    │                         └─ Yes → [Navigate to Checkout]
    │
    └─ View Favorites → [Display Favorite Items]
                        ↓
                        [Return to Menu]
    ↓
[Checkout Page Loaded]
    ↓
{Is First-Time Customer?}
    ├─ Yes → [Apply 10% First-Time Discount]
    └─ No → [Continue]
    ↓
[Calculate Order Totals]
    - Subtotal
    - Discount (if applicable)
    - Tax (8%)
    - Final Total
    ↓
[Display Order Summary]
    ↓
[Step 1: Select Pickup Time]
    ↓
[Display Available Time Slots]
    ↓
[User Selects Pickup Time]
    ↓
{Time Slot Selected?}
    ├─ No → [Show Error: Select Pickup Time]
    │        ↓
    │        [Return to Time Selection]
    └─ Yes → [Continue]
    ↓
[Step 2: Choose Payment Method]
    ↓
{Payment Method?}
    ├─ Card Payment → [Select Card Payment]
    │                  ↓
    │                  [Create Payment Intent via API]
    │                  ↓
    │                  [Receive Client Secret from Stripe]
    │                  ↓
    │                  [Display Payment Form]
    │                  - Card number
    │                  - Expiry date
    │                  - CVC
    │                  - Cardholder name
    │                  ↓
    │                  [User Enters Card Details]
    │                  ↓
    │                  [Validate Card Details]
    │                  ↓
    │                  {Card Valid?}
    │                  ├─ No → [Show Error: Invalid Card]
    │                  │        ↓
    │                  │        [Return to Payment Form]
    │                  └─ Yes → [Process Payment via Stripe]
    │                           ↓
    │                           {Payment Successful?}
    │                           ├─ No → [Show Error: Payment Failed]
    │                           │        ↓
    │                           │        [Return to Payment Form]
    │                           └─ Yes → [Payment Confirmed]
    │                                    ↓
    │                                    [Create Order in Database]
    │                                    - Order number generation
    │                                    - Order items creation
    │                                    - Payment status: completed
    │                                    ↓
    │                                    [Broadcast Order via WebSocket]
    │                                    ↓
    │                                    [Clear Cart]
    │                                    ↓
    │                                    [Show Success Message]
    │                                    ↓
    │                                    [Redirect to Orders Page]
    │
    └─ Cash Payment → [Select Cash Payment]
                       ↓
                       [Display Cash Payment Confirmation]
                       ↓
                       [User Confirms Cash Payment]
                       ↓
                       [Create Order in Database]
                       - Order number generation
                       - Order items creation
                       - Payment method: cash
                       - Payment status: pending
                       ↓
                       [Broadcast Order via WebSocket]
                       ↓
                       [Clear Cart]
                       ↓
                       [Show Success Message]
                       - "Pay cash when you pick up your order"
                       ↓
                       [Redirect to Orders Page]
    ↓
[Orders Page Loaded]
    ↓
[Display Order Confirmation]
    - Order number
    - Order items
    - Pickup time
    - Payment method
    - Total amount
    - Order status
    ↓
[End]
```

### Activity 1: Order Placement Flow (Student)

```
[Start]
    ↓
[Browse Menu]
    ↓
[Select Menu Item]
    ↓
{Has Size Variants?}
    ├─ Yes → [Select Size]
    └─ No → [Continue]
    ↓
[Add Customizations (optional)]
    ↓
[Add to Cart]
    ↓
{More Items?}
    ├─ Yes → [Browse Menu]
    └─ No → [Continue]
    ↓
[View Cart]
    ↓
[Proceed to Checkout]
    ↓
[Select Pickup Time]
    ↓
[Choose Payment Method]
    ↓
{Payment Method = Card?}
    ├─ Yes → [Create Payment Intent]
         ↓
         [Enter Card Details]
         ↓
         [Process Payment via Stripe]
    └─ No → [Confirm Cash Payment]
    ↓
[Create Order in Database]
    ↓
[Generate Order Number]
    ↓
{Payment = Card?}
    ├─ Yes → [Update Payment Status]
    └─ No → [Mark as Pending]
    ↓
[Broadcast Order via WebSocket]
    ↓
[Clear Cart]
    ↓
[Redirect to Orders Page]
    ↓
[End]
```

### Activity 2: Order Status Update Flow (Admin)

```
[Start]
    ↓
[View Kitchen Display]
    ↓
[Select Order]
    ↓
{Current Status?}
    ├─ received → [Update to "preparing"]
    ├─ preparing → [Update to "ready"]
    └─ ready → [Update to "completed"]
    ↓
[Update Order Status in Database]
    ↓
[Create Audit Log Entry]
    ↓
[Broadcast Status Update via WebSocket]
    ↓
[Notify User (Real-time)]
    ↓
[End]
```

### Activity 3: Menu Management Flow (Admin)

```
[Start]
    ↓
[Navigate to Menu Management]
    ↓
{Action?}
    ├─ Create → [Enter Menu Item Details]
         ↓
         [Validate]
         ↓
         [Save to Database]
         ↓
         [Create Audit Log]
    ├─ Update → [Select Item]
         ↓
         [Modify Fields]
         ↓
         [Validate]
         ↓
         [Save to Database]
         ↓
         [Create Audit Log]
    └─ Delete → [Select Item]
         ↓
         [Confirm Deletion]
         ↓
         [Delete from Database]
         ↓
         [Create Audit Log]
    ↓
[Update Menu Display]
    ↓
[End]
```

### Activity 4: Authentication Flow

```
[Start]
    ↓
{User Type?}
    ├─ New User → [Register]
         ↓
         [Enter Details]
         ↓
         [Validate]
         ↓
         [Hash Password]
         ↓
         [Create User in Database]
         ↓
         [Auto Login]
    └─ Existing User → [Login]
         ↓
         [Enter Credentials]
         ↓
         [Validate]
         ↓
         [Verify Password]
         ↓
         [Create Session]
    ↓
{Role?}
    ├─ Admin → [Redirect to Admin Dashboard]
    └─ Student → [Redirect to Menu Page]
    ↓
[End]
```

---

## 4. SEQUENCE DIAGRAM

### Sequence 0: Complete User Journey - Registration to Checkout

```
Student    RegisterPage    MenuPage    CartContext    CheckoutPage    API    DatabaseStorage    Database    Stripe    WebSocket
   |            |              |             |              |            |            |              |            |          |
   |--Register->|              |             |              |            |            |              |            |          |
   |            |--POST /api/auth/register-->|              |            |            |              |            |          |
   |            |              |             |              |            |--getUserByEmail()-->|            |          |
   |            |              |             |              |            |            |--SELECT--->|            |          |
   |            |              |             |              |            |            |<--Not Found|            |          |
   |            |              |             |              |            |<--Not Found|              |            |          |
   |            |              |             |              |            |--hash(password)-->|            |          |
   |            |              |             |              |            |--createUser()-->|            |          |
   |            |              |             |              |            |            |--INSERT----->|            |          |
   |            |              |             |              |            |            |<--User-------|            |          |
   |            |              |             |              |            |<--User------|              |            |          |
   |            |<--User-------|              |             |              |            |            |              |            |          |
   |--Navigate->|              |             |              |            |            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |            |--Load Menu-->|             |              |            |            |              |            |          |
   |            |              |--GET /api/menu-->|          |            |            |              |            |          |
   |            |              |             |              |            |--getAllMenuItems()-->|            |          |
   |            |              |             |              |            |            |--SELECT----->|            |          |
   |            |              |             |              |            |            |<--MenuItem[]|            |          |
   |            |              |             |              |            |<--MenuItem[]|              |            |          |
   |            |              |<--MenuItem[]|              |            |            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |--Add Item->|              |             |              |            |            |              |            |          |
   |            |              |--addItem()-->|              |            |            |              |            |          |
   |            |              |             |--Update Cart|            |            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |--Add More->|              |             |              |            |            |              |            |          |
   |            |              |--addItem()-->|              |            |            |              |            |          |
   |            |              |             |--Update Cart|            |            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |--Checkout->|              |             |              |            |            |              |            |          |
   |            |              |             |              |--Load Page|            |            |              |            |          |
   |            |              |             |              |--GET /api/orders-->|            |              |            |          |
   |            |              |             |              |            |--getUserOrders()-->|            |          |
   |            |              |             |              |            |            |--SELECT----->|            |          |
   |            |              |             |              |            |            |<--Orders[]--|            |          |
   |            |              |             |              |            |<--Orders[]|              |            |          |
   |            |              |             |              |<--Orders[]|            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |--Select Time->|              |             |              |            |            |              |            |          |
   |            |              |             |              |--Select Payment-->|            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |            |              |             |              |{Payment = Card?}  |            |              |            |          |
   |            |              |             |              |  ├─ Yes:          |            |              |            |          |
   |            |              |             |              |--POST /api/create-payment-intent-->|            |          |
   |            |              |             |              |            |--Create Payment Intent-->|            |          |
   |            |              |             |              |            |            |              |--Process->|          |
   |            |              |             |              |            |            |              |<--Success|          |
   |            |              |             |              |            |<--clientSecret|              |            |          |
   |            |              |             |              |<--clientSecret|            |              |            |          |
   |            |              |             |              |--confirmPayment()-->|            |              |            |          |
   |            |              |             |              |            |            |              |--Process->|          |
   |            |              |             |              |            |            |              |<--Success|          |
   |            |              |             |              |            |--createOrder()-->|            |          |
   |            |              |             |              |            |            |--INSERT----->|            |          |
   |            |              |             |              |            |            |<--Order------|            |          |
   |            |              |             |              |            |<--Order-----|              |            |          |
   |            |              |             |              |            |--Broadcast-->|            |            |          |
   |            |              |             |              |            |            |              |            |--Notify->|
   |            |              |             |              |<--Success|            |              |            |          |
   |            |              |             |--clearCart()|            |            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |            |              |             |              |  └─ No (Cash):   |            |              |            |          |
   |            |              |             |              |--POST /api/orders/cash-->|            |          |
   |            |              |             |              |            |--createOrder()-->|            |          |
   |            |              |             |              |            |            |--INSERT----->|            |          |
   |            |              |             |              |            |            |<--Order------|            |          |
   |            |              |             |              |            |<--Order-----|              |            |          |
   |            |              |             |              |            |--Broadcast-->|            |            |          |
   |            |              |             |              |            |            |              |            |--Notify->|
   |            |              |             |--clearCart()|            |            |              |            |          |
   |            |              |             |              |            |            |              |            |          |
   |--Navigate->|              |             |              |            |            |              |            |          |
   |            |              |             |              |--GET /api/orders-->|            |              |            |          |
   |            |              |             |              |            |--getUserOrders()-->|            |          |
   |            |              |             |              |            |            |--SELECT----->|            |          |
   |            |              |             |              |            |            |<--Orders[]--|            |          |
   |            |              |             |              |            |<--Orders[]|              |            |          |
   |            |              |             |              |<--Orders[]|            |              |            |          |
   |            |              |             |              |--Display Order|            |              |            |          |
```

### Sequence 1: Place Order (Card Payment)

```
Student          MenuPage          CartContext         CheckoutPage         API              DatabaseStorage      Database      Stripe
   |                 |                  |                   |                |                      |                  |            |
   |--Browse Menu--->|                  |                   |                |                      |                  |            |
   |                 |--GET /api/menu-->|                   |                |                      |                  |            |
   |                 |                  |                   |                |--getAllMenuItems()-->|                  |            |
   |                 |                  |                   |                |                      |--SELECT--------->|            |
   |                 |                  |                   |                |                      |<--MenuItem[]------|            |
   |                 |                  |                   |                |<--MenuItem[]---------|                  |            |
   |                 |<--MenuItem[]-----|                   |                |                      |                  |            |
   |                 |                  |                   |                |                      |                  |            |
   |--Add to Cart--->|                  |                   |                |                      |                  |            |
   |                 |--addItem()------>|                   |                |                      |                  |            |
   |                 |                  |--Update State-----|                |                      |                  |            |
   |                 |                  |                   |                |                      |                  |            |
   |--Checkout------>|                  |                   |                |                      |                  |            |
   |                 |                  |                   |--Select Time--|                      |                  |            |
   |                 |                  |                   |--Choose Card--|                      |                  |            |
   |                 |                  |                   |--POST /api/create-payment-intent-->|                  |            |
   |                 |                  |                   |                |--Create Payment Intent-->|            |
   |                 |                  |                   |                |                      |                  |--Process-->|
   |                 |                  |                   |                |<--clientSecret--------|                  |<--Result--|
   |                 |                  |                   |<--clientSecret|                      |                  |            |
   |                 |                  |                   |--confirmPayment()------------------->|                  |            |
   |                 |                  |                   |                |                      |                  |--Process-->|
   |                 |                  |                   |<--Success---------------------------|                  |<--Success-|
   |                 |                  |                   |--POST /api/create-payment-intent-->|                  |            |
   |                 |                  |                   |                |--createOrder()------->|                  |            |
   |                 |                  |                   |                |                      |--INSERT--------->|            |
   |                 |                  |                   |                |                      |<--Order----------|            |
   |                 |                  |                   |                |<--Order--------------|                  |            |
   |                 |                  |                   |                |--WebSocket Broadcast-|                  |            |
   |                 |                  |                   |<--Success------|                      |                  |            |
   |                 |                  |--clearCart()----->|                   |                      |                  |            |
   |--Navigate------>|                  |                   |                |                      |                  |            |
```

### Sequence 2: Update Order Status (Admin)

```
Admin        KitchenDisplayPage         API              DatabaseStorage      Database      WebSocket      Student (OrdersPage)
  |                 |                    |                      |                  |              |                    |
  |--View Orders--->|                    |                      |                  |              |                    |
  |                 |--GET /api/orders-->|                      |                  |              |                    |
  |                 |                    |--getAllOrders()----->|                  |              |                    |
  |                 |                    |                      |--SELECT------->|              |                    |
  |                 |                    |                      |<--OrderWithItems-|              |                    |
  |                 |                    |<--OrderWithItems------|                  |              |                    |
  |                 |<--OrderWithItems---|                      |                  |              |                    |
  |                 |                    |                      |                  |              |                    |
  |--Update Status->|                    |                      |                  |              |                    |
  |                 |--PATCH /api/orders/:id/status-->|        |                  |              |                    |
  |                 |                    |--updateOrderStatus()->|                  |              |                    |
  |                 |                    |                      |--UPDATE-------->|              |                    |
  |                 |                    |                      |<--Order----------|              |                    |
  |                 |                    |<--Order--------------|                  |              |                    |
  |                 |                    |--createAuditLog()---->|                  |              |                    |
  |                 |                    |                      |--INSERT-------->|              |                    |
  |                 |                    |--Broadcast------------|                  |              |                    |
  |                 |                    |                      |                  |--Broadcast-->|                    |
  |                 |                    |                      |                  |              |--Update UI-------->|
  |                 |<--Success----------|                      |                  |              |                    |
  |                 |--Refresh List------|                      |                  |              |                    |
```

### Sequence 3: Create Menu Item (Admin)

```
Admin        MenuManagementPage         API              DatabaseStorage      Database      WebSocket      Student (MenuPage)
  |                 |                    |                      |                  |              |                    |
  |--Add Item------>|                    |                      |                  |              |                    |
  |                 |--Show Form-------->|                      |                  |              |                    |
  |--Fill Form------>|                    |                      |                  |              |                    |
  |--Submit--------->|                    |                      |                  |              |                    |
  |                 |--POST /api/menu-->|                      |                  |              |                    |
  |                 |                    |--createMenuItem()---->|                  |              |                    |
  |                 |                    |                      |--INSERT--------->|              |                    |
  |                 |                    |                      |<--MenuItem--------|              |                    |
  |                 |                    |<--MenuItem-----------|                  |              |                    |
  |                 |                    |--createAuditLog()---->|                  |              |                    |
  |                 |                    |                      |--INSERT--------->|              |                    |
  |                 |<--MenuItem---------|                      |                  |              |                    |
  |                 |--Refresh List------|                      |                  |              |                    |
  |                 |                    |                      |                  |--Broadcast-->|                    |
  |                 |                    |                      |                  |              |--Update Menu------>|
```

### Sequence 4: User Registration

```
User        RegisterPage         API              DatabaseStorage      Database      bcrypt      Passport
  |              |                 |                      |                  |              |            |
  |--Enter Data-->|                 |                      |                  |              |            |
  |--Submit------>|                 |                      |                  |              |            |
  |              |--POST /api/auth/register-->|            |                  |              |            |
  |              |                 |--getUserByEmail()---->|                  |              |            |
  |              |                 |                      |--SELECT--------->|              |            |
  |              |                 |                      |<--User/undefined-|              |            |
  |              |                 |<--User/undefined------|                  |              |            |
  |              |                 |                      |                  |              |            |
  |              |                 |{User Exists?}        |                  |              |            |
  |              |                 |  ├─ Yes → Error      |                  |              |            |
  |              |                 |  └─ No → Continue    |                  |              |            |
  |              |                 |--hash(password)------|                  |              |            |
  |              |                 |                      |                  |--Hash------->|            |
  |              |                 |                      |                  |<--hashedPass--|            |
  |              |                 |<--hashedPassword------|                  |              |            |
  |              |                 |--createUser()-------->|                  |              |            |
  |              |                 |                      |--INSERT--------->|              |            |
  |              |                 |                      |<--User-----------|              |            |
  |              |                 |<--User----------------|                  |              |            |
  |              |                 |--req.login()---------|                  |              |            |
  |              |                 |                      |                  |              |--Create Session->|
  |              |                 |<--Session Created-----|                  |              |<--Session------|
  |              |<--User----------|                      |                  |              |            |
  |--Navigate---->|                 |                      |                  |              |            |
```

### Sequence 5: Add to Favorites

```
Student         MenuPage         API              DatabaseStorage      Database
   |                |              |                      |                  |
   |--Click Heart--->|              |                      |                  |
   |                |--POST /api/favorites-->|            |                  |
   |                |              |--addFavorite()-------->|                  |
   |                |              |                      |--INSERT--------->|
   |                |              |                      |<--Favorite-------|
   |                |              |<--Favorite-----------|                  |
   |                |<--Success-----|                      |                  |
   |                |--Update UI (Filled Heart)           |                  |
```

---

## Notes for Diagram Creation:

1. **Use-Case Diagram**: 
   - Use ovals for use cases
   - Use stick figures for actors
   - Group related use cases with packages/rectangles
   - Use <<include>> and <<extend>> relationships where appropriate

2. **Class Diagram**:
   - Use rectangles for classes
   - Show attributes in the middle section
   - Show methods in the bottom section
   - Use different arrow types for relationships:
     - Solid line with arrow for associations
     - Numbers (1, *, 0..1) for multiplicities
     - Diamond for aggregation/composition if needed

3. **Activity Diagram**:
   - Use rounded rectangles for activities
   - Use diamonds for decision points
   - Use arrows to show flow
   - Use swimlanes if showing different actors

4. **Sequence Diagram**:
   - Use lifelines (vertical dashed lines) for each participant
   - Use horizontal arrows for messages
   - Show activation boxes (rectangles on lifelines) for active periods
   - Use return arrows (dashed) for responses

---

## Recommended Tools:

- **Lucidchart**: https://www.lucidchart.com/
- **Draw.io (diagrams.net)**: https://app.diagrams.net/
- **PlantUML**: Text-based UML diagrams
- **Visual Paradigm**: Professional UML tool
- **StarUML**: Free UML modeling tool

---

*Last Updated: Based on project analysis of QuickDineFlow codebase*

