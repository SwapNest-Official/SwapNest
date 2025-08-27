import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List, Star, MapPin, MessageCircle, Search, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '../navbar';
import { useTheme } from '../contexts/ThemeContext';
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"

const auth = getAuth()
const db = getFirestore()

const CategoryPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loadedProducts, setLoadedProducts] = useState([]);
  const { isDarkMode } = useTheme();
  const [filters, setFilters] = useState({
    condition: '',
    priceRange: '',
    location: ''
  });
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    setIsVisible(true);
    // Simulate API call for category products
    setLoading(true);
    setTimeout(() => {
      // Mock data - replace with actual API call
      const mockProducts = [
        {
          id: 1,
          name: 'MacBook Pro 2023',
          description: 'Excellent condition MacBook Pro with M2 chip, perfect for coding and design work',
          price: 85000,
          originalPrice: 120000,
          condition: 'Like New',
          location: 'Mumbai',
          images: ['https://via.placeholder.com/300x200'],
          seller: { name: 'Rahul Kumar', rating: 4.8 },
          averageRating: 4.8,
          totalRatings: 12,
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          name: 'iPhone 14 Pro',
          description: 'Great condition iPhone 14 Pro, 128GB storage, comes with original box',
          price: 65000,
          originalPrice: 95000,
          condition: 'Good',
          location: 'Delhi',
          images: ['https://via.placeholder.com/300x200'],
          seller: { name: 'Priya Singh', rating: 4.6 },
          averageRating: 4.6,
          totalRatings: 8,
          createdAt: '2024-01-20'
        },
        {
          id: 3,
          name: 'Gaming Laptop RTX 4060',
          description: 'High-performance gaming laptop with RTX 4060, perfect for gaming and streaming',
          price: 75000,
          originalPrice: 110000,
          condition: 'Like New',
          location: 'Bangalore',
          images: ['https://via.placeholder.com/300x200'],
          seller: { name: 'Amit Patel', rating: 4.9 },
          averageRating: 4.9,
          totalRatings: 15,
          createdAt: '2024-01-18'
        }
      ];
      setProducts(mockProducts);
      setLoading(false);
      
      // Staggered loading of products
      mockProducts.forEach((product, index) => {
        setTimeout(() => {
          setLoadedProducts(prev => [...prev, index]);
        }, index * 150);
      });
    }, 1000);
  }, [categoryName]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/itemlist/product/${productId}`);
  };

  const handleChatClick = async (productId, sellerName) => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    try {
      // Get product details to create chat
      const productRef = doc(db, "items", productId)
      const productDoc = await getDoc(productRef)
      
      if (!productDoc.exists()) {
        alert("Product not found!")
        return
      }

      const product = productDoc.data()

      // Check if user is trying to chat with their own product
      if (currentUser.uid === product.userId) {
        alert("You cannot chat with yourself about your own product!")
        return
      }

      // Create chat document
      const newChatId = `${productId}_${currentUser.uid}`
      const chatRef = doc(db, "chats", newChatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) {
        // Get buyer and seller data
        const buyerRef = doc(db, "users", currentUser.uid)
        const sellerRef = doc(db, "users", product.userId)
        
        const [buyerDoc, sellerDoc] = await Promise.all([
          getDoc(buyerRef),
          getDoc(sellerRef)
        ])
        
        const buyerData = buyerDoc.exists() ? buyerDoc.data() : { fullName: "Unknown User" }
        const sellerData = sellerDoc.exists() ? sellerDoc.data() : { fullName: "Unknown User" }
        
        console.log("CategoryPage: Creating chat with:", {
          buyerName: buyerData.fullName || currentUser.displayName || "Unknown User",
          sellerName: sellerData.fullName || "Unknown User"
        })
        
        await setDoc(chatRef, {
          chatId: newChatId,
          productId: productId,
          productTitle: product.title || product.name,
          buyerId: currentUser.uid,
          sellerId: product.userId,
          buyerName: buyerData.fullName || currentUser.displayName || "Unknown User",
          sellerName: sellerData.fullName || sellerName || "Unknown User",
          lastMessage: "",
          lastUpdated: new Date().toISOString(),
          productImage: product.images?.[0] || "",
          productPrice: product.price || 0,
          productCategory: product.category || "General"
        })
        
        console.log("CategoryPage: Chat created successfully with ID:", newChatId)
      } else {
        console.log("CategoryPage: Chat already exists:", newChatId)
      }

      // Navigate to chat interface
      navigate(`/chating?chatId=${newChatId}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      alert("Failed to start chat. Please try again.")
    }
  };

  const sortProducts = (products, sortBy) => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...products].sort((a, b) => b.averageRating - a.averageRating);
      case 'newest':
        return [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return products;
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = sortProducts(filteredProducts, sortBy);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500`}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryName || 'All Categories'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover amazing items in {categoryName || 'all categories'}. Find the perfect deals from your campus community.
          </p>
        </div>

        {/* Search and Filters */}
        <div className={`mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Condition Filter */}
              <Select value={filters.condition} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Conditions</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Prices</SelectItem>
                  <SelectItem value="0-1000">Under ₹1,000</SelectItem>
                  <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                  <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                  <SelectItem value="10000+">Above ₹10,000</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className={`flex justify-between items-center mb-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {products.length} items found
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortProducts(products, sortBy).map((product, index) => (
              <div
                key={product.id}
                className={`transition-all duration-700 transform ${
                  loadedProducts.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Card className={`group cursor-pointer h-full bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
                }`}>
                  {/* Product Image */}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-48 h-32' : 'aspect-square'
                  }`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-600 text-white">
                        {product.condition}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className={`p-4 flex-1 flex flex-col ${
                    viewMode === 'list' ? 'justify-center' : 'justify-between'
                  }`}>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                            {product.averageRating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({product.totalRatings})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {product.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ₹{product.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatClick(product.id, product.seller.name);
                          }}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            const shareUrl = `${window.location.origin}/itemlist/product/${product.id}`;
                            
                            // Simple copy to clipboard
                            navigator.clipboard.writeText(shareUrl).then(() => {
                              // Show visual feedback
                              const originalContent = e.currentTarget.innerHTML
                              e.currentTarget.innerHTML = '<svg class="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!'
                              e.currentTarget.classList.add('bg-green-100', 'dark:bg-green-900/20', 'text-green-700', 'dark:text-green-300')
                              
                              setTimeout(() => {
                                e.currentTarget.innerHTML = '<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>'
                                e.currentTarget.classList.remove('bg-green-100', 'dark:bg-green-900/20', 'text-green-700', 'dark:text-green-300')
                              }, 2000)
                            }).catch(() => {
                              alert("Product link: " + shareUrl)
                            });
                          }}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          title="Copy product link"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 border border-gray-100 dark:border-gray-700 shadow-xl max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No items found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
