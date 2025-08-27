"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Flag, Clock, Gift, Users, MessageCircle } from "lucide-react"
import ShareButton from "./sharebutton"
import BuyButton from "../buttonClick"
import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"
import { useTheme } from "../contexts/ThemeContext"
import { useNavigate } from "react-router-dom"

const auth = getAuth()
const db = getFirestore()

// Favorite Button Component
const FavoriteButton = ({ listing }) => {
  const [isFavorited, setIsFavorited] = useState(false)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isDarkMode } = useTheme()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
        checkFavoriteStatus(user.uid, listing.id)
      } else {
        setUserId(null)
        setIsFavorited(false)
      }
    })

    return () => unsubscribe()
  }, [listing.id])

  const checkFavoriteStatus = async (uid, productId) => {
    try {
      const favoriteRef = doc(db, "users", uid, "favorites", productId)
      const favoriteDoc = await getDoc(favoriteRef)
      setIsFavorited(favoriteDoc.exists())
    } catch (error) {
      console.error("Error checking favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!userId) {
      // Redirect to login if not authenticated
      window.location.href = "/login"
      return
    }

    setLoading(true)
    try {
      const favoriteRef = doc(db, "users", userId, "favorites", listing.id)
      
      if (isFavorited) {
        // Remove from favorites
        await deleteDoc(favoriteRef)
        setIsFavorited(false)
      } else {
        // Add to favorites
        await setDoc(favoriteRef, {
          productId: listing.id,
          title: listing.title,
          price: listing.price,
          image: listing.images?.[0] || "",
          category: listing.category,
          condition: listing.condition,
          addedAt: new Date().toISOString()
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={toggleFavorite}
      disabled={loading}
      className={`w-full border-2 transition-all duration-200 ${
        isFavorited
          ? "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400"
      }`}
    >
      <Heart 
        className={`h-4 w-4 mr-2 transition-all duration-200 ${
          isFavorited ? "fill-current" : ""
        }`} 
      />
      {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
    </Button>
  )
}

// Add Chat Button component
const ChatButton = ({ listing }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  const handleChatClick = async () => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    // Check if user is trying to chat with their own product
    if (currentUser.uid === listing?.userId) {
      alert("You cannot chat with yourself about your own product!")
      return
    }

    try {
      // Create chat document
      const newChatId = `${listing.id}_${currentUser.uid}`
      const chatRef = doc(db, "chats", newChatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) {
        // Get buyer and seller data
        const buyerRef = doc(db, "users", currentUser.uid)
        const sellerRef = doc(db, "users", listing.userId)
        
        const [buyerDoc, sellerDoc] = await Promise.all([
          getDoc(buyerRef),
          getDoc(sellerRef)
        ])
        
        const buyerData = buyerDoc.exists() ? buyerDoc.data() : { fullName: "Unknown User" }
        const sellerData = sellerDoc.exists() ? sellerDoc.data() : { fullName: "Unknown User" }
        
        console.log("RightColumn: Creating chat with:", {
          buyerName: buyerData.fullName || currentUser.displayName || "Unknown User",
          sellerName: sellerData.fullName || "Unknown User"
        })
        
        await setDoc(chatRef, {
          chatId: newChatId,
          productId: listing.id,
          productTitle: listing.title,
          buyerId: currentUser.uid,
          sellerId: listing.userId,
          buyerName: buyerData.fullName || currentUser.displayName || "Unknown User",
          sellerName: sellerData.fullName || "Unknown User",
          lastMessage: "",
          lastUpdated: new Date().toISOString(),
          productImage: listing.images?.[0] || "",
          productPrice: listing.price || 0,
          productCategory: listing.category || "General"
        })
        
        console.log("RightColumn: Chat created successfully with ID:", newChatId)
      } else {
        console.log("RightColumn: Chat already exists:", newChatId)
      }

      // Navigate to chat interface
      navigate(`/chating?chatId=${newChatId}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      alert("Failed to start chat. Please try again.")
    }
  }

  // Don't show chat button if user is viewing their own product
  if (currentUser?.uid === listing?.userId) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleChatClick}
      disabled={loading}
      className="w-full border-2 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {loading ? "Starting Chat..." : "Chat with Seller"}
    </Button>
  )
}

export default function RightColumn({ listing, purchaseType = "buy" }) {
  const { isDarkMode } = useTheme()
  // If the item is a donation, force the purchase type to "donate"
  const effectivePurchaseType = listing?.isDonation ? "donate" : purchaseType

  return (
    <>
      <div>
        <div className="sticky top-20 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 p-6 shadow-lg space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{listing?.title}</h1>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{listing?.category}</Badge>
            <Badge variant="outline" className="text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600">
              {listing?.condition}
            </Badge>
            {listing.listingType == "rent" && listing.listingType != "donate" && (
              <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <Clock className="h-3 w-3 mr-1" />
                Rentable
              </Badge>
            )}
            {listing.listingType === "donate" && (
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <Gift className="h-3 w-3 mr-1" />
                Free
              </Badge>
            )}
          </div>

          

          {/* Price */}
          {listing.listingType === "donate" ? (
            <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">Free</div>
          ) : listing.listingType != "donate" && listing.listingType === "rent" ? (
            <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              ₹{listing?.rentAmount || Math.round((listing?.price || 0) * 0.1)}/day
            </div>
          ) : (
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">₹{listing?.price || 0}</div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-4">
            {<BuyButton listing={listing} />}
            
            {/* Chat Button */}
            <ChatButton listing={listing} />
            
            {/* Favorite Button */}
            <FavoriteButton listing={listing} />
          </div>

          {/* Share & Report */}
          <div className="flex justify-between text-sm pt-4 border-t border-gray-200 dark:border-gray-700">
            <ShareButton 
              profileName={listing?.title || "Product"}
              profileUrl={window.location.href}
            />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
