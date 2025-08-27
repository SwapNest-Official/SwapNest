"use client"

import { MapPin, Clock, Gift, Calendar, AlertTriangle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatTimeAgo } from "@/chatSystem/chatUtils"
import { useTheme } from "../contexts/ThemeContext"

// Component to render the description tab content
export default function DescriptionTab({ listing }) {
  const { isDarkMode } = useTheme()
  const description = listing?.description || "No description available."
  const location = listing?.location || "Unknown Location"

  // Format date for display (assuming date strings are provided)
  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  //console.log(listing.listedAt);

  return (
    <div className="space-y-6">
      {/* Donation Message */}
      {listing.listingType === "donate" && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-100 dark:border-emerald-800 overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-medium text-emerald-700 dark:text-emerald-300">Free Donation</h3>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">
              This item is being donated for free. The owner wants to give it to someone who needs it.
            </p>

            {listing?.donationReason && (
              <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-800">
                <span className="block text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  Reason for donation
                </span>
                <p className="text-sm text-emerald-800 dark:text-emerald-200 italic">"{listing.donationReason}"</p>
              </div>
            )}

            {listing?.preferredRecipient && (
              <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-800">
                <span className="block text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                  Preferred Recipient
                </span>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">{listing.preferredRecipient}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Rental Information */}
      {listing.listingType === "rent" && (
        <Card className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-100 dark:border-sky-800 overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-medium text-sky-700 dark:text-sky-300">Available for Rent</h3>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              {listing?.availableFrom && (
                <div className="flex-1 min-w-[140px]">
                  <span className="block text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold mb-1">From</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-white dark:bg-gray-800 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700">
                      {formatDate(listing.availableFrom)}
                    </Badge>
                  </div>
                </div>
              )}

              {listing?.availableTo && (
                <div className="flex-1 min-w-[140px]">
                  <span className="block text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold mb-1">To</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-white dark:bg-gray-800 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700">
                      {formatDate(listing.availableTo)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {listing?.damagePolicy && (
              <div className="mt-3 pt-3 border-t border-sky-100 dark:border-sky-800 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block text-xs uppercase tracking-wider text-sky-600 dark:text-sky-400 font-semibold mb-1">
                    Damage Policy
                  </span>
                  <p className="text-sm text-sky-800 dark:text-sky-200">{listing.damagePolicy}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Product Description */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          Description
        </h3>
        <Separator className="bg-gray-200 dark:bg-gray-700" />
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{description}</p>
      </div>

      {/* Metadata (Posted time & Location) */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span>{formatTimeAgo(listing.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-300">
          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  )
}
