# 🏫 SwapNest - Campus Marketplace

A modern, responsive campus marketplace platform built with React, Firebase, and Tailwind CSS. Connect students to buy, sell, rent, or donate items within their campus community.

## ✨ Features

### 🛍️ **Core Functionality**
- **Multi-listing Types**: Sell, Rent, or Donate items
- **Real-time Chat**: Built-in messaging system between buyers and sellers
- **Smart Search**: Advanced filtering by category, condition, and keywords
- **Favorites System**: Save and manage your favorite items
- **User Profiles**: Complete user management with ratings and reviews

### 🎨 **Modern UI/UX**
- **Responsive Design**: Optimized for all devices (mobile-first approach)
- **Dark/Light Mode**: Toggle between themes with persistent preferences
- **Lazy Loading**: Smooth animations and staggered content loading
- **Interactive Elements**: Hover effects, transitions, and micro-interactions

### 🔐 **Authentication & Security**
- **Firebase Auth**: Secure user authentication and management
- **Real-time Database**: Firestore for live data synchronization
- **File Upload**: Secure image handling for product listings
- **Role-based Access**: Buyer/Seller permissions and restrictions

### 📱 **Mobile-First Experience**
- **Progressive Web App**: Works seamlessly across all devices
- **Touch-Optimized**: Gesture-friendly interface for mobile users
- **Offline Support**: Cached data and offline functionality
- **Push Notifications**: Real-time updates for messages and favorites

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and functional components
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Consistent icon system

### **Backend & Services**
- **Firebase** - Authentication, Firestore database, and hosting
- **Firestore** - NoSQL cloud database with real-time updates
- **Firebase Storage** - Secure file upload and management
- **Redis (Upstash)** - High-performance caching layer

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic vendor prefixing

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Shadcn/ui components
├── contexts/            # React context providers
├── ecommerce/           # Product listing and category pages
├── chatSystem/          # Real-time messaging system
├── ProductDetails/      # Product detail views
├── authentication/      # Login/signup components
├── firebase/            # Firebase configuration
├── lib/                 # Utility functions
└── utils/               # Helper functions
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase account
- Upstash Redis account (optional)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/SwapNest-Official/SwapNest.git
   cd SwapNest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Configuration**
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Add your web app and copy configuration

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📱 Key Pages & Features

### **🏠 Home Page**
- Hero section with search functionality
- Featured categories and trending items
- Quick access to add new listings

### **📋 Product Listings**
- Grid and list view options
- Advanced filtering and sorting
- Responsive product cards with expandable descriptions
- Real-time favorites and chat integration

### **💬 Chat System**
- Real-time messaging between users
- Unread message indicators
- Chat history and product context
- Mobile-optimized interface

### **👤 User Profiles**
- Complete user information
- Listing management
- Follower/Following system
- Rating and review system

### **➕ Add Items**
- Multi-step listing creation
- Image upload with preview
- Category and condition selection
- Pricing and description management

## 🎯 Core Features Deep Dive

### **Smart Product Management**
- **Condition Tracking**: New, Like New, Good, Fair
- **Category Organization**: Electronics, Books, Clothing, etc.
- **Price Flexibility**: Fixed price, rental rates, or free donation
- **Image Management**: Multiple image support with optimization

### **Advanced Search & Filtering**
- **Text Search**: Product titles and descriptions
- **Category Filtering**: Dynamic category selection
- **Condition Filtering**: Filter by item condition
- **Price Range**: Set minimum and maximum prices

### **Real-time Communication**
- **Instant Messaging**: Real-time chat with WebSocket-like updates
- **Product Context**: Chat includes product details and images
- **Read Receipts**: Track message delivery and reading status
- **Notification System**: Alert users of new messages

### **User Experience Features**
- **Responsive Design**: Optimized for all screen sizes
- **Dark Mode**: Eye-friendly theme switching
- **Lazy Loading**: Progressive content loading
- **Smooth Animations**: CSS transitions and micro-interactions

## 🔧 Configuration

### **Tailwind CSS**
The project uses Tailwind CSS v3 with custom configuration:
- Custom color schemes
- Responsive breakpoints
- Dark mode support
- Component-specific utilities

### **Firebase Setup**
```javascript
// firebase/config.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  // Your Firebase configuration
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
```

### **Theme Context**
Global theme management with localStorage persistence:
```javascript
// contexts/ThemeContext.jsx
export const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)
```

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: ≤640px (1 column grid)
- **Tablet**: 641px-1024px (2-3 column grid)
- **Desktop**: ≥1025px (4 column grid)

### **Mobile-First Approach**
- Touch-friendly buttons and interactions
- Optimized spacing for mobile devices
- Swipe gestures for navigation
- Progressive disclosure of information

## 🚀 Deployment

### **Frontend (Vercel)**
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push to main branch

### **Backend (Firebase)**
1. Configure Firebase hosting
2. Set up Firestore security rules
3. Configure authentication providers
4. Deploy with Firebase CLI

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow React best practices
- Use TypeScript for new components
- Maintain responsive design principles
- Write meaningful commit messages
- Test on multiple devices and browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for beautiful component library
- **Tailwind CSS** for utility-first styling
- **Firebase** for backend services
- **Vite** for fast development experience
- **React Community** for excellent documentation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/SwapNest-Official/SwapNest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SwapNest-Official/SwapNest/discussions)
- **Email**: [Your Email]

---

**Built with ❤️ for the campus community**

*SwapNest - Where campus commerce meets modern technology*
