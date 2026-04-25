# RentDrive - Premium Car Rental Management System

RentDrive is a state-of-the-art, fully responsive Car Rental Management System built with **Angular 18**. It features a modern, high-end UI/UX inspired by premium SaaS platforms like Linear and Stripe, offering a seamless experience for both administrators and customers.

## ✨ Key Features

### 👤 Customer Portal

- **Premium Car Browser**: Advanced filtering by brand, price range, and search.
- **Dynamic Booking System**: Interactive booking flow with real-time price calculation.
- **Order Management**: Track your current and past rentals.
- **Installment Tracking**: Detailed view of payment plans and remaining balances.
- **Ultra-Responsive UI**: Optimized for mobile, tablet, and desktop viewports.

### 🔐 Admin Dashboard

- **Comprehensive User Management**: Full control over customer accounts.
- **Fleet Management**: CRUD operations for cars with detailed specifications.
- **Order Oversight**: Manage and update rental statuses (Pending, Success, Failed).
- **Premium Analytics**: Visual indicators and summaries for system health.

## 🛠️ Technology Stack

- **Core**: Angular 18 (Standalone Components, Signals, RxJS)
- **Styling**: Vanilla SCSS (Custom Design System, CSS Variables)
- **State Management**: Angular Signals for reactive UI
- **Internationalization**: Custom i18n support (English & Arabic RTL)
- **Icons**: SVG-based system (Lucide/Heroicons inspired)
- **Animations**: CSS3 Keyframes & Transitions for smooth micro-interactions

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or higher)
- [Angular CLI](https://angular.io/cli) (v18.x)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/car-rental-frontend.git
   ```
2. Navigate to the project folder:
   ```bash
   cd car-rental-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Run the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## 📁 Project Structure

```text
src/
├── app/
│   ├── core/           # Services, Interceptors, Guards
│   ├── shared/         # Common Components, Pipes, UI Library
│   └── features/       # Feature Modules
│       ├── admin/      # Admin Dashboard & Management
│       ├── customer/   # Customer Browsing & Booking
│       └── auth/       # Login & Registration
├── assets/             # Static images, Icons, Fonts
└── styles.scss         # Global Design System & Design Tokens
```

## 🎨 Design Philosophy

RentDrive follows a **"Modern SaaS"** aesthetic:

- **Depth through layering**: Cards float above backgrounds with subtle shadows.
- **Micro-interactions**: Every interactive element has tactile feedback.
- **Typographic hierarchy**: Uses 'Inter' for UI and 'Cairo' for Arabic RTL support.
- **Dark Mode Support**: Fully integrated dark theme with balanced contrast.

---
