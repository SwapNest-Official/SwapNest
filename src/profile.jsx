"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, collection, query, orderBy, deleteDoc } from "firebase/firestore"
import {
  Star,
  Mail,
  Phone,
  Package,
  School,
  Edit,
  Check,
  X,
  MessageCircle,
  Award,
  TrendingUp,
  Users,
  Heart,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import Navbar from "./navbar"
import { useTheme } from "./contexts/ThemeContext"
import ReviewModal from "./components/ReviewModal"
import RatingDisplay from "./components/RatingDisplay"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

const auth = getAuth()
const db = getFirestore()

export default function ProfilePage({ MyProfile }) {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(null)
  const [userId, setUserId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const { isDarkMode } = useTheme()

  const { RouteuserId } = useParams()
  const navigate = useNavigate()

  // Check if this is the current user's own profile
  const isOwnProfile = !RouteuserId || RouteuserId === userId

  // Debug profile data
  useEffect(() => {
    console.log("Profile state:", profile)
    console.log("Reviews state:", reviews)
    console.log("Current user:", currentUser)
    console.log("User ID:", userId)
    console.log("Route user ID:", RouteuserId)
  }, [profile, reviews, currentUser, userId, RouteuserId])

  // Check if current user is following this profile
  useEffect(() => {
    if (currentUser && profile && !isOwnProfile) {
      checkFollowStatus()
      loadFollowersCount()
    }
  }, [currentUser, profile, isOwnProfile])

  const checkFollowStatus = async () => {
    if (!currentUser || !profile) return
    
    try {
      const followRef = doc(db, "users", currentUser.uid, "following", profile.uid)
      const followDoc = await getDoc(followRef)
      setIsFollowing(followDoc.exists())
    } catch (error) {
      console.error("Error checking follow status:", error)
    }
  }

  const loadFollowersCount = async () => {
    if (!profile) return
    
    try {
      const followersRef = collection(db, "users", profile.uid, "followers")
      const followersSnapshot = await getDocs(followersRef)
      setFollowersCount(followersSnapshot.size)
    } catch (error) {
      console.error("Error loading followers count:", error)
    }
  }

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) return
    
    try {
      const followingRef = doc(db, "users", currentUser.uid, "following", profile.uid)
      const followerRef = doc(db, "users", profile.uid, "followers", currentUser.uid)
      
      if (isFollowing) {
        // Unfollow
        await deleteDoc(followingRef)
        await deleteDoc(followerRef)
        setIsFollowing(false)
        setFollowersCount(prev => Math.max(0, prev - 1))
        toast.success("Unfollowed successfully")
      } else {
        // Follow
        await setDoc(followingRef, {
          followedAt: new Date(),
          followedUserId: profile.uid,
          followedUserName: profile.fullName
        })
        await setDoc(followerRef, {
          followerId: currentUser.uid,
          followerName: currentUser.displayName || currentUser.email,
          followedAt: new Date()
        })
        setIsFollowing(true)
        setFollowersCount(prev => prev + 1)
        toast.success("Followed successfully")
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast.error("Failed to update follow status. Please try again.")
    }
  }

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Create FormData for image upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'CollegeFair')
      formData.append('cloud_name', 'db8elhbqj')

      // Upload to Cloudinary
      const response = await fetch('https://api.cloudinary.com/v1_1/db8elhbqj/image/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.secure_url) {
        // Update profile in Firestore
        const userDocRef = doc(db, "users", userId)
        await updateDoc(userDocRef, {
          profilePicture: data.secure_url
        })

        // Update local state
        setProfile(prev => ({
          ...prev,
          profilePicture: data.secure_url
        }))

        toast.success("Profile picture updated successfully!")
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast.error("Failed to update profile picture. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)
        setCurrentUser(user)
        const targetUserId = RouteuserId || user.uid

        try {
          const userDocRef = doc(db, "users", targetUserId)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("Raw user data from Firestore:", userData)
            console.log("User document ID:", userDoc.id)
            console.log("Target user ID:", targetUserId)

            // Fetch reviews from subcollection
            const reviewsSnapshot = await getDocs(
              query(collection(userDocRef, "reviews"), orderBy("createdAt", "desc"))
            )
            const reviewsData = reviewsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data()
            }))
            console.log("Fetched reviews:", reviewsData)
            setReviews(reviewsData)

            // Calculate average rating from fetched reviews
            const average = reviewsData.length > 0 
              ? (reviewsData.reduce((acc, review) => acc + review.rating, 0) / reviewsData.length).toFixed(1)
              : 0

            // Update profile with reviews data
            const profileWithReviews = {
              ...userData,
              uid: targetUserId, // Ensure uid is set
              reviews: reviewsData,
              averageRating: parseFloat(average),
              totalReviews: reviewsData.length,
            }
            
            console.log("User data from Firestore:", userData)
            console.log("Profile with reviews:", profileWithReviews)
            console.log("Target user ID:", targetUserId)
            console.log("Profile UID field:", profileWithReviews.uid)
            console.log("Profile reviews field:", profileWithReviews.reviews)
            console.log("Profile average rating field:", profileWithReviews.averageRating)
            console.log("Profile total reviews field:", profileWithReviews.totalReviews)
            
            setProfile(profileWithReviews)
            
            // Debug: Check if profile was set correctly
            setTimeout(() => {
              console.log("Profile state after setting:", profileWithReviews)
              console.log("Profile UID after setting:", profileWithReviews.uid)
              console.log("Profile reviews after setting:", profileWithReviews.reviews)
              console.log("Profile average rating after setting:", profileWithReviews.averageRating)
              console.log("Profile total reviews after setting:", profileWithReviews.totalReviews)
            }, 100)
          } else {
            console.warn("User doc not found")
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      } else {
        alert("Please login first before viewing anyones profile")
        navigate("/login")
        return
      }
    })

    return () => unsubscribe()
  }, [RouteuserId])

  const handleReviewSubmit = async (reviewData) => {
    if (!currentUser || !profile) {
      console.error("Missing currentUser or profile")
      return
    }

    if (!profile.uid) {
      console.error("Profile UID is missing:", profile)
      toast.error("Profile data is incomplete. Please refresh the page.")
      return
    }

    if (!reviewData.sellerId) {
      console.error("Review data missing sellerId:", reviewData)
      toast.error("Review data is incomplete. Please try again.")
      return
    }

    if (!reviewData.rating || !reviewData.review) {
      console.error("Review data missing rating or review:", reviewData)
      toast.error("Review data is incomplete. Please try again.")
      return
    }

    console.log("Submitting review:", reviewData)
    console.log("Current profile:", profile)
    console.log("Current reviews:", reviews)
    console.log("Profile UID:", profile.uid)
    console.log("Review seller ID:", reviewData.sellerId)
    console.log("Review rating:", reviewData.rating)
    console.log("Review text:", reviewData.review)

    setIsSubmittingReview(true)
    try {
      // Add review to the user's reviews subcollection
      const userDocRef = doc(db, "users", profile.uid)
      console.log("User document reference:", userDocRef.path)
      
      const reviewRef = await addDoc(collection(userDocRef, "reviews"), {
        ...reviewData,
        reviewerName: currentUser.displayName || currentUser.email,
        reviewerId: currentUser.uid,
        createdAt: new Date()
      })

      console.log("Review added with ID:", reviewRef.id)

      // Update the user's average rating and total reviews
      const newReviews = [...reviews, { id: reviewRef.id, ...reviewData, reviewerName: currentUser.displayName || currentUser.email, reviewerId: currentUser.uid, createdAt: new Date() }]
      const newAverage = (newReviews.reduce((acc, review) => acc + review.rating, 0) / newReviews.length).toFixed(1)
      
      console.log("New reviews array:", newReviews)
      console.log("New average:", newAverage)

      await updateDoc(userDocRef, {
        averageRating: parseFloat(newAverage),
        totalReviews: newReviews.length
      })

      // Update local state
      setReviews(newReviews)
      setProfile(prev => ({
        ...prev,
        averageRating: parseFloat(newAverage),
        totalReviews: newReviews.length
      }))

      // Close the modal
      setShowReviewModal(false)

      toast.success("Review submitted successfully!")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  /*Profile-Image*/
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "CollegeFair")
    data.append("cloud_name", "db8elhbqj")

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/db8elhbqj/image/upload", {
        method: "POST",
        body: data,
      })

      const finalData = await res.json()
      const imageUrl = finalData.url

      const updatedProfile = { ...profile, profileImage: imageUrl }
      setProfile(updatedProfile)
      await setDoc(doc(db, "users", userId), updatedProfile, { merge: true })
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsUploading(false)
    }
  }

  /*Rating-Submit*/
  const handleRatingSubmit = async () => {
    if (!userId || !userRating) return;


    setIsSubmittingRating(true)

    try {
      const newRating = {
        userId,
        rating: userRating,
        comment: ratingComment,
        timestamp: new Date(),
        userName: currentUser?.displayName || "Anonymous",
      }

      const targetUserId = RouteuserId
      const ratingsRef = collection(db, "users", targetUserId, "ratings")

      await addDoc(ratingsRef, newRating)

      const updatedRatings = [...profile.ratings, newRating]
      console.log(updatedRatings)
      const newAverage = calculateAverageRating(updatedRatings)

      await updateDoc(doc(db, "users", targetUserId), {
        averageRating: newAverage,
        totalRatings: updatedRatings.length,
      })

      setUserRating(0)
      setRatingComment("")
      setProfile({
        ...profile,
        averageRating: newAverage,
        totalRatings: updatedRatings.length,
      })
    } catch (error) {
      console.error("Error submitting rating:", error)
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleEditClick = () => {
    setEditedProfile({ ...profile })
    setIsEditing(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveClick = async () => {
    if (!editedProfile) return

    try {
      const userDocRef = doc(db, "users", userId)
      await updateDoc(userDocRef, editedProfile)

      // Update local state
      setProfile(prev => ({
        ...prev,
        ...editedProfile
      }))

      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile. Please try again.")
    }
  }

  const handleCancelClick = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const renderStars = (rating, interactive = false, size = "w-4 h-4") => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${size} cursor-pointer transition-all duration-200 ${
            i <= (interactive ? hoverRating || userRating : rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
          onClick={interactive ? () => setUserRating(i) : undefined}
          onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />,
      )
    }
    return stars
  }

  const canRate = !isOwnProfile && userId 

  // Loading skeleton component
  const ProfileSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        {/* Header Skeleton */}
        <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
              <div className="flex-1 min-w-0 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  // Show loading skeleton while profile is loading
  if (!profile) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
        {/* Mobile-First Header Card */}
        <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                  <AvatarImage src={profile?.profilePicture} alt="Profile" />
                  <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                    {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                {/* Edit Profile Picture Button - Only for own profile */}
                {isOwnProfile && (
                  <button
                    onClick={() => document.getElementById('profile-picture-input').click()}
                    className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Camera className="h-4 w-4 text-purple-600" />
                  </button>
                )}
                
                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {profile?.fullName || "User"}
                    </h1>
                    
                    {/* Rating Display */}
                    <div className="flex items-center gap-3 mb-3">
                      <RatingDisplay 
                        rating={profile?.averageRating || 0} 
                        reviewCount={profile?.totalReviews || 0} 
                        size="lg" 
                      />
                    </div>
                    
                    {/* User Type Badge */}
                    {profile?.userType && (
                      <Badge className="mb-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
                        {profile.userType}
                      </Badge>
                    )}
                  </div>

                  {/* Edit Profile Button - Only for own profile */}
                  {isOwnProfile && (
                    <Button
                      onClick={isEditing ? handleSaveClick : handleEditClick}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {isEditing ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </>
                      )}
                    </Button>
                  )}

                  {/* Cancel Button - Only when editing */}
                  {isOwnProfile && isEditing && (
                    <Button
                      onClick={handleCancelClick}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 ml-2"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Stats and Actions */}
          <div className="lg:col-span-1 lg:order-1 order-2 space-y-4">
            {/* Stats Cards - Always 2 Columns */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 text-center border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-xl transition-shadow">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {profile?.averageRating || "0.0"}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Average Rating</div>
              </Card>

              <Card className="p-3 sm:p-4 text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-xl transition-shadow">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300">
                  {profile?.totalReviews || 0}
                </div>
                <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">Total Reviews</div>
              </Card>
            </div>

            {/* Followers Count - For Other Users */}
            {!isOwnProfile && (
              <Card className="p-3 sm:p-4 text-center border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-xl transition-shadow">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-lg sm:text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {followersCount}
                </div>
                <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">Followers</div>
              </Card>
            )}

            {/* Action Buttons - For Other Users */}
            {!isOwnProfile && (
              <Card className="p-4 border-0 shadow-lg bg-white dark:bg-gray-800">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={isFollowing ? "default" : "outline"}
                      className={`text-xs sm:text-sm py-2 h-auto ${
                        isFollowing 
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      onClick={handleFollowToggle}
                    >
                      <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isFollowing ? "fill-white" : ""}`} />
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs sm:text-sm py-2 h-auto border-gray-300 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={(event) => {
                        const profileUrl = window.location.href
                        navigator.clipboard.writeText(profileUrl).then(() => {
                          // Show visual feedback
                          const originalContent = event.currentTarget.innerHTML
                          event.currentTarget.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!'
                          event.currentTarget.classList.add('bg-green-100', 'dark:bg-green-900/20', 'text-green-700', 'dark:text-green-300')
                          
                          setTimeout(() => {
                            event.currentTarget.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg> Share Profile'
                            event.currentTarget.classList.remove('bg-green-100', 'dark:bg-green-900/20', 'text-green-700', 'dark:text-green-300')
                          }, 2000)
                        }).catch(() => {
                          alert("Profile link: " + profileUrl)
                        })
                      }}
                      title="Copy profile link"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share Profile
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Review Button - For Other Users */}
            {!isOwnProfile && currentUser && (
              <Card className="p-4 border-0 shadow-lg bg-white dark:bg-gray-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                      Rate & Review
                    </h3>
                    <RatingDisplay 
                      rating={profile?.averageRating || 0} 
                      reviewCount={profile?.totalReviews || 0} 
                      size="sm" 
                    />
                  </div>
                  
                  <Button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-sm sm:text-base py-3 h-auto"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Write a Review
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content - Details and Reviews */}
          <div className="lg:col-span-2 lg:order-2 order-1">
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <Tabs defaultValue="details" className="w-full">
                {/* Mobile-Optimized Tab List */}
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="details" className="text-xs sm:text-sm py-2 sm:py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs sm:text-sm py-2 sm:py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                    Reviews
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="text-xs sm:text-sm py-2 sm:py-3 px-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="p-4 sm:p-6 space-y-4">
                  <div className="grid gap-4">
                    {/* Email */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1 text-gray-900 dark:text-white">Email</div>
                        {isEditing ? (
                          <Input
                            name="email"
                            value={editedProfile?.email || ""}
                            onChange={handleInputChange}
                            className="text-sm bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Enter email address"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-300 break-words">
                            {profile?.email || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <Phone className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1 text-gray-900 dark:text-white">Phone</div>
                        {isEditing ? (
                          <Input
                            name="phone"
                            value={editedProfile?.phone || ""}
                            onChange={handleInputChange}
                            className="text-sm bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-300 break-words">
                            {profile?.phone || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* College */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <School className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1 text-gray-900 dark:text-white">College</div>
                        {isEditing ? (
                          <Input
                            name="college"
                            value={editedProfile?.college || ""}
                            onChange={handleInputChange}
                            className="text-sm bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Enter college name"
                          />
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-300 break-words">
                            {profile?.college || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                      <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base mb-1 text-gray-900 dark:text-white">Bio</div>
                        {isEditing ? (
                          <Textarea
                            name="bio"
                            value={editedProfile?.bio || ""}
                            onChange={handleInputChange}
                            className="text-sm bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                            {profile?.bio || "No bio provided"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {console.log("Reviews data:", profile?.reviews)}
                    {profile?.reviews && profile?.reviews.length > 0 ? (
                      profile?.reviews.map((review, index) => (
                        <div
                          key={review.id || index}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="text-sm font-medium bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                                  {review.reviewerName?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm sm:text-base break-words text-gray-900 dark:text-white">
                                {review.reviewerName || "Anonymous"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <RatingDisplay rating={review.rating} size="sm" showCount={false} />
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm break-words leading-relaxed mb-2">
                            {review.review}
                          </p>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {review.createdAt?.toDate?.()?.toLocaleDateString() || "Recently"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Star className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {isOwnProfile ? "You haven't received any reviews yet." : "Be the first to review this user!"}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="p-4 sm:p-6">
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Activity</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      User activity will be displayed here
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          sellerId={profile?.uid || profile?.id}
          sellerName={profile?.fullName || "User"}
          currentUserId={currentUser?.uid}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
