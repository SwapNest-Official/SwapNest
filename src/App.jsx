import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from './firebase/config'; // Import Firebase auth
import SignupPage from './authentication/signup';
import LoginPage from './authentication/login';
import ProfilePage from './profile';
import MainPage from './mainPage';
import ItemList from './itemslist';
import AddItem from './addItem';
import ProductDetails from './ProductDetails/ProductDetails';
import Categories from './home/categories';
import RentalOption from './rentaloption';
import ButtonClick from '../src/buttonClick'
import AboutUs from "./about"
import { Toaster } from "@/components/ui/sonner";
import RemoveItem from './removeItem';
import ChatList from './chatSystem/chatList';
import ChatRoom from './chatSystem/chatRoom';
import ReactGA from 'react-ga4';
import ChatInterface from './chatSystem/chatInterface';
import { ThemeProvider } from './contexts/ThemeContext';

// Simple e-commerce components
import SearchResults from './ecommerce/SearchResults';
import CategoryPage from './ecommerce/CategoryPage';
import Favorites from './ecommerce/Favorites';

ReactGA.initialize("G-3KHJY2RDS3"); 
ReactGA.send("pageview");

const ProtectedRoute = ({ element }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div className="text-center mt-10">Loading...</div>;

    return user ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/addItem" element={<ProtectedRoute element={<AddItem/>} />}/>
          <Route path="/itemlist/product/:productId" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/profile/:RouteuserId" element={<ProfilePage MyProfile = "false" />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/chatList" element={<ChatList/>} />
          <Route path="/chating" element={<ChatInterface/>} />
          <Route path="/chat/:chatId" element={<ChatRoom/>} />
          
          {/* Simple E-commerce Routes */}
          <Route path="/search" element={<SearchResults />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/favorites" element={<ProtectedRoute element={<Favorites />} />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<ItemList />} />
          <Route path="/itemlist" element={<ItemList />}  />
          <Route path="/itemlist/:categoryRoute"  element={<ItemList />}/>
          <Route path="/profile" element={<ProtectedRoute element={<ProfilePage MyProfile = "true" />} />} />
          <Route path="/rental" element={<RentalOption />} />
          <Route path="/button" element={<ButtonClick />}  />
          <Route path="/removeitem" element={<RemoveItem />}  />
          
          {/* Redirect unknown paths */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
};

export default App;

