import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../src/firebase/config';
import { signOut } from 'firebase/auth';
import Navbar from './navbar';
import { useTheme } from './contexts/ThemeContext';

const MainPage = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [loadedCards, setLoadedCards] = useState([]);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        setIsVisible(true);
        // Staggered loading of cards
        navigationCards.forEach((card, index) => {
            setTimeout(() => {
                setLoadedCards(prev => [...prev, index]);
            }, card.delay);
        });
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const navigationCards = [
        {
            title: "Home",
            description: "Explore the marketplace",
            icon: "🏠",
            color: "from-blue-500 to-blue-600",
            hoverColor: "hover:from-blue-600 hover:to-blue-700",
            path: "/home",
            delay: 0
        },
        {
            title: "Categories",
            description: "Browse by category",
            icon: "📂",
            color: "from-purple-500 to-purple-600",
            hoverColor: "hover:from-purple-600 hover:to-purple-700",
            path: "/categories",
            delay: 100
        },
        {
            title: "Messages",
            description: "Chat with buyers & sellers",
            icon: "💬",
            color: "from-emerald-500 to-emerald-600",
            hoverColor: "hover:from-emerald-600 hover:to-emerald-700",
            path: "/chat",
            delay: 200
        },
        {
            title: "Add Item",
            description: "List your items for sale",
            icon: "➕",
            color: "from-amber-500 to-amber-600",
            hoverColor: "hover:from-amber-600 hover:to-amber-700",
            path: "/add-item",
            delay: 300
        },
        {
            title: "My Profile",
            description: "Manage your account",
            icon: "👤",
            color: "from-rose-500 to-rose-600",
            hoverColor: "hover:from-rose-600 hover:to-rose-700",
            path: "/profile",
            delay: 400
        },
        {
            title: "My Listings",
            description: "View your active listings",
            icon: "📋",
            color: "from-indigo-500 to-indigo-600",
            hoverColor: "hover:from-indigo-600 hover:to-indigo-700",
            path: "/my-listings",
            delay: 500
        },
        {
            title: "My Favorites",
            description: "Saved items & wishlist",
            icon: "❤️",
            color: "from-pink-500 to-pink-600",
            hoverColor: "hover:from-pink-600 hover:to-pink-700",
            path: "/favorites",
            delay: 600
        }
    ];

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500`}>
            <Navbar />
            
            {/* Main Content */}
            <div className="container mx-auto px-6 py-16">
                <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 text-lg font-medium mb-8 animate-pulse">
                        <span className="w-3 h-3 bg-blue-600 dark:bg-blue-400 rounded-full mr-3 animate-bounce"></span>
                        Welcome to UniBay
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Campus Marketplace
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Buy, sell, rent, or donate items within your campus community. 
                        Connect with fellow students and find amazing deals!
                    </p>
                </div>

                {/* Navigation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {navigationCards.map((card, index) => (
                        <div
                            key={card.title}
                            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                                loadedCards.includes(index) 
                                    ? 'opacity-100 translate-y-0' 
                                    : 'opacity-0 translate-y-10'
                            }`}
                            style={{ transitionDelay: `${card.delay}ms` }}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => navigate(card.path)}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                            
                            {/* Card Content */}
                            <div className="relative p-8 text-center">
                                <div className="text-6xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                                    {card.icon}
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    {card.title}
                                </h3>
                                
                                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                    {card.description}
                                </p>
                                
                                {/* Hover Effect */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                            </div>
                            
                            {/* Hover Overlay */}
                            {hoveredCard === index && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 transition-opacity duration-300`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                        <span className="w-2 h-2 bg-white rounded-full mr-3 animate-pulse"></span>
                        Start Exploring Now
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainPage;

