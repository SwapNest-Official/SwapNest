"use client"

import { useEffect, useRef, useState } from "react"
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  updateDoc,
  setDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore"
import { formatTimeAgo, getInitials, getAvatarColor } from "./chatUtils"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"

const db = getFirestore()

const ChatRoom = ({ chatId, currentUser, onBackClick, productLink }) => {
  const [chatInfo, setChatInfo] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  //const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [images, setImages] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  //const [productLink,setproductLink] = useState("");
  const [showMarkAsSoldModal, setShowMarkAsSoldModal] = useState(false)
  const [isProductSold, setIsProductSold] = useState(false)
  const { isDarkMode } = useTheme()

  const messagesEndRef = useRef(null)
  const scrollAreaRef = useRef(null)
  const fileInputRef = useRef(null)
  const hasMarkedAsRead = useRef(false)
  const navigate = useNavigate()

  // Mark chat as read when component mounts and when new messages arrive
  //console.log(productLink);
  useEffect(() => {
    const markChatAsRead = async (chatId, userId) => {
      try {
        const readRef = doc(db, "chats", chatId, "readStatus", userId)
        await setDoc(
          readRef,
          {
            lastReadAt: serverTimestamp(),
          },
          { merge: true },
        )
        hasMarkedAsRead.current = true
      } catch (error) {
        console.error("Error marking chat as read:", error)
      }
    }

    if (chatId && currentUser?.uid) {
      markChatAsRead(chatId, currentUser.uid)
    }
  }, [chatId, currentUser])

  // Mark as read when new messages arrive (if chat is currently open)
  useEffect(() => {
    if (messages.length > 0 && hasMarkedAsRead.current && chatId && currentUser?.uid) {
      const markAsReadDebounced = setTimeout(async () => {
        try {
          const readRef = doc(db, "chats", chatId, "readStatus", currentUser.uid)
          await setDoc(
            readRef,
            {
              lastReadAt: serverTimestamp(),
            },
            { merge: true },
          )
        } catch (error) {
          console.error("Error updating read status:", error)
        }
      }, 500) // Debounce to avoid too many writes

      return () => clearTimeout(markAsReadDebounced)
    }
  }, [messages.length, chatId, currentUser])

  useEffect(() => {
    const loadChatInfo = async () => {
      try {
        const chatRef = doc(db, "chats", chatId)
        const chatSnap = await getDoc(chatRef)
        if (chatSnap.exists()) {
          const chatData = chatSnap.data()
          console.log("ChatRoom: Loaded chat data:", chatData)
          setChatInfo(chatData)

          // Check if product is already sold
          if (chatData.productId) {
            const productRef = doc(db, "items", chatData.productId)
            const productSnap = await getDoc(productRef)
            if (productSnap.exists()) {
              const productData = productSnap.data()
              setIsProductSold(productData.sold === true || productData.status === "sold")
            }
          }
        } else {
          console.error("Chat not found")
        }
        setLoading(false)
      } catch (error) {
        console.error("Error loading chat:", error)
        setLoading(false)
      }
    }

    loadChatInfo()

    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setMessages(msgs)
      setTimeout(scrollToBottom, 100)
    })

    return () => unsubscribe()
  }, [chatId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  //console.log(productLink)
  const handleImageUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Limit to 3 images
    const filesToUpload = Array.from(files).slice(0, 3)
    setIsUploading(true)

    try {
      const uploadedImages = []

      for (const file of filesToUpload) {
        const data = new FormData()
        data.append("file", file)
        data.append("upload_preset", "CollegeFair")
        data.append("cloud_name", "db8elhbqj")

        const res = await fetch("https://api.cloudinary.com/v1_1/db8elhbqj/image/upload", {
          method: "POST",
          body: data,
        })

        const finalData = await res.json()
        uploadedImages.push({
          url: finalData.url,
          name: file.name,
          type: file.type,
        })
      }

      setImages([...images, ...uploadedImages])

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading images:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if ((input.trim() === "" && images.length === 0) || !currentUser) return

    try {
      const message = {
        senderId: currentUser.uid,
        text: input.trim(),
        timestamp: serverTimestamp(),
        images: images,
      }

      await addDoc(collection(db, "chats", chatId, "messages"), message)

      // Update last message text based on content
      let lastMessageText = input.trim()
      let lastMessageType = "text"

      if (images.length > 0 && input.trim() === "") {
        lastMessageText = `Sent ${images.length} image${images.length > 1 ? "s" : ""}`
        lastMessageType = "image"
      } else if (images.length > 0) {
        lastMessageText = `${input.trim()} [with ${images.length} image${images.length > 1 ? "s" : ""}]`
        lastMessageType = "mixed"
      }

      // Key fix: Include sender ID in chat update
      await updateLastMessage(chatId, lastMessageText, lastMessageType, currentUser.uid)

      setInput("")
      setImages([])
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const updateLastMessage = async (chatId, text, type = "text", senderId) => {
    try {
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageType: type,
        lastMessageSenderId: senderId, // Key fix: Track who sent the last message
        lastUpdated: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating last message:", error)
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "chats", chatId, "messages", messageId))
      setMessageToDelete(null)

      // If it was the last message, update the last message to the previous one
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.id === messageId) {
        const previousMessage = messages[messages.length - 2]
        if (previousMessage) {
          await updateLastMessage(
            chatId,
            previousMessage.text || "Sent an image",
            previousMessage.images?.length > 0 ? "image" : "text",
            previousMessage.senderId,
          )
        } else {
          // If there are no more messages
          await updateLastMessage(chatId, "No messages", "text", currentUser.uid)
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const markAsSold = async () => {
    try {
      // Update the product status in the products collection
      const productRef = doc(db, "items", chatInfo.productId)
      await updateDoc(productRef, {
        sold: true,
        status: "sold",
        soldAt: serverTimestamp(),
        soldBy: currentUser.uid,
      })

      // Also update the chat info to reflect the change
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        productSold: true,
        soldAt: serverTimestamp(),
      })

      // Update local state
      setIsProductSold(true)

      // Close the modal
      setShowMarkAsSoldModal(false)

      // Show success message or navigate back
      if (onBackClick) {
        setTimeout(() => {
          onBackClick()
        }, 1000) // Small delay to show success
      }
    } catch (error) {
      console.error("Error marking product as sold:", error)
      // You could add error handling here, like showing an error toast
    }
  }

  const getOtherUserName = () => {
    if (!chatInfo || !currentUser) return ""
    
    // If we already have the names in chatInfo, use them
    if (currentUser.uid === chatInfo.buyerId && chatInfo.sellerName) {
      return chatInfo.sellerName
    } else if (currentUser.uid === chatInfo.sellerId && chatInfo.buyerName) {
      return chatInfo.buyerName
    }
    
    // If names are missing, try to fetch them
    return "Loading..."
  }

  const getId = ()=>{
     if (!chatInfo || !currentUser) return ""
    return currentUser.uid === chatInfo.buyerId ? chatInfo.sellerId : chatInfo.buyerId
  }
  
  // Fetch user names if they're missing
  useEffect(() => {
    const fetchUserNames = async () => {
      if (!chatInfo || !currentUser) return
      
      try {
        let buyerName = chatInfo.buyerName
        let sellerName = chatInfo.sellerName
        
        // Fetch buyer name if missing
        if (!buyerName && chatInfo.buyerId) {
          const buyerDoc = await getDoc(doc(db, "users", chatInfo.buyerId))
          if (buyerDoc.exists()) {
            const buyerData = buyerDoc.data()
            console.log("ChatRoom: Buyer document data:", buyerData)
            buyerName = buyerData.fullName || buyerData.name || "Unknown User"
            console.log("ChatRoom: Fetched buyer name:", buyerName)
          } else {
            console.log("ChatRoom: Buyer document not found for ID:", chatInfo.buyerId)
          }
        }
        
        // Fetch seller name if missing
        if (!sellerName && chatInfo.sellerId) {
          const sellerDoc = await getDoc(doc(db, "users", chatInfo.sellerId))
          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data()
            console.log("ChatRoom: Seller document data:", sellerData)
            sellerName = sellerData.fullName || sellerData.name || "Unknown User"
            console.log("ChatRoom: Fetched seller name:", sellerName)
          } else {
            console.log("ChatRoom: Seller document not found for ID:", chatInfo.sellerId)
          }
        }
        
        // Update chatInfo with the fetched names
        if (buyerName !== chatInfo.buyerName || sellerName !== chatInfo.sellerName) {
          setChatInfo(prev => ({
            ...prev,
            buyerName,
            sellerName
          }))
        }
      } catch (error) {
        console.error("Error fetching user names:", error)
      }
    }
    
    fetchUserNames()
  }, [chatInfo, currentUser])

  const otherUserName = getOtherUserName();
  const Id  = getId();
  const avatarColor = getAvatarColor(otherUserName)

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 bg-purple-600 text-white">
          <div className="h-8 w-64 bg-white/20 animate-pulse rounded-md"></div>
        </div>
        <div className="flex-1 p-6 space-y-6">
          <div className="h-12 w-3/4 bg-gray-100 animate-pulse rounded-2xl"></div>
          <div className="h-12 w-1/2 ml-auto bg-purple-100 animate-pulse rounded-2xl"></div>
          <div className="h-12 w-2/3 bg-gray-100 animate-pulse rounded-2xl"></div>
        </div>
        <div className="p-4 border-t bg-gray-50">
          <div className="h-12 w-full bg-gray-100 animate-pulse rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                getAvatarColor(chatInfo?.otherUserName || "Unknown")
              }`}
            >
              {getInitials(chatInfo?.otherUserName || "Unknown")}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {chatInfo?.otherUserName || "Loading..."}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {chatInfo?.productName || "Product discussion"}
              </p>
            </div>
          </div>
        </div>

        {/* Product Link Button */}
        {productLink && (
          <button
            onClick={() => window.open(productLink, "_blank")}
            className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            View Product
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start the conversation</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Send a message to begin chatting</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUser?.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === currentUser?.uid
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  {message.type === "image" ? (
                    <img
                      src={message.content}
                      alt="Shared image"
                      className="max-w-full h-auto rounded cursor-pointer"
                      onClick={() => window.open(message.content, "_blank")}
                    />
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  
                  <div className={`text-xs mt-1 ${
                    message.senderId === currentUser?.uid
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                    {formatTimeAgo(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Send image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Message Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || uploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
