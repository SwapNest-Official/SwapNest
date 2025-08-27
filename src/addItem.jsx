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
  const { isDarkMode } = useTheme();
  
  // Base form data for all listing types
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    price: "",
    description: "",
    location: "",
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
    } catch (error) {
      console.error("Error uploading image:", error)
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
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
        images: images.filter(Boolean),
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
                  </div>
                </TabsContent>

                {/* Images Tab */}
                <TabsContent value="images" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <label
                          htmlFor={`image-${index}`}
                          className={`block w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            image
                              ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}
                        >
                          {image ? (
                            <div className="relative w-full h-full">
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
                              <span className="text-xs">Add Image</span>
                            </div>
                          )}
                        </label>
                        <input
                          id={`image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => fileUpload(e, index)}
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
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Listing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Create Listing
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
