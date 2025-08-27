import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { Heart, Trash2, MapPin, Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '../navbar';

const auth = getAuth();
const db = getFirestore();

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadFavorites(user.uid);
      } else {
        setUserId(null);
        setFavorites([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadFavorites = (uid) => {
    setLoading(true);
    
    // Listen to favorites collection
    const favoritesRef = collection(db, "users", uid, "favorites");
    const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
      const favoritesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFavorites(favoritesList);
      setLoading(false);
    }, (error) => {
      console.error("Error loading favorites:", error);
      setLoading(false);
    });

    return unsubscribe;
  };

  const removeFavorite = async (productId) => {
    try {
      const favoriteRef = doc(db, "users", userId, "favorites", productId);
      await deleteDoc(favoriteRef);
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove from favorites. Please try again.");
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/itemlist/product/${productId}`);
  };

  const handleChatClick = (productId, sellerName) => {
    navigate(`/chating?productId=${productId}&seller=${sellerName}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <Navbar />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            My Favorites
          </h1>
          <p className="text-gray-300 text-lg">
            {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20">
              <Heart className="w-24 h-24 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h3>
              <p className="text-gray-300 mb-8">Start browsing products and add them to your favorites</p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Browse Products
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <Card 
                key={product.id} 
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 group"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden">
                  <img 
                    src={product.image || 'https://via.placeholder.com/300x200'} 
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      {product.category || 'General'}
                    </Badge>
                    <Badge variant="outline" className="border-green-500/50 text-green-400">
                      {product.condition || 'Good'}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-purple-400">₹{product.price?.toLocaleString() || '0'}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={() => handleProductClick(product.id)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      onClick={() => removeFavorite(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-gray-400 text-sm">
                      Added: {new Date(product.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
