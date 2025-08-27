"use client"

import { db } from "../firebase/config"
import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { Star, Mail, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"

// This component is used to display seller details at productDetails Page
export default function SellerDetails({ listing }) {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  const [seller, setSeller] = useState(null)
  useEffect(() => {
    const fetchSeller = async () => {
      if (!listing?.userId) return

      try {
        const userRef = doc(db, "users", listing.userId)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          setSeller(userSnap.data())
        } else {
          console.error("No such seller found!")
        }
      } catch (error) {
        console.error("Error fetching seller info:", error)
      }
    }

    if (listing?.userId) {
      fetchSeller()
    }
  }, [listing?.userId])

  const sellerDetails = {
    name: seller?.fullName || "Unknown Seller",
    avatar: seller?.profileImage || "https://res.cloudinary.com/db8elhbqj/image/upload/v1750560498/nyt9v8clbdk6j4uo3j1k.png",
    rating: seller?.averageRating || 0,
    memberSince: seller?.createdAt?.toDate().toLocaleDateString() || "Unknown",
    responseRate: seller?.email || "Unknown",
    responseTime: seller?.phone || "Unknown",
  }

  function handleClick() {
    if (listing?.userId && listing.userId !== null) {
      navigate(`/profile/${listing.userId}`)
    }
  }

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      {/* Header with gradient background */}
      <div className="w-full h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

      <div className="p-4 sm:p-6">
        {/* Seller info - Responsive layout */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Seller Avatar - Centered on mobile, left-aligned on larger screens */}
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md transform transition-transform duration-300 hover:scale-105">
            <img
              src={sellerDetails.avatar || "/placeholder.svg"}
              alt={sellerDetails.name || "Seller"}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Seller Information - Full width on mobile */}
          <div className="flex-1 w-full text-center sm:text-left">
            {/* Seller Name and Rating */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sellerDetails.name}</h3>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < Math.floor(sellerDetails.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm ml-1 text-gray-600 dark:text-gray-400">{Number(sellerDetails.rating)?.toFixed(1) || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Additional Details - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 w-full">
          <div className="flex items-start p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 min-h-[60px]">
            <Calendar className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Member since</p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold break-words">{sellerDetails.memberSince || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-start p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 min-h-[60px]">
            <Mail className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">E-Mail</p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold break-all">{sellerDetails.responseRate || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-start p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 min-h-[60px]">
            <Phone className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone Number</p>
              <p className="text-sm text-gray-900 dark:text-white font-semibold break-all">{sellerDetails.responseTime || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Contact Button - Full width on mobile, auto width on larger screens */}
        <div className="mt-5 flex justify-center sm:justify-start">
          <Button
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 px-5 py-2 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
            onClick={handleClick}
          >
            View Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
