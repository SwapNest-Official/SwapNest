# 🚀 UniBay - Campus Marketplace

> **A modern, responsive campus marketplace platform built with React, Node.js, and Firebase**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.0+-orange.svg)](https://firebase.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red.svg)](https://upstash.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3+-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-4.4+-646CFF.svg)](https://vitejs.dev/)

## 🌟 **Features**

### 🛍️ **Marketplace Features**
- **Product Listings**: Buy, sell, rent, or donate items
- **Category Management**: Organized product categories
- **Search & Filters**: Advanced search with multiple filters
- **Favorites System**: Save items for later
- **Real-time Updates**: Live product availability

### 💬 **Communication System**
- **Chat Interface**: Direct messaging between buyers and sellers
- **Real-time Messaging**: Instant message delivery
- **Unread Notifications**: Visual indicators for new messages
- **Chat History**: Persistent conversation storage

### 👤 **User Management**
- **Authentication**: Firebase Auth with email/password
- **User Profiles**: Detailed seller/buyer profiles
- **Rating System**: Review and rate sellers
- **Follow System**: Follow favorite sellers
- **Profile Sharing**: Share profiles via links

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching capability
- **Lazy Loading**: Smooth animations and transitions
- **Modern Components**: Built with Shadcn/ui
- **Accessibility**: WCAG compliant design

### 🚀 **Performance & Security**
- **Redis Caching**: Fast response times
- **Rate Limiting**: API protection
- **CORS Configuration**: Secure cross-origin requests
- **JWT Authentication**: Secure API access
- **File Upload**: Cloudinary integration

## 🏗️ **Tech Stack**

### **Frontend**
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful UI components
- **Firebase** - Authentication and real-time database
- **React Router** - Client-side routing

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Redis (Upstash)** - In-memory caching
- **JWT** - JSON Web Token authentication

### **Services**
- **Firebase Auth** - User authentication
- **Firestore** - Real-time database
- **Cloudinary** - Image and file management
- **Nodemailer** - Email services
- **Multer** - File upload handling

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- MongoDB database
- Firebase project
- Redis instance (Upstash recommended)

### **1. Clone the Repository**
```bash
git clone https://github.com/optimus-prime-01/UniBay.git
cd UniBay
```

### **2. Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### **3. Environment Setup**

#### **Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_GA_MEASUREMENT_ID=G-3KHJY2RDS3
```

#### **Backend (config.env)**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### **4. Start Development Servers**
```bash
# Start backend server
cd backend
npm run dev

# Start frontend (in new terminal)
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 📱 **Screenshots**

### **Home Page**
![Home Page](screenshots/home.png)

### **Product Details**
![Product Details](screenshots/product-details.png)

### **Chat Interface**
![Chat Interface](screenshots/chat.png)

### **User Profile**
![User Profile](screenshots/profile.png)

## 🚀 **Deployment**

### **Backend (Render)**
1. **Connect Repository** to Render
2. **Set Environment Variables** from `backend/env.production.example`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Set PORT**: `10000`

### **Frontend (Vercel)**
1. **Import Project** from GitHub
2. **Set Environment Variables** from `env.production.example`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Framework Preset**: Vite

### **Environment Variables for Production**
```env
# Backend
CORS_ORIGINS=https://your-app.vercel.app
NODE_ENV=production
PORT=10000

# Frontend
VITE_API_URL=https://your-backend.onrender.com
VITE_APP_ENVIRONMENT=production
```

## 🏗️ **Project Structure**

```
UniBay/
├── src/                    # Frontend source code
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Theme, etc.)
│   ├── ecommerce/         # Marketplace components
│   ├── chatSystem/        # Chat functionality
│   ├── ProductDetails/    # Product detail pages
│   ├── authentication/    # Auth components
│   └── utils/            # Utility functions
├── backend/               # Backend source code
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── config.env        # Environment variables
├── public/               # Static assets
├── dist/                 # Build output
└── docs/                 # Documentation
```

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Users**
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

### **Orders**
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

## 🧪 **Testing**

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
npm test
```

## 📊 **Performance**

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: Optimized with Vite
- **Caching**: Redis for API responses
- **Lazy Loading**: Component and image optimization

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow ESLint configuration
- Use conventional commit messages
- Write meaningful commit descriptions
- Test your changes before submitting

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team**

- **Anmol Sinha** - Full Stack Developer & Co-founder
- **Anmol Gupta** - Full Stack Developer & Co-founder

## 🙏 **Acknowledgments**

- [Firebase](https://firebase.google.com/) for authentication and database
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Vite](https://vitejs.dev/) for fast development
- [MongoDB](https://www.mongodb.com/) for database
- [Redis](https://redis.io/) for caching

## 📞 **Support**

- **Email**: support@unibay.com
- **Issues**: [GitHub Issues](https://github.com/optimus-prime-01/UniBay/issues)
- **Documentation**: [Wiki](https://github.com/optimus-prime-01/UniBay/wiki)

---

<div align="center">
  <p>Made with ❤️ by the UniBay Team</p>
  <p>Building the future of campus commerce</p>
</div>
