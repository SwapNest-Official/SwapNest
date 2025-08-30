import { useState, useEffect } from "react"
import { db, auth } from "../src/firebase/config"
import { collection, addDoc, serverTimestamp,updateDoc, doc, increment} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload, ImageIcon, X, Plus, Calendar, Gift, Tag, AlertCircle, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner";
import Navbar from "./navbar";
import { useTheme } from "./contexts/ThemeContext";

export default function ListingPage() {
  const [listingType, setListingType] = useState("sell")
  const [images, setImages] = useState([null, null, null, null, null])
  const [customDetails, setCustomDetails] = useState([{ key: "", value: "" }])
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedSections, setLoadedSections] = useState([]);
  const [uploadingImages, setUploadingImages] = useState([false, false, false, false, false]);
  const [successImages, setSuccessImages] = useState([false, false, false, false, false]);
  const { isDarkMode } = useTheme();
  
  // Base form data for all listing types
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    location: "",
    college: "",
    tags: "",
    contactPreference: "",
    // Rent specific fields
    rentPeriod: "day",
    rentAmount: "",
    securityDeposit: "",
    damagePolicy: "",
    availableFrom: "",
    availableTo: "",
    // Donate specific fields
    donationReason: "",
    preferredRecipient: "",
    pickupInstructions: "",
    createdAt: serverTimestamp(),
  })

  useEffect(() => {
    setIsVisible(true);
    // Staggered loading of sections
    const sections = [0, 1, 2, 3, 4];
    sections.forEach((section, index) => {
      setTimeout(() => {
        setLoadedSections(prev => [...prev, section]);
      }, index * 200);
    });
  }, []);

   //console.log(formData);
  // Add this helper function at the top of your component, after the useState declarations
  const RequiredLabel = ({ htmlFor, children }) => (
    <Label htmlFor={htmlFor} className="flex items-center gap-1 text-gray-900 dark:text-white">
      {children} <span className="text-red-500">*</span>
    </Label>
  )
   console.log(formData);
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
   
  }

  const fileUpload = async (event, index) => {
    const file = event.target.files[0]
    if (!file) {
      return
    }

    // Set uploading state for this specific image
    const newUploadingImages = [...uploadingImages]
    newUploadingImages[index] = true
    setUploadingImages(newUploadingImages)

    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", "CollegeFair")
    data.append("cloud_name", "db8elhbqj")

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/db8elhbqj/image/upload", {
        method: "POST",
        body: data,
      })

      if (!res.ok) {
        throw new Error("Failed to upload image")
      }

      const finalData = await res.json()
      const newImageUrls = [...images]
      newImageUrls[index] = finalData.url

      setImages(newImageUrls)
      
      // Show success animation briefly
      const newSuccessImages = [...successImages]
      newSuccessImages[index] = true
      setSuccessImages(newSuccessImages)
      
      // Hide success animation after 2 seconds
      setTimeout(() => {
        const resetSuccessImages = [...successImages]
        resetSuccessImages[index] = false
        setSuccessImages(resetSuccessImages)
      }, 2000)
      
    } catch (error) {
      console.error("Error uploading image:", error)
      // Show error toast or alert
      toast.error("Failed to upload image. Please try again.")
    } finally {
      // Reset uploading state for this image
      const resetUploadingImages = [...uploadingImages]
      resetUploadingImages[index] = false
      setUploadingImages(resetUploadingImages)
    }
  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Remove an image
  const removeImage = (index) => {
    const newImages = [...images]
    newImages[index] = null
    setImages(newImages)
  }

  // Add a new key-value pair
  const addDetail = () => {
    setCustomDetails([...customDetails, { key: "", value: "" }])
  }

  // Handle changes in key-value pairs
  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...customDetails]
    updatedDetails[index][field] = value
    setCustomDetails(updatedDetails)
  }

  // Remove a key-value pair
  const removeDetail = (index) => {
    const updatedDetails = [...customDetails]
    updatedDetails.splice(index, 1)
    setCustomDetails(updatedDetails)
  }

  // Check if all required fields are completed
  const isFormComplete = () => {
    // Basic Info validation
    if (!formData.title.trim() || !formData.category || !formData.description.trim() || !formData.college.trim() ||
        !formData.availableFrom || !formData.availableTo) {
      return false
    }
    
    // Details validation
    if (!formData.condition || !formData.location.trim() || !formData.tags.trim() || !formData.contactPreference) {
      return false
    }
    
    // Images validation
    if (images.filter(Boolean).length === 0) {
      return false
    }
    
    // Listing type specific validation
    if (listingType === "sell") {
      if (!formData.price || formData.price <= 0) {
        return false
      }
    }
    
    if (listingType === "rent") {
      if (!formData.rentAmount || formData.rentAmount <= 0 || !formData.rentPeriod || 
          !formData.securityDeposit || formData.securityDeposit <= 0 || !formData.damagePolicy.trim()) {
        return false
      }
    }
    
    if (listingType === "donate") {
      if (!formData.donationReason.trim() || !formData.preferredRecipient || !formData.pickupInstructions.trim()) {
        return false
      }
    }
    
    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Comprehensive validation for all required fields
    const validationErrors = []
    
    // Basic Info validation
    if (!formData.title.trim()) {
      validationErrors.push("Title is required")
    }
    if (!formData.category) {
      validationErrors.push("Category is required")
    }
    if (!formData.description.trim()) {
      validationErrors.push("Description is required")
    }
    if (!formData.college.trim()) {
      validationErrors.push("College name is required")
    }
    if (!formData.availableFrom) {
      validationErrors.push("Available from date is required")
    }
    if (!formData.availableTo) {
      validationErrors.push("Available until date is required")
    }
    
    // Validate dates make sense
    if (formData.availableFrom && formData.availableTo) {
      const fromDate = new Date(formData.availableFrom)
      const toDate = new Date(formData.availableTo)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (fromDate < today) {
        validationErrors.push("Available from date cannot be in the past")
      }
      if (toDate <= fromDate) {
        validationErrors.push("Available until date must be after available from date")
      }
    }
    
    // Details validation
    if (!formData.condition) {
      validationErrors.push("Condition is required")
    }
    if (!formData.location.trim()) {
      validationErrors.push("Location is required")
    }
    if (!formData.tags.trim()) {
      validationErrors.push("Tags are required")
    }
    if (!formData.contactPreference) {
      validationErrors.push("Contact preference is required")
    }
    
    // Images validation
    const uploadedImages = images.filter(Boolean)
    if (uploadedImages.length === 0) {
      validationErrors.push("At least one image is required")
    }
    
    // Listing type specific validation
    if (listingType === "sell") {
      if (!formData.price || formData.price <= 0) {
        validationErrors.push("Valid price is required for selling")
      }
    }
    
    if (listingType === "rent") {
      if (!formData.rentAmount || formData.rentAmount <= 0) {
        validationErrors.push("Valid rent amount is required")
      }
      if (!formData.rentPeriod) {
        validationErrors.push("Rent period is required")
      }
      if (!formData.securityDeposit || formData.securityDeposit <= 0) {
        validationErrors.push("Valid security deposit is required")
      }
      if (!formData.damagePolicy.trim()) {
        validationErrors.push("Damage policy is required")
      }
    }
    
    if (listingType === "donate") {
      if (!formData.donationReason.trim()) {
        validationErrors.push("Reason for donation is required")
      }
      if (!formData.preferredRecipient) {
        validationErrors.push("Preferred recipient is required")
      }
      if (!formData.pickupInstructions.trim()) {
        validationErrors.push("Pickup instructions are required")
      }
    }
    
    // Show all validation errors if any
    if (validationErrors.length > 0) {
      alert("Please fix the following errors:\n\n" + validationErrors.join("\n"))
      return
    }
    
    setLoading(true);
    // Convert customDetails array into a map
    const detailsMap = customDetails.reduce((acc, detail) => {
      if (detail.key && detail.value) {
        acc[detail.key] = detail.value
      }
      return acc
    }, {})

    try {
      await addDoc(collection(db, "items"), {
        ...formData,
        listingType, // Add the listing type
        price: listingType === "sell" ? Number.parseFloat(formData.price) : null,
        rentAmount: listingType === "rent" ? Number.parseFloat(formData.rentAmount) : null,
        securityDeposit: listingType === "rent" ? Number.parseFloat(formData.securityDeposit) : null,
        images: uploadedImages,
        details: detailsMap,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
      })

      alert("Your listing has been created successfully!");
      const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      itemsSold: increment(1),
    });
    } catch (error) {
    console.log(error);
    alert("Failed to create listing. Please try again.");
    
    } finally{
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500`}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            List Your Item
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sell, rent, or donate items to your campus community. Reach thousands of students looking for great deals!
          </p>
        </div>

        {/* Listing Type Selection */}
        <div className={`mb-8 transition-all duration-1000 delay-200 ${loadedSections.includes(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Choose Listing Type</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Select how you want to list your item
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={listingType}
                onValueChange={setListingType}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sell" id="sell" />
                  <Label htmlFor="sell" className="text-gray-900 dark:text-white cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-blue-600" />
                      Sell
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rent" id="rent" />
                  <Label htmlFor="rent" className="text-gray-900 dark:text-white cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Rent
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="donate" id="donate" />
                  <Label htmlFor="donate" className="text-gray-900 dark:text-white cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-emerald-600" />
                      Donate
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <div className={`transition-all duration-1000 delay-400 ${loadedSections.includes(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Item Details</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Provide comprehensive information about your item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700">
                  <TabsTrigger value="basic" className="text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Basic Info</TabsTrigger>
                  <TabsTrigger value="details" className="text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Details</TabsTrigger>
                  <TabsTrigger value="images" className="text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Images</TabsTrigger>
                  <TabsTrigger value="pricing" className="text-gray-900 dark:text-white data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">Pricing</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="title">Title</RequiredLabel>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter item title"
                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="category">Category</RequiredLabel>
                      <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="description">Description</RequiredLabel>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your item in detail..."
                      rows={4}
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="college">College Name</RequiredLabel>
                    <Input
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="e.g., IIIT Allahabad, IIT Bombay, Delhi University"
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="availableFrom">Available From</RequiredLabel>
                      <Input
                        id="availableFrom"
                        name="availableFrom"
                        type="date"
                        value={formData.availableFrom}
                        onChange={handleChange}
                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="availableTo">Available Until</RequiredLabel>
                      <Input
                        id="availableTo"
                        name="availableTo"
                        type="date"
                        value={formData.availableTo}
                        onChange={handleChange}
                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="condition">Condition</RequiredLabel>
                      <Select value={formData.condition} onValueChange={(value) => handleSelectChange("condition", value)}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                                      <div className="space-y-2">
                    <RequiredLabel htmlFor="location">Location</RequiredLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter pickup location"
                        className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="tags">Tags</RequiredLabel>
                    <Input
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="Enter tags separated by commas (e.g., electronics, laptop, gaming)"
                      className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <RequiredLabel htmlFor="contactPreference">Contact Preference</RequiredLabel>
                    <Select value={formData.contactPreference} onValueChange={(value) => handleSelectChange("contactPreference", value)}>
                      <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select contact preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">In-app Chat</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="any">Any Method</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  </div>
                </TabsContent>

                {/* Images Tab */}
                <TabsContent value="images" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <RequiredLabel htmlFor="images">Product Images</RequiredLabel>
                      <span className="text-sm text-gray-500 dark:text-gray-400">(At least 1 required)</span>
                    </div>
                    
                    {/* Validation message */}
                    {images.filter(Boolean).length === 0 && (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Please upload at least one image to continue</span>
                      </div>
                    )}
                    
                    {/* Success message when images are uploaded */}
                    {images.filter(Boolean).length > 0 && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                        <span>✓ {images.filter(Boolean).length} image{images.filter(Boolean).length > 1 ? 's' : ''} uploaded</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                                                  <label
                            htmlFor={`image-${index}`}
                            className={`block w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                              uploadingImages[index]
                                ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 scale-95"
                                : successImages[index]
                                  ? "border-green-400 bg-green-100 dark:bg-green-900/30 scale-105 shadow-lg"
                                  : image
                                    ? "border-green-300 bg-green-50 dark:bg-green-900/20 hover:scale-105 hover:shadow-md"
                                    : index === 0 
                                      ? "border-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:scale-105 hover:shadow-md" 
                                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105 hover:shadow-md"
                            }`}
                          >
                          {uploadingImages[index] ? (
                            <div className="flex flex-col items-center justify-center h-full text-blue-600 dark:text-blue-400">
                              <div className="relative mb-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800"></div>
                              </div>
                              <span className="text-xs font-medium mb-2 animate-pulse">Uploading...</span>
                              <div className="w-16 h-1 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          ) : successImages[index] ? (
                            <div className="flex flex-col items-center justify-center h-full text-green-600 dark:text-green-400">
                              <div className="relative mb-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                              <span className="text-xs font-medium">Uploaded!</span>
                            </div>
                          ) : image ? (
                            <div className="relative w-full h-full animate-in fade-in duration-300">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newImages = [...images];
                                  newImages[index] = null;
                                  setImages(newImages);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                              <ImageIcon className="h-8 w-8 mb-2" />
                              <span className="text-xs">
                                {index === 0 ? "Required" : "Optional"}
                              </span>
                            </div>
                          )}
                        </label>
                        <input
                          id={`image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => fileUpload(e, index)}
                          disabled={uploadingImages[index]}
                          className="hidden"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Pricing Tab */}
                <TabsContent value="pricing" className="space-y-4">
                  {listingType === "sell" && (
                    <div className="space-y-2">
                      <RequiredLabel htmlFor="price">Price (₹)</RequiredLabel>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  )}

                  {listingType === "rent" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="rentAmount">Rent Amount (₹)</RequiredLabel>
                          <Input
                            id="rentAmount"
                            name="rentAmount"
                            type="number"
                            value={formData.rentAmount}
                            onChange={handleChange}
                            placeholder="Enter rent amount"
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="rentPeriod">Rent Period</RequiredLabel>
                          <Select value={formData.rentPeriod} onValueChange={(value) => handleSelectChange("rentPeriod", value)}>
                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Per Day</SelectItem>
                              <SelectItem value="week">Per Week</SelectItem>
                              <SelectItem value="month">Per Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="securityDeposit">Security Deposit (₹)</RequiredLabel>
                          <Input
                            id="securityDeposit"
                            name="securityDeposit"
                            type="number"
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            placeholder="Enter security deposit"
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="damagePolicy">Damage Policy</RequiredLabel>
                          <Textarea
                            id="damagePolicy"
                            name="damagePolicy"
                            value={formData.damagePolicy}
                            onChange={handleChange}
                            placeholder="Explain your damage policy..."
                            rows={3}
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {listingType === "donate" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <RequiredLabel htmlFor="donationReason">Reason for Donation</RequiredLabel>
                        <Textarea
                          id="donationReason"
                          name="donationReason"
                          value={formData.donationReason}
                          onChange={handleChange}
                          placeholder="Why are you donating this item?"
                          rows={3}
                          className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="preferredRecipient">Preferred Recipient</RequiredLabel>
                          <Select value={formData.preferredRecipient} onValueChange={(value) => handleSelectChange("preferredRecipient", value)}>
                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                              <SelectValue placeholder="Select preferred recipient" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="students">Students</SelectItem>
                              <SelectItem value="faculty">Faculty</SelectItem>
                              <SelectItem value="anyone">Anyone</SelectItem>
                              <SelectItem value="charity">Charity Organization</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <RequiredLabel htmlFor="pickupInstructions">Pickup Instructions</RequiredLabel>
                          <Textarea
                            id="pickupInstructions"
                            name="pickupInstructions"
                            value={formData.pickupInstructions}
                            onChange={handleChange}
                            placeholder="How should recipients pick up the item?"
                            rows={3}
                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

                {/* Submit Button */}
        <div className={`mt-8 text-center transition-all duration-1000 delay-600 ${loadedSections.includes(4) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormComplete()}
            className={`px-8 py-4 font-semibold rounded-xl shadow-lg transition-all transform text-lg ${
              !isFormComplete()
                ? 'bg-gray-400 cursor-not-allowed transform-none'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-1'
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Listing...
              </div>
            ) : !isFormComplete() ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Please complete all required fields
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Create Listing
              </div>
            )}
          </Button>
          
          {/* Help text */}
          {!isFormComplete() && (
            <div className="mt-3 text-sm text-amber-600 dark:text-amber-400 space-y-1">
              <p>All sections must be completed before submitting:</p>
              <ul className="text-left max-w-md mx-auto">
                {!formData.title.trim() && <li>• Title is required</li>}
                {!formData.category && <li>• Category is required</li>}
                {!formData.description.trim() && <li>• Description is required</li>}
                {!formData.college.trim() && <li>• College name is required</li>}
                {!formData.availableFrom && <li>• Available from date is required</li>}
                {!formData.availableTo && <li>• Available until date is required</li>}
                {!formData.condition && <li>• Condition is required</li>}
                {!formData.location.trim() && <li>• Location is required</li>}
                {!formData.tags.trim() && <li>• Tags are required</li>}
                {!formData.contactPreference && <li>• Contact preference is required</li>}
                {images.filter(Boolean).length === 0 && <li>• At least one image is required</li>}
                {listingType === "sell" && (!formData.price || formData.price <= 0) && <li>• Valid price is required for selling</li>}
                {listingType === "rent" && (!formData.rentAmount || formData.rentAmount <= 0) && <li>• Valid rent amount is required</li>}
                {listingType === "rent" && (!formData.securityDeposit || formData.securityDeposit <= 0) && <li>• Valid security deposit is required</li>}
                {listingType === "rent" && !formData.damagePolicy.trim() && <li>• Damage policy is required</li>}
                {listingType === "donate" && !formData.donationReason.trim() && <li>• Reason for donation is required</li>}
                {listingType === "donate" && !formData.preferredRecipient && <li>• Preferred recipient is required</li>}
                {listingType === "donate" && !formData.pickupInstructions.trim() && <li>• Pickup instructions are required</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
