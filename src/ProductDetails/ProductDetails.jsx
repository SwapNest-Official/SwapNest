"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/config"
import { ArrowLeft, Clock, Gift, Maximize2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SellerDetails from "./SellerDetailsTab"
import DescriptionTab from "./DescrptionTab"
import DetailsTab from "./DetailsTab"
import RightColumn from "./RightColumn"
import RentalOptions from "../rentaloption"
import { useParams, useNavigate } from "react-router-dom"
import ImageViewer from "./ImageViewer"
import { useTheme } from "../contexts/ThemeContext"

/**
 * Main Listing Page Component
 * Displays product details with enhanced image viewer
 */
export default function ListingPage() {
  // ==================== STATE MANAGEMENT ====================

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [purchaseType, setPurchaseType] = useState("buy")
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const { isDarkMode } = useTheme()

  // ==================== ROUTING ====================

  const { productId } = useParams()
  const navigate = useNavigate()

  // ==================== DATA FETCHING ====================

  /**
   * Fetch product data from Firestore
   */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        const productRef = doc(db, "items", productId)
        const productSnap = await getDoc(productRef)

        if (productSnap.exists()) {
          const productData = productSnap.data()
          setListing({
            ...productData,
            id: productId,
          })

          // Set default purchase type for donations
          if (productData.isDonation) {
            setPurchaseType("donate")
          }
        } else {
          console.error("No such product found!")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  /**
   * Set default selected image when listing loads
   */
  useEffect(() => {
    if (listing?.images?.length > 0) {
      setSelectedImage(listing.images[0])
      setSelectedImageIndex(0)
    }
  }, [listing])

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle thumbnail image click
   */
  const handleImageClick = (image, index) => {
    setSelectedImage(image)
    setSelectedImageIndex(index)
  }

  /**
   * Handle main image click to open viewer
   */
  const handleMainImageClick = () => {
    setIsImageViewerOpen(true)
  }

  // ==================== LOADING STATES ====================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-red-500 dark:text-red-400">Product not found!</p>
      </div>
    )
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <main className="flex-grow">
        <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 lg:px-6">
          {/* Back navigation */}
          <Link
            to="/itemlist"
            className="inline-flex items-center text-sm mb-4 sm:mb-6 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to listings
          </Link>

          {/* Status badges */}
          <div className="mb-4 sm:mb-6">
            {listing.listingType == "donate" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 mr-2">
                <Gift className="h-4 w-4 mr-1" />
                Free Donation
              </span>
            )}
            {listing.listingType == "rent" && listing.listingType != "donate" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                <Clock className="h-4 w-4 mr-1" />
                Available for Rent
              </span>
            )}
          </div>

          {/* Main content grid - Maintaining original order on all screen sizes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left column: Images and tabs - Always first in order */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8 w-full">
              {/* Image section */}
              <div className="space-y-3 sm:space-y-4">
                {/* Main image with click to zoom */}
                <div className="relative group">
                  <div
                    className="aspect-video overflow-hidden rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-blue-400 dark:hover:border-blue-500"
                    onClick={handleMainImageClick}
                  >
                    <img
                      src={selectedImage || "/placeholder.svg?height=600&width=800"}
                      alt={listing?.title || "Product"}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Zoom overlay hint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Maximize2 className="h-4 w-4" />
                        <span className="text-sm font-medium">View Full Size</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {listing?.images?.map((image, index) => (
                    <div
                      key={index}
                      className={`aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedImage === image
                          ? "ring-2 ring-blue-500 ring-offset-2 scale-105 border-blue-400 dark:border-blue-500 shadow-lg"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md"
                      }`}
                      onClick={() => handleImageClick(image, index)}
                    >
                      <img
                        src={image || "/placeholder.svg?height=100&width=100"}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>

              

              {/* Information tabs */}
              <div className="space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Product Information</h3>
                </div>
                                 <Tabs
                   defaultValue="description"
                   className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                 >
                                     <TabsList className="grid w-full grid-cols-3 gap-2 my-3">
                    <TabsTrigger
                      value="description"
                      className="text-sm sm:text-base font-medium py-3 sm:py-4 px-4 rounded-lg transition-all duration-300 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-800 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-300 dark:data-[state=active]:border-purple-600 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      Description
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      className="text-sm sm:text-base font-medium py-3 sm:py-4 px-4 rounded-lg transition-all duration-300 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-800 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-300 dark:data-[state=active]:border-purple-600 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="seller"
                      className="text-sm sm:text-base font-medium py-3 sm:py-4 px-4 rounded-lg transition-all duration-300 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-800 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-purple-300 dark:data-[state=active]:border-purple-600 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      Seller
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="pt-6 sm:pt-8 animate-in fade-in-0 slide-in-from-top-2 duration-300 w-full">
                    <DescriptionTab listing={listing} />
                  </TabsContent>

                  <TabsContent value="details" className="pt-6 sm:pt-8 animate-in fade-in-0 slide-in-from-top-2 duration-300 w-full">
                    <DetailsTab listing={listing} />
                  </TabsContent>

                  <TabsContent value="seller" className="pt-6 sm:pt-8 animate-in fade-in-0 slide-in-from-top-2 duration-300 w-full">
                    <SellerDetails listing={listing} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right column: Price and actions - Always maintains the same order */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <RightColumn listing={listing} purchaseType={purchaseType} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Image Viewer Modal */}
      <ImageViewer
        images={listing?.images || []}
        initialIndex={selectedImageIndex}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </div>
  )
}
