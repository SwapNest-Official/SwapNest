"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase/config"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  Clock,
  Gift,
  MessageCircle,
  MapPin,
  Eye,
  Share2,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  User,
  Zap,
  Sparkles,
  Tag,
  Users,
  Activity,
  Briefcase,
  Award,
  Flame,
  Plus,
  RefreshCw,
  GraduationCap,
} from "lucide-react"
import Navbar from "./navbar"
import { useParams, useNavigate } from "react-router-dom"
import { useOffersCount } from "./contexts/OffersCountContext"

const auth = getAuth()

export default function ProductListPage() {
  // ========== STATE MANAGEMENT ==========
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [collegeFilter, setCollegeFilter] = useState("All") // Added college filter state
 const [selectedProductId, setSelectedProductId] = useState(null);
  const [products, setProducts] = useState([])
  const [userMap, setUserMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [favorites, setFavorites] = useState(new Set())
  const [isVisible, setIsVisible] = useState(false)
  const [loadedProducts, setLoadedProducts] = useState([])
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set())
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [featuredCarousel, setFeaturedCarousel] = useState(0)
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [selectedCondition, setSelectedCondition] = useState("All")
  const [selectedListingType, setSelectedListingType] = useState("All")

  // Context and routing
  const { offersCount, loading: offersLoading } = useOffersCount()
  const { categoryRoute } = useParams()
  const navigate = useNavigate()

  // ========== AUTHENTICATION LISTENER ==========
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

  // ========== CAROUSEL AUTO-ROTATION ==========
  useEffect(() => {
    if (products.length === 0) return

    const timer = setInterval(() => {
      setFeaturedCarousel((prev) => (prev + 1) % Math.min(products.length, 5))
    }, 5000)
    return () => clearInterval(timer)
  }, [products.length])

  // ========== LAZY LOADING ANIMATION ==========
  useEffect(() => {
    setIsVisible(true)
    setLoadedProducts([]) // Reset loaded products when products change

    const timer = setTimeout(() => {
      const productCount = products.length
      for (let i = 0; i < productCount; i++) {
        setTimeout(() => {
          setLoadedProducts((prev) => [...prev, i])
        }, i * 80)
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [products.length])

  // ========== CATEGORY ROUTE HANDLING ==========
  useEffect(() => {
    if (categoryRoute) {
      setCategoryFilter(categoryRoute)
    } else {
      setCategoryFilter("All")
    }
  }, [categoryRoute])

  // ========== INITIAL DATA FETCH ==========
  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (selectedProductId !== null) {
      navigate(`/itemlist/product/${selectedProductId}`)
      setSelectedProductId(null) // Reset after navigation
    }
  }, [selectedProductId, navigate])

  // ========== FAVORITES MANAGEMENT ==========
  const loadFavorites = useCallback((uid) => {
    const favoritesRef = collection(db, "users", uid, "favorites")
    const unsubscribe = onSnapshot(
      favoritesRef,
      (snapshot) => {
        const favoriteIds = new Set(snapshot.docs.map((doc) => doc.id))
        setFavorites(favoriteIds)
      },
      (error) => {
        console.error("Error loading favorites:", error)
      },
    )
    return unsubscribe
  }, [])

  const toggleFavorite = async (e, productId) => {
    e.stopPropagation()
    if (!currentUser) {
      navigate("/login")
      return
    }

    try {
      const favoriteRef = doc(db, "users", currentUser.uid, "favorites", productId)
      if (favorites.has(productId)) {
        await deleteDoc(favoriteRef)
      } else {
        const product = products.find((p) => p.id === productId)
        if (product) {
          await setDoc(favoriteRef, {
            productId,
            addedAt: new Date(),
            title: product.title,
            price: product.price,
            image: product.images?.[0],
            category: product.category,
          })
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  // ========== DESCRIPTION EXPANSION ==========
  const toggleDescription = (e, productId) => {
    e.stopPropagation()
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  // ========== CATEGORY HANDLING ==========
  const handleCategoryChange = (category) => {
    if (category === "All") {
      navigate("/itemlist")
    } else {
      navigate(`/itemlist/${category}`)
    }
  }

  // ========== DATA FETCHING ==========
  const fetchProducts = async (isBackgroundRefresh = false) => {
    try {
      if (isBackgroundRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const querySnapshot = await getDocs(collection(db, "items"))
      const fetchedProducts = querySnapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            userId: data.userId || "unknownUser",
          }
        })
        .filter((product) => {
          return (
            !product.sold && product.status !== "sold" && !product.removedFromMarketplace && product.isActive !== false
          )
        })

      const userIds = [
        ...new Set(
          fetchedProducts
            .map((product) => product.userId)
            .filter((userId) => userId !== undefined && userId !== null && userId !== "unknownUser"),
        ),
      ]

      await fetchUsers(userIds)
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      if (isBackgroundRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const fetchUsers = async (userIds) => {
    const userMapTemp = {}
    for (const userId of userIds) {
      if (!userId || userId === "unknownUser") continue

      try {
        const userDoc = await getDoc(doc(db, "users", userId))
        if (userDoc.exists()) {
          userMapTemp[userId] = userDoc.data().fullName
        } else {
          userMapTemp[userId] = "Unknown"
        }
      } catch (error) {
        console.error(`Error fetching user for ID ${userId}:`, error)
        userMapTemp[userId] = "Unknown"
      }
    }
    setUserMap(userMapTemp)
  }

  // ========== CHAT FUNCTIONALITY ==========
  const handleChatClick = async (e, product) => {
    e.stopPropagation()

    if (!currentUser) {
      navigate("/login")
      return
    }

    if (currentUser.uid === product.userId) {
      alert("You cannot chat with yourself about your own product!")
      return
    }

    try {
      const newChatId = `${product.id}_${currentUser.uid}`
      const chatRef = doc(db, "chats", newChatId)
      const chatDoc = await getDoc(chatRef)

      if (!chatDoc.exists()) {
        const buyerRef = doc(db, "users", currentUser.uid)
        const sellerRef = doc(db, "users", product.userId)

        const [buyerDoc, sellerDoc] = await Promise.all([getDoc(buyerRef), getDoc(sellerRef)])

        const buyerData = buyerDoc.exists() ? buyerDoc.data() : { fullName: "Unknown User" }
        const sellerData = sellerDoc.exists() ? sellerDoc.data() : { fullName: "Unknown User" }

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
          productCategory: product.category || "General",
        })
      }

      navigate(`/chating?chatId=${newChatId}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      alert("Failed to start chat. Please try again.")
    }
  }

  // ========== FILTERING AND SORTING ==========
  const categories = ["All", ...new Set(products.map((product) => product.category))]
  const colleges = ["All", ...new Set(products.map((product) => product.college).filter(Boolean))] // Added colleges list

  const filteredProducts = products
    .filter((product) => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        product.title?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.tags?.toLowerCase().includes(searchLower) ||
        product.college?.toLowerCase().includes(searchLower)

      const matchesCategory = categoryFilter === "All" || product.category === categoryFilter
      const matchesCollege = collegeFilter === "All" || product.college === collegeFilter // Added college filter
      const matchesCondition = selectedCondition === "All" || product.condition === selectedCondition
      const matchesListingType = selectedListingType === "All" || product.listingType === selectedListingType

      const price = product.listingType === "rent" ? product.rentAmount : product.price
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]

      return (
        matchesSearch && matchesCategory && matchesCollege && matchesCondition && matchesListingType && matchesPrice
      ) // Added college filter to return
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          const priceA = a.listingType === "rent" ? a.rentAmount : a.price
          const priceB = b.listingType === "rent" ? b.rentAmount : b.price
          return (priceA || 0) - (priceB || 0) // Handle undefined prices
        case "price-high":
          const priceA2 = a.listingType === "rent" ? a.rentAmount : a.price
          const priceB2 = b.listingType === "rent" ? b.rentAmount : b.price
          return (priceB2 || 0) - (priceA2 || 0) // Handle undefined prices
        case "popular":
          return (b.views || 0) - (a.views || 0)
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    })

  const featuredProducts = products.slice(0, 5)

  const handleProductSelect = useCallback((productId) => {
    setSelectedProductId(productId)
  }, [])

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="space-y-8 lg:space-y-12">
            {/* Header skeleton - Responsive */}
            <div className="text-center space-y-4 lg:space-y-6">
              <div className="h-3 lg:h-4 bg-gradient-to-r from-indigo-200 to-cyan-200 dark:from-indigo-800 dark:to-cyan-800 rounded-full w-24 lg:w-32 mx-auto animate-pulse"></div>
              <div className="h-12 lg:h-16 bg-gradient-to-r from-indigo-300 to-cyan-300 dark:from-indigo-700 dark:to-cyan-700 rounded-2xl lg:rounded-3xl w-full max-w-xs sm:max-w-md lg:max-w-4xl mx-auto animate-pulse"></div>
              <div className="h-4 lg:h-6 bg-indigo-200 dark:bg-indigo-800 rounded-xl lg:rounded-2xl w-48 lg:w-96 mx-auto animate-pulse"></div>
            </div>

            {/* Stats skeleton - Responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 lg:h-20 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 rounded-2xl lg:rounded-3xl animate-pulse"
                ></div>
              ))}
            </div>

            {/* Featured carousel skeleton - Responsive height */}
            <div className="h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-indigo-200 to-cyan-200 dark:from-indigo-800 dark:to-cyan-800 rounded-2xl lg:rounded-[2rem] animate-pulse shadow-xl lg:shadow-2xl"></div>

            {/* Filter skeleton */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl lg:rounded-[2rem] p-6 lg:p-8 border border-indigo-200/20 dark:border-indigo-700/20 shadow-xl lg:shadow-2xl">
              <div className="space-y-4 lg:space-y-6">
                <div className="h-12 lg:h-16 bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-800 dark:to-cyan-800 rounded-xl lg:rounded-2xl animate-pulse"></div>
                <div className="flex flex-wrap justify-center gap-2 lg:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 lg:h-12 w-16 lg:w-24 bg-indigo-100 dark:bg-indigo-800 rounded-xl lg:rounded-2xl animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid skeleton - Responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl lg:rounded-[1.5rem] p-4 lg:p-6 space-y-3 lg:space-y-4 animate-pulse border border-indigo-100/20 dark:border-indigo-800/20 shadow-lg lg:shadow-xl"
                >
                  <div className="aspect-square bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-800 dark:to-cyan-800 rounded-xl lg:rounded-2xl"></div>
                  <div className="space-y-2 lg:space-y-3">
                    <div className="h-3 lg:h-4 bg-indigo-200 dark:bg-indigo-700 rounded-lg w-1/3"></div>
                    <div className="h-4 lg:h-6 bg-indigo-300 dark:bg-indigo-600 rounded-lg w-full"></div>
                    <div className="h-3 lg:h-4 bg-indigo-200 dark:bg-indigo-700 rounded-lg w-2/3"></div>
                    <div className="h-6 lg:h-8 bg-gradient-to-r from-indigo-200 to-cyan-200 dark:from-indigo-700 dark:to-cyan-700 rounded-xl w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 transition-all duration-700">
      <Navbar />

      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,theme(colors.indigo.500/10),transparent_50%),radial-gradient(circle_at_80%_80%,theme(colors.cyan.500/10),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative">
          <div className="text-center mb-12 lg:mb-16">
            {/* Premium Badge - Responsive */}
            <div className="inline-flex items-center gap-2 lg:gap-3 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 backdrop-blur-xl rounded-full border border-indigo-500/20 mb-6 lg:mb-8 hover:scale-105 transition-transform duration-300">
              <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full animate-pulse"></div>
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs sm:text-sm font-bold text-indigo-800 dark:text-indigo-300 tracking-wider uppercase">
                Premium Campus Marketplace
              </span>
              <Award className="w-4 h-4 lg:w-5 lg:h-5 text-cyan-600 dark:text-cyan-400" />
            </div>

            {/* Main Title - Responsive */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 lg:mb-8 leading-none">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
                Explore Campus
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Treasures
              </span>
            </h1>

            {/* Subtitle - Responsive */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium mb-8 lg:mb-12 px-4">
              Your trusted marketplace for campus commerce. Connect with fellow students, discover amazing deals, and
              trade with confidence.
            </p>

            {/* Stats Row - Responsive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mb-8 lg:mb-12">
              {/* Total Items */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-indigo-200/30 dark:border-indigo-700/30 shadow-xl lg:shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <div className="p-2 lg:p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform">
                    <Tag className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                  {products.length}
                </div>
                <div className="text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </div>
              </div>

              {/* Active Offers */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-emerald-200/30 dark:border-emerald-700/30 shadow-xl lg:shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <div className="p-2 lg:p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform">
                    <Activity className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                  {offersLoading ? "..." : offersCount}
                </div>
                <div className="text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center gap-1">
                  <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  Active Offers
                </div>
              </div>

              {/* Users */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-cyan-200/30 dark:border-cyan-700/30 shadow-xl lg:shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <div className="p-2 lg:p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform">
                    <Users className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-cyan-600 dark:text-cyan-400 mb-1">
                  {Object.keys(userMap).length}
                </div>
                <div className="text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Sellers
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-purple-200/30 dark:border-purple-700/30 shadow-xl lg:shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group">
                <div className="flex items-center justify-center mb-2 lg:mb-3">
                  <div className="p-2 lg:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform">
                    <Briefcase className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl lg:text-3xl font-black text-purple-600 dark:text-purple-400 mb-1">
                  {categories.length - 1}
                </div>
                <div className="text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Categories
                </div>
              </div>
            </div>

            {/* Refresh Indicator */}
            {refreshing && (
              <div className="inline-flex items-center gap-2 lg:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 backdrop-blur-xl rounded-full border border-indigo-500/20 mb-6 lg:mb-8">
                <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 animate-spin text-indigo-500" />
                <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  Refreshing marketplace...
                </span>
              </div>
            )}

            {/* ========== FEATURED PRODUCTS CAROUSEL ========== */}
            {featuredProducts.length > 0 && (
              <div className="relative mb-12 lg:mb-20">
                <div className="text-center mb-8 lg:mb-12">
                  <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-full border border-orange-500/20 mb-3 lg:mb-4">
                    <Flame className="w-4 h-4 lg:w-5 lg:h-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs sm:text-sm font-bold text-orange-800 dark:text-orange-300 tracking-wider uppercase">
                      Featured Items
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 dark:text-white mb-3">
                    Trending{" "}
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      Now
                    </span>
                  </h2>
                </div>

                <div className="relative group">
                  <div className="overflow-hidden rounded-2xl lg:rounded-[2rem] shadow-2xl lg:shadow-3xl bg-white/10 dark:bg-gray-800/10 backdrop-blur-3xl border border-white/20 dark:border-gray-700/20">
                    <div
                      className="flex transition-transform duration-1000 ease-out"
                      style={{ transform: `translateX(-${featuredCarousel * 100}%)` }}
                    >
                      {featuredProducts.map((product, index) => (
                        <div key={product.id} className="w-full flex-shrink-0">
                          <div
                            className="relative h-64 sm:h-80 lg:h-96 cursor-pointer overflow-hidden"
                            onClick={() => handleProductSelect(product.id)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/60 z-10"></div>
                            <img
                              src={product.images?.[0] || "/placeholder.svg"}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Content Overlay - Responsive */}
                            <div className="absolute inset-0 flex items-end z-20 p-4 sm:p-6 lg:p-12">
                              <div className="max-w-5xl w-full">
                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6 flex-wrap">
                                  <span className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl text-white font-bold text-xs sm:text-sm border border-white/20">
                                    {product.category}
                                  </span>
                                  {product.listingType === "rent" && (
                                    <span className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-purple-500/80 to-indigo-500/80 backdrop-blur-sm rounded-xl lg:rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center gap-1 lg:gap-2">
                                      <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                                      For Rent
                                    </span>
                                  )}
                                  {product.listingType === "donate" && (
                                    <span className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-emerald-500/80 to-teal-500/80 backdrop-blur-sm rounded-xl lg:rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center gap-1 lg:gap-2">
                                      <Gift className="w-3 h-3 lg:w-4 lg:h-4" />
                                      Free
                                    </span>
                                  )}
                                  {product.condition && (
                                    <span className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 backdrop-blur-sm rounded-xl lg:rounded-2xl text-white font-bold text-xs sm:text-sm">
                                      {product.condition}
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-6xl font-black text-white mb-2 sm:mb-3 lg:mb-4 leading-tight drop-shadow-2xl line-clamp-2">
                                  {product.title}
                                </h3>

                                <p className="text-sm sm:text-lg lg:text-xl text-gray-200 mb-4 sm:mb-6 lg:mb-8 line-clamp-2 max-w-3xl leading-relaxed">
                                  {product.description}
                                </p>

                                <div className="flex items-center justify-between flex-wrap gap-4">
                                  <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white drop-shadow-2xl">
                                    {product.listingType === "donate" ? (
                                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                        Free
                                      </span>
                                    ) : product.listingType === "rent" ? (
                                      <>
                                        <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                          ₹{product.rentAmount?.toLocaleString()}
                                        </span>
                                        <span className="text-sm sm:text-base lg:text-lg text-gray-300">/day</span>
                                      </>
                                    ) : (
                                      <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                        ₹{product.price?.toLocaleString()}
                                      </span>
                                    )}
                                  </div>

                                  <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-white to-gray-100 text-gray-900 rounded-xl lg:rounded-2xl font-black hover:from-gray-100 hover:to-white transition-all duration-300 transform hover:scale-105 shadow-2xl text-sm sm:text-base lg:text-lg">
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Navigation - Hidden on mobile, shown on larger screens */}
                    <button
                      onClick={() =>
                        setFeaturedCarousel((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)
                      }
                      className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-xl rounded-full items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-30 border border-white/20 hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 lg:w-7 lg:h-7" />
                    </button>
                    <button
                      onClick={() => setFeaturedCarousel((prev) => (prev + 1) % featuredProducts.length)}
                      className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-xl rounded-full items-center justify-center text-white hover:bg-white/30 transition-all duration-300 z-30 border border-white/20 hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 lg:w-7 lg:h-7" />
                    </button>

                    {/* Carousel Indicators - Responsive */}
                    <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 lg:gap-3 z-30">
                      {featuredProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setFeaturedCarousel(index)}
                          className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 border-2 ${
                            index === featuredCarousel
                              ? "bg-white border-white scale-125 shadow-lg"
                              : "bg-white/30 border-white/50 hover:bg-white/50 hover:scale-110"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== SEARCH & FILTER SECTION ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 lg:mb-16">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl rounded-2xl lg:rounded-[2rem] p-6 sm:p-8 lg:p-12 border border-indigo-200/20 dark:border-indigo-700/20 shadow-2xl lg:shadow-3xl">
          {/* Search Bar - Responsive */}
          <div className="relative max-w-4xl mx-auto mb-8 lg:mb-10">
            <div className="relative group">
              <Search className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 lg:w-7 sm:h-6 lg:h-7 text-indigo-400 group-hover:text-indigo-600 transition-colors z-10" />
              <input
                type="text"
                placeholder="Search for anything amazing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 sm:pl-16 lg:pl-20 pr-24 sm:pr-32 lg:pr-40 py-3 sm:py-4 lg:py-6 bg-gradient-to-r from-white to-indigo-50/50 dark:from-gray-900 dark:to-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl lg:rounded-3xl text-base sm:text-lg lg:text-xl font-medium focus:border-indigo-400 focus:outline-none transition-all duration-300 shadow-xl focus:shadow-2xl placeholder:text-indigo-400/60"
              />
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                <button className="px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-xl lg:rounded-2xl font-bold hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 text-sm sm:text-base">
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills - Responsive */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 lg:mb-10">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 border-2 text-sm sm:text-base ${
                  categoryFilter === category
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-xl"
                    : "bg-white/80 dark:bg-gray-800/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 shadow-lg hover:shadow-xl"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {colleges.length > 1 && (
            <div className="mb-8 lg:mb-10">
              <div className="flex items-center justify-center gap-2 lg:gap-3 mb-3 lg:mb-4">
                <GraduationCap className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300">
                  Filter by College
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {colleges.map((college) => (
                  <button
                    key={college}
                    onClick={() => setCollegeFilter(college)}
                    className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-xl lg:rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 border-2 text-sm sm:text-base ${
                      collegeFilter === college
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-xl"
                        : "bg-white/80 dark:bg-gray-800/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-400 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {college}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Control Bar - Responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            {/* View & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
              {/* View Mode Toggle */}
              <div className="flex bg-indigo-100 dark:bg-indigo-900/30 rounded-xl lg:rounded-2xl p-1.5 lg:p-2 border border-indigo-200 dark:border-indigo-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-indigo-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-105"
                      : "hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 text-indigo-500 dark:text-indigo-400"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 lg:w-6 lg:h-6" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-indigo-800 shadow-lg text-indigo-600 dark:text-indigo-400 scale-105"
                      : "hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 text-indigo-500 dark:text-indigo-400"
                  }`}
                >
                  <List className="w-4 h-4 lg:w-6 lg:h-6" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-white/90 dark:bg-gray-800/90 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl lg:rounded-2xl focus:border-indigo-400 focus:outline-none font-medium text-indigo-700 dark:text-indigo-300 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              >
                <option value="newest">✨ Newest First</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="popular">🔥 Most Popular</option>
              </select>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 lg:gap-3 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl lg:rounded-2xl hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 transition-all font-bold text-indigo-700 dark:text-indigo-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Advanced</span> Filters
              </button>
            </div>

            {/* Results Summary */}
            <div className="text-right sm:text-left lg:text-right">
              <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                {filteredProducts.length}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Items Found
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel - Responsive */}
          {showFilters && (
            <div className="mt-8 lg:mt-10 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl lg:rounded-3xl border-2 border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-xl">
              <h3 className="text-xl sm:text-2xl font-black text-indigo-800 dark:text-indigo-200 mb-4 sm:mb-6 text-center">
                Advanced Filters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Price Range */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3 lg:mb-4">
                    💰 Price Range
                  </label>
                  <div className="flex gap-3 lg:gap-4">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                      className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg lg:rounded-xl font-medium focus:border-indigo-500 focus:outline-none text-sm sm:text-base"
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                      className="flex-1 px-3 lg:px-4 py-2 lg:py-3 bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg lg:rounded-xl font-medium focus:border-indigo-500 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3 lg:mb-4">
                    ✨ Condition
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg lg:rounded-xl font-medium focus:border-indigo-500 focus:outline-none text-sm sm:text-base"
                  >
                    <option value="All">All Conditions</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>

                {/* Listing Type */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3 lg:mb-4">
                    🏷️ Listing Type
                  </label>
                  <select
                    value={selectedListingType}
                    onChange={(e) => setSelectedListingType(e.target.value)}
                    className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-white dark:bg-gray-800 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg lg:rounded-xl font-medium focus:border-indigo-500 focus:outline-none text-sm sm:text-base"
                  >
                    <option value="All">All Types</option>
                    <option value="sell">For Sale</option>
                    <option value="rent">For Rent</option>
                    <option value="donate">Free/Donate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Summary - Responsive */}
          {(searchQuery ||
            categoryFilter !== "All" ||
            collegeFilter !== "All" ||
            selectedCondition !== "All" ||
            selectedListingType !== "All") && (
            <div className="mt-6 lg:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl lg:rounded-2xl border border-blue-200 dark:border-blue-700">
              <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                <span className="text-base sm:text-lg font-bold text-blue-800 dark:text-blue-200">Active Filters:</span>
                {searchQuery && (
                  <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-blue-500 text-white rounded-full text-xs sm:text-sm font-bold">
                    Search: "{searchQuery}"
                  </span>
                )}
                {categoryFilter !== "All" && (
                  <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-indigo-500 text-white rounded-full text-xs sm:text-sm font-bold">
                    Category: {categoryFilter}
                  </span>
                )}
                {collegeFilter !== "All" && (
                  <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-purple-500 text-white rounded-full text-xs sm:text-sm font-bold">
                    College: {collegeFilter}
                  </span>
                )}
                {selectedCondition !== "All" && (
                  <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-purple-500 text-white rounded-full text-xs sm:text-sm font-bold">
                    Condition: {selectedCondition}
                  </span>
                )}
                {selectedListingType !== "All" && (
                  <span className="px-3 lg:px-4 py-1.5 lg:py-2 bg-green-500 text-white rounded-full text-xs sm:text-sm font-bold">
                    Type: {selectedListingType}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setCategoryFilter("All")
                    setCollegeFilter("All") // Reset college filter
                    setSelectedCondition("All")
                    setSelectedListingType("All")
                  }}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs sm:text-sm font-bold transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== PRODUCTS GRID/LIST ========== */}
      {filteredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
          {/* Section Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-gray-800 dark:text-white mb-3 lg:mb-4">
              Marketplace{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">Items</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover amazing deals from your campus community
            </p>
          </div>

          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
                : "space-y-6 lg:space-y-8"
            }`}
          >
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`group cursor-pointer transition-all duration-700 transform hover:scale-[1.02] ${
                  loadedProducts.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                } ${
                  viewMode === "list"
                    ? "flex flex-col sm:flex-row bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl lg:rounded-[2rem] p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 lg:gap-8 border border-indigo-200/20 dark:border-indigo-700/20 shadow-xl lg:shadow-2xl hover:shadow-3xl"
                    : ""
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
                onClick={() => handleProductSelect(product.id)}
              >
                {viewMode === "grid" ? (
                  // ========== GRID VIEW CARD ==========
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl lg:rounded-[2rem] overflow-hidden border border-indigo-200/20 dark:border-indigo-700/20 shadow-xl lg:shadow-2xl hover:shadow-3xl transition-all duration-500 h-full flex flex-col group-hover:border-indigo-400/40">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Premium Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Listing Type Badge */}
                      {product.listingType && (
                        <div className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 z-10">
                          {product.listingType === "rent" && (
                            <div className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-purple-500 to-indigo-500 backdrop-blur-sm text-white font-black rounded-xl lg:rounded-2xl flex items-center gap-1 lg:gap-2 shadow-xl border border-white/20 text-xs sm:text-sm">
                              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                              RENT
                            </div>
                          )}
                          {product.listingType === "donate" && (
                            <div className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 backdrop-blur-sm text-white font-black rounded-xl lg:rounded-2xl flex items-center gap-1 lg:gap-2 shadow-xl border border-white/20 text-xs sm:text-sm">
                              <Gift className="w-3 h-3 lg:w-4 lg:h-4" />
                              FREE
                            </div>
                          )}
                          {product.listingType === "sell" && (
                            <div className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 backdrop-blur-sm text-white font-black rounded-xl lg:rounded-2xl flex items-center gap-1 lg:gap-2 shadow-xl border border-white/20 text-xs sm:text-sm">
                              <ShoppingCart className="w-3 h-3 lg:w-4 lg:h-4" />
                              SALE
                            </div>
                          )}
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        className={`absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all shadow-xl hover:shadow-2xl transform hover:scale-110 z-10 border border-white/20 backdrop-blur-sm ${
                          favorites.has(product.id)
                            ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                            : "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
                        }`}
                        onClick={(e) => toggleFavorite(e, product.id)}
                      >
                        <Heart
                          className={`w-4 h-4 lg:w-6 lg:h-6 transition-colors ${
                            favorites.has(product.id)
                              ? "text-white fill-white"
                              : "text-gray-600 dark:text-gray-300 hover:text-red-500"
                          }`}
                        />
                      </button>

                      {/* Quick Actions - Only visible on hover and larger screens */}
                      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-6 left-3 sm:left-4 lg:left-6 right-3 sm:right-4 lg:right-6 hidden sm:flex gap-2 lg:gap-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-10">
                        <button
                          onClick={(e) => handleChatClick(e, product)}
                          className="flex-1 px-2 sm:px-3 lg:px-4 py-2 lg:py-3 bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg lg:rounded-xl font-black hover:bg-white transition-all shadow-xl border border-white/20 text-xs sm:text-sm"
                        >
                          Chat Now
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const shareUrl = `${window.location.origin}/itemlist/product/${product.id}`
                            navigator.clipboard.writeText(shareUrl)
                          }}
                          className="px-2 sm:px-3 lg:px-4 py-2 lg:py-3 bg-white/90 backdrop-blur-sm rounded-lg lg:rounded-xl hover:bg-white transition-all shadow-xl border border-white/20"
                        >
                          <Share2 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-900" />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
                      {/* Category */}
                      <div className="mb-3 lg:mb-4">
                        <span className="inline-block px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl lg:rounded-2xl border border-indigo-200 dark:border-indigo-700 text-xs sm:text-sm">
                          {product.category || "General"}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800 dark:text-white mb-3 lg:mb-4 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-5 lg:mb-6 flex-1 leading-relaxed">
                        {expandedDescriptions.has(product.id)
                          ? product.description
                          : product.description && product.description.length > 80
                            ? `${product.description.substring(0, 80)}...`
                            : product.description}
                        {product.description && product.description.length > 80 && (
                          <button
                            onClick={(e) => toggleDescription(e, product.id)}
                            className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold text-xs sm:text-sm"
                          >
                            {expandedDescriptions.has(product.id) ? "Show Less" : "Read More"}
                          </button>
                        )}
                      </p>

                      {/* Price */}
                      <div className="mb-4 sm:mb-5 lg:mb-6">
                        {product.listingType === "donate" ? (
                          <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Free
                          </div>
                        ) : product.listingType === "rent" ? (
                          <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            ₹{product.rentAmount?.toLocaleString() || "0"}
                            <span className="text-sm sm:text-base text-gray-500 ml-1">/day</span>
                          </div>
                        ) : (
                          <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            ₹{product.price?.toLocaleString() || "0"}
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm sm:text-base truncate">
                            {userMap[product.userId] || "Unknown"}
                          </span>
                        </div>
                        {product.views && (
                          <div className="flex items-center gap-1 lg:gap-2 text-gray-500">
                            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                            <span className="text-xs lg:text-sm font-medium">{product.views}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4 sm:mb-5 lg:mb-6">
                        {product.condition && (
                          <span
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg lg:rounded-xl font-bold border-2 text-xs sm:text-sm ${
                              product.condition === "New"
                                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                                : product.condition === "Like New"
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                                  : product.condition === "Good"
                                    ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                                    : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {product.condition}
                          </span>
                        )}
                        {product.college && (
                          <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-700 rounded-lg lg:rounded-xl font-bold flex items-center gap-1 text-xs sm:text-sm">
                            <MapPin className="w-2 h-2 lg:w-3 lg:h-3" />
                            <span className="truncate max-w-20 sm:max-w-none">{product.college}</span>
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 sm:gap-3 lg:gap-4 mt-auto">
                        <button
                          className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white py-2 sm:py-3 lg:py-4 px-3 sm:px-4 lg:px-6 rounded-xl lg:rounded-2xl font-black hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] text-sm sm:text-base"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductSelect(product.id)
                          }}
                        >
                          View Details
                        </button>
                        <button
                          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl lg:rounded-2xl flex items-center justify-center hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                          onClick={(e) => handleChatClick(e, product)}
                        >
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // ========== LIST VIEW CARD ==========
                  <>
                    {/* Product Image */}
                    <div className="relative w-full sm:w-48 lg:w-64 aspect-square flex-shrink-0 rounded-2xl lg:rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 shadow-xl">
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {/* Favorite Button */}
                      <button
                        className={`absolute top-3 lg:top-4 right-3 lg:right-4 w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center transition-all shadow-lg backdrop-blur-sm border border-white/20 ${
                          favorites.has(product.id)
                            ? "bg-gradient-to-r from-red-500 to-pink-500"
                            : "bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700"
                        }`}
                        onClick={(e) => toggleFavorite(e, product.id)}
                      >
                        <Heart
                          className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors ${
                            favorites.has(product.id) ? "text-white fill-white" : "text-gray-600 dark:text-gray-300"
                          }`}
                        />
                      </button>

                      {/* Listing Type Badge */}
                      {product.listingType && (
                        <div className="absolute top-3 lg:top-4 left-3 lg:left-4">
                          {product.listingType === "rent" && (
                            <div className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 backdrop-blur-sm text-white font-black rounded-lg lg:rounded-xl flex items-center gap-1 shadow-lg border border-white/20 text-xs">
                              <Clock className="w-2 h-2 lg:w-3 lg:h-3" />
                              RENT
                            </div>
                          )}
                          {product.listingType === "donate" && (
                            <div className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 backdrop-blur-sm text-white font-black rounded-lg lg:rounded-xl flex items-center gap-1 shadow-lg border border-white/20 text-xs">
                              <Gift className="w-2 h-2 lg:w-3 lg:h-3" />
                              FREE
                            </div>
                          )}
                          {product.listingType === "sell" && (
                            <div className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 backdrop-blur-sm text-white font-black rounded-lg lg:rounded-xl flex items-center gap-1 shadow-lg border border-white/20 text-xs">
                              <ShoppingCart className="w-2 h-2 lg:w-3 lg:h-3" />
                              SALE
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between mb-3 lg:mb-4 gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                            <span className="px-2 lg:px-3 py-1 lg:py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg lg:rounded-xl border border-indigo-200 dark:border-indigo-700 text-xs sm:text-sm">
                              {product.category}
                            </span>
                          </div>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 dark:text-white mb-2 lg:mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </div>

                        <div className="text-right ml-4 lg:ml-6 flex-shrink-0">
                          {product.listingType === "donate" ? (
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                              Free
                            </div>
                          ) : product.listingType === "rent" ? (
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                              ₹{product.rentAmount?.toLocaleString() || "0"}
                              <div className="text-sm lg:text-base text-gray-500 font-medium">/day</div>
                            </div>
                          ) : (
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                              ₹{product.price?.toLocaleString() || "0"}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 lg:mb-6 line-clamp-3 text-sm sm:text-base lg:text-lg leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-4 lg:mb-6 flex-wrap gap-3">
                        <div className="flex items-center gap-4 lg:gap-6 text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                            </div>
                            <span className="font-semibold text-sm lg:text-base truncate">
                              {userMap[product.userId] || "Unknown"}
                            </span>
                          </div>
                          {product.college && (
                            <div className="hidden sm:flex items-center gap-2">
                              <MapPin className="w-4 h-4 lg:w-5 lg:h-5" />
                              <span className="font-medium text-sm lg:text-base truncate">{product.college}</span>
                            </div>
                          )}
                          {product.condition && (
                            <span
                              className={`px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg lg:rounded-xl font-bold border-2 text-xs lg:text-sm ${
                                product.condition === "New"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                                  : product.condition === "Like New"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                                    : product.condition === "Good"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
                                      : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                              }`}
                            >
                              {product.condition}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 lg:gap-4 mt-auto">
                        <button
                          className="px-6 sm:px-8 lg:px-10 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-xl lg:rounded-2xl font-black hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] text-sm sm:text-base"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductSelect(product.id)
                          }}
                        >
                          View Details
                        </button>
                        <button
                          className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl lg:rounded-2xl hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 transition-all shadow-lg hover:shadow-xl border-2 border-indigo-200 dark:border-indigo-700 flex items-center gap-2 lg:gap-3 text-sm sm:text-base"
                          onClick={(e) => handleChatClick(e, product)}
                        >
                          <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                          Chat Now
                        </button>
                        <button
                          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl lg:rounded-2xl hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 transition-all shadow-lg hover:shadow-xl border-2 border-indigo-200 dark:border-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            const shareUrl = `${window.location.origin}/itemlist/product/${product.id}`
                            navigator.clipboard.writeText(shareUrl)
                          }}
                        >
                          <Share2 className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-600 dark:text-indigo-400" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Load More Section */}
          {filteredProducts.length > 12 && (
            <div className="text-center mt-12 lg:mt-16">
              <button
                onClick={() => fetchProducts(true)}
                className="px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-2xl lg:rounded-3xl font-black hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg sm:text-xl flex items-center gap-3 mx-auto"
              >
                <RefreshCw className={`w-5 h-5 lg:w-6 lg:h-6 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Loading..." : "Load More Amazing Items"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ========== EMPTY STATE ========== */}
      {filteredProducts.length === 0 && !loading && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl rounded-2xl lg:rounded-[2rem] p-8 sm:p-12 lg:p-16 border border-indigo-200/20 dark:border-indigo-700/20 shadow-2xl lg:shadow-3xl">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-8 lg:mb-12 shadow-2xl">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-indigo-500" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-white mb-4 lg:mb-6">
              No Items Found
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed">
              {searchQuery || categoryFilter !== "All" || collegeFilter !== "All"
                ? "We couldn't find any items matching your criteria. Try adjusting your search or explore other categories."
                : "Be the pioneer! List the first amazing item in this category and start the marketplace revolution."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center">
              <button
                onClick={() => navigate("/addItem")}
                className="inline-flex items-center justify-center gap-3 lg:gap-4 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-black rounded-xl lg:rounded-2xl hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl text-base sm:text-lg"
              >
                <Zap className="w-5 h-5 lg:w-6 lg:h-6" />
                List Your Item Now
              </button>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("All")
                  setCollegeFilter("All") // Reset college filter
                  setSelectedCondition("All")
                  setSelectedListingType("All")
                }}
                className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-white/80 dark:bg-gray-700/80 text-indigo-700 dark:text-indigo-300 font-black rounded-xl lg:rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 shadow-xl border-2 border-indigo-200 dark:border-indigo-700 text-base sm:text-lg"
              >
                Explore All Items
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========== FLOATING ACTION BUTTON ========== */}
      <div className="fixed bottom-6 sm:bottom-8 right-6 sm:right-8 z-50">
        <button
          onClick={() => navigate("/addItem")}
          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-4 border-white/20 backdrop-blur-sm group"
        >
          <div className="relative">
            <Plus
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-10 lg:h-10 group-hover:rotate-90 transition-transform duration-300"
              strokeWidth={3}
            />
            <div className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
        </button>

        {/* Tooltip - Hidden on mobile */}
        <div className="absolute bottom-16 sm:bottom-20 right-0 bg-gray-900 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs sm:text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
          List your item
        </div>
      </div>

      {/* ========== BACKGROUND DECORATIONS ========== */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-br from-indigo-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gradient-to-br from-cyan-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}
