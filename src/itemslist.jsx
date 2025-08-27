"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase/config"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { Search, Sliders, Heart, ShoppingCart, Clock, Gift, MessageCircle } from "lucide-react"
import Navbar from "./navbar"
import { useParams, useNavigate } from "react-router-dom"
import { Eye } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "./contexts/ThemeContext"

const auth = getAuth()

export default function ProductListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [products, setProducts] = useState([]) // Stores product data
  const [userMap, setUserMap] = useState({}) // Maps userId -> name
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [favorites, setFavorites] = useState(new Set()) // Set of favorite product IDs
  const [isVisible, setIsVisible] = useState(false) // For lazy loading animations
  const [loadedProducts, setLoadedProducts] = useState([]) // For staggered product animations
  const { isDarkMode } = useTheme()

  const { categoryRoute } = useParams()
  const navigate = useNavigate()

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (user) {
        loadFavorites(user.uid)
      } else {
        setFavorites(new Set())
      }
    })

    return () => unsubscribe()
  }, [])

  // Lazy loading effect for staggered animations
  useEffect(() => {
    setIsVisible(true)
    
    // Staggered loading of products
    const timer = setTimeout(() => {
      const productCount = products.length
      for (let i = 0; i < productCount; i++) {
        setTimeout(() => {
          setLoadedProducts(prev => [...prev, i])
        }, i * 150) // 150ms delay between each product
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [products.length])

  // Load user's favorites
  const loadFavorites = (uid) => {
    const favoritesRef = collection(db, "users", uid, "favorites")
    const unsubscribe = onSnapshot(favoritesRef, (snapshot) => {
      const favoriteIds = new Set(snapshot.docs.map(doc => doc.id))
      setFavorites(favoriteIds)
    }, (error) => {
      console.error("Error loading favorites:", error)
    })

    return unsubscribe
  }

  // Toggle favorite status
  const toggleFavorite = async (e, productId) => {
    e.stopPropagation()
    
    if (!currentUser) {
      toast.error("Please login to add favorites")
      navigate("/login")
      return
    }

    try {
      const favoriteRef = doc(db, "users", currentUser.uid, "favorites", productId)
      
      if (favorites.has(productId)) {
        // Remove from favorites
        await deleteDoc(favoriteRef)
        toast.success("Removed from favorites")
      } else {
        // Add to favorites
        const product = products.find(p => p.id === productId)
        if (product) {
          await setDoc(favoriteRef, {
            productId,
            addedAt: new Date(),
            title: product.title,
            price: product.price,
            images: product.images,
            category: product.category,
            listingType: product.listingType
          })
          toast.success("Added to favorites")
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast.error("Failed to update favorites. Please try again.")
    }
  }

  useEffect(() => {
    if (categoryRoute) {
     // console.log(categoryRoute)
      setCategoryFilter(categoryRoute)
    } else {
      setCategoryFilter("All")
    }
  }, [categoryRoute])

  const handleCategoryChange = (e) => {
    const selected = e.target.value
    if (selected === "All") {
      navigate("/itemlist")
    } else {
      navigate(`/itemlist/${selected}`)
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "items"))
        const fetchedProducts = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            userId: data.userId || "unknownUser", // Fallback if userId is missing
          }
        })

        // Get unique userIds to fetch, filtering out undefined or null
        const userIds = [
          ...new Set(
            fetchedProducts
              .map((product) => product.userId)
              .filter((userId) => userId !== undefined && userId !== null && userId !== "unknownUser"),
          ),
        ]

        await fetchUsers(userIds) // Fetch corresponding user names

        setProducts(fetchedProducts)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    // Fetch user names based on userId and map them
    const fetchUsers = async (userIds) => {
      const userMapTemp = {}
      for (const userId of userIds) {
        if (!userId || userId === "unknownUser") continue // Skip invalid userIds

        try {
          const userDoc = await getDoc(doc(db, "users", userId))
          if (userDoc.exists()) {
            userMapTemp[userId] = userDoc.data().fullName
          } else {
            userMapTemp[userId] = "Unknown" // Fallback if user not found
          }
        } catch (error) {
          console.error(`Error fetching user for ID ${userId}:`, error)
          userMapTemp[userId] = "Unknown"
        }
      }
      setUserMap(userMapTemp)
    }

    fetchProducts()
  }, [])

  // Add chat functionality
  const handleChatClick = async (e, product) => {
    e.stopPropagation()
    
    if (!currentUser) {
      navigate("/login")
      return
    }

    // Check if user is trying to chat with their own product
    if (currentUser.uid === product.userId) {
      alert("You cannot chat with yourself about your own product!")
      return
    }

    try {
      // Create chat document
      const newChatId = `${product.id}_${currentUser.uid}`
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
        
        console.log("Creating chat with:", {
          buyerName: buyerData.fullName || currentUser.displayName || "Unknown User",
          sellerName: sellerData.fullName || "Unknown User"
        })
        
        await setDoc(chatRef, {
          chatId: newChatId,
          productId: product.id,
          productTitle: product.title,
          buyerId: currentUser.uid,
          sellerId: product.userId,
          buyerName: buyerData.fullName || currentUser.displayName || "Unknown User",
          sellerName: sellerData.fullName || "Unknown User",
          lastMessage: "",
          lastUpdated: new Date().toISOString(),
          productImage: product.images?.[0] || "",
          productPrice: product.price || 0,
          productCategory: product.category || "General"
        })
        
        console.log("Chat created successfully with ID:", newChatId)
      } else {
        console.log("Chat already exists:", newChatId)
      }

      // Navigate to chat interface
      navigate(`/chating?chatId=${newChatId}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      alert("Failed to start chat. Please try again.")
    }
  }

  // Get unique categories for filter
  const categories = ["All", ...new Set(products.map((product) => product.category))]

  // Filter products based on search query and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

 
  if (loading) {
    return <p className="text-center mt-12 text-lg">Loading products...</p>
  }

  if (selectedProductId !== null) {
    navigate(`/itemlist/product/${selectedProductId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        {/* Header Section */}
        <div className={`mb-8 sm:mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {categoryFilter === "All" ? "Discover Amazing Items" : `${categoryFilter} Items`}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Find the perfect items from your campus community. Buy, sell, rent, or get items for free!
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className={`mb-8 sm:mb-12 space-y-4 sm:space-y-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Search Bar */}
          <div className={`relative max-w-2xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Category Filter */}
          <div className={`flex justify-center transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              <Sliders className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="appearance-none pl-10 pr-8 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-lg cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div className={`text-center py-16 sm:py-24 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 border border-gray-100 dark:border-gray-700 shadow-xl max-w-md mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No items found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchQuery || categoryFilter !== "All" 
                  ? "Try adjusting your search or filters" 
                  : "Be the first to list an item in this category!"
                }
              </p>
              <button
                onClick={() => navigate("/addItem")}
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl text-base sm:text-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Item
              </button>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group cursor-pointer h-full transition-all duration-700 transform ${
                  loadedProducts.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className={`bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col ${
                  product.listingType === "rent" ? "ring-2 ring-purple-200 dark:ring-purple-800" : ""
                } ${product.listingType === "donate" ? "ring-2 ring-emerald-200 dark:ring-emerald-800" : ""}`}>
                  
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Listing Type Badge */}
                    {product.listingType && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                        {product.listingType === "rent" && (
                          <div className="px-2 sm:px-3 py-1 bg-purple-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                            Rent
                          </div>
                        )}
                        {product.listingType === "donate" && (
                          <div className="px-2 sm:px-3 py-1 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg">
                            <Gift className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                            Free
                          </div>
                        )}
                        {product.listingType === "sell" && (
                          <div className="px-2 sm:px-3 py-1 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-full shadow-lg">
                            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                            Sale
                          </div>
                        )}
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      className={`absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl ${
                        favorites.has(product.id) 
                          ? "bg-red-500 hover:bg-red-600" 
                          : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700"
                      }`}
                      onClick={(e) => toggleFavorite(e, product.id)}
                      title={favorites.has(product.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                        favorites.has(product.id) 
                          ? "text-white fill-white" 
                          : "text-gray-600 dark:text-gray-300 hover:text-red-500"
                      }`} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    <div className="mb-2 sm:mb-3">
                      <span className="inline-block px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                        {product.category || "General"}
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1">
                      {product.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    
                    {/* Price Section */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      {product.listingType === "donate" ? (
                        <div className="text-xl sm:text-2xl font-bold text-emerald-600">Free</div>
                      ) : product.listingType === "rent" ? (
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">
                          ₹{product.rentAmount?.toLocaleString() || "0"}/day
                        </div>
                      ) : (
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">
                          ₹{product.price?.toLocaleString() || "0"}
                        </div>
                      )}
                      
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right">
                        by {userMap[product.userId] || "Unknown"}
                      </div>
                    </div>

                    {/* Condition Badge */}
                    {product.condition && (
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          product.condition === "New" ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" :
                          product.condition === "Like New" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" :
                          product.condition === "Good" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300" :
                          "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        }`}>
                          {product.condition}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 sm:gap-3 mt-auto">
                      <button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProductId(product.id)
                        }}
                      >
                        View Details
                      </button>
                      
                      <button
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                        onClick={(e) => handleChatClick(e, product)}
                        title="Chat with seller"
                      >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                      </button>

                      <button
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          const shareUrl = `${window.location.origin}/itemlist/product/${product.id}`
                          
                          // Simple copy to clipboard
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            // Show visual feedback
                            const originalContent = e.currentTarget.innerHTML
                            e.currentTarget.innerHTML = '<svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
                            e.currentTarget.classList.add('bg-green-100', 'dark:bg-green-900/20')
                            
                            setTimeout(() => {
                              e.currentTarget.innerHTML = originalContent
                              e.currentTarget.classList.remove('bg-green-100', 'dark:bg-green-900/20')
                            }, 2000)
                          }).catch(() => {
                            alert("Product link: " + shareUrl)
                          })
                        }}
                        title="Copy product link"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
