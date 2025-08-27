"use client"

import { useState, useEffect } from "react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, onSnapshot, deleteDoc, orderBy, updateDoc } from "firebase/firestore"
import { formatTimeAgo, getInitials, getAvatarColor } from "./chatUtils"
import { useNavigate } from "react-router-dom"
import { Search, MessageCircle, Trash2, ArrowLeft } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"

const db = getFirestore()

const ChatList = ({ currentUser, selectedChatId, onChatSelect }) => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingChatId, setDeletingChatId] = useState(null)
  const { isDarkMode } = useTheme()

  // Function to update chat with proper user names
  const updateChatWithUserNames = async (chat) => {
    try {
      let updatedChat = { ...chat }
      let needsUpdate = false

      // If buyer name is missing, fetch it
      if (chat.buyerId && !chat.buyerName) {
        const buyerDoc = await getDoc(doc(db, "users", chat.buyerId))
        if (buyerDoc.exists()) {
          const buyerData = buyerDoc.data()
          updatedChat.buyerName = buyerData.fullName || buyerData.name || "Unknown User"
          needsUpdate = true
          console.log(`ChatList: Updated buyer name for chat ${chat.id}:`, updatedChat.buyerName)
        }
      }

      // If seller name is missing, fetch it
      if (chat.sellerId && !chat.sellerName) {
        const sellerDoc = await getDoc(doc(db, "users", chat.sellerId))
        if (sellerDoc.exists()) {
          const sellerData = sellerDoc.data()
          updatedChat.sellerName = sellerData.fullName || sellerData.name || "Unknown User"
          needsUpdate = true
          console.log(`ChatList: Updated seller name for chat ${chat.id}:`, updatedChat.sellerName)
        }
      }

      // Update the chat document if names were fetched
      if (needsUpdate) {
        const chatRef = doc(db, "chats", chat.id)
        await updateDoc(chatRef, {
          buyerName: updatedChat.buyerName,
          sellerName: updatedChat.sellerName
        })
        console.log(`ChatList: Updated chat ${chat.id} with user names`)
      }

      return updatedChat
    } catch (error) {
      console.error(`ChatList: Error updating chat ${chat.id} with user names:`, error)
      return chat
    }
  }

  // Load user's chats in real-time
  useEffect(() => {
    if (!currentUser?.uid) {
      console.log("ChatList: No current user, skipping chat loading")
      setLoading(false)
      return
    }

    console.log("ChatList: Loading chats for user:", currentUser.uid)
    setLoading(true)
    
    const chatsRef = collection(db, "chats")
    
    // Query for chats where user is buyer
    const buyerQuery = query(
      chatsRef,
      where("buyerId", "==", currentUser.uid)
    )
    
    // Query for chats where user is seller
    const sellerQuery = query(
      chatsRef,
      where("sellerId", "==", currentUser.uid)
    )

    const unsubscribe1 = onSnapshot(buyerQuery, async (snapshot) => {
      console.log("ChatList: Buyer chats snapshot:", snapshot.docs.length, "chats")
      const buyerChats = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatData = { id: doc.id, ...doc.data() }
          
          // Update chat with proper user names
          const updatedChat = await updateChatWithUserNames(chatData)
          
          // Fetch seller name for buyer chats if still missing
          if (updatedChat.sellerId && !updatedChat.sellerName) {
            try {
              const sellerDoc = await getDoc(doc(db, "users", updatedChat.sellerId))
              if (sellerDoc.exists()) {
                const sellerData = sellerDoc.data()
                updatedChat.sellerName = sellerData.fullName || sellerData.name || "Unknown User"
                console.log(`ChatList: Fetched seller name for chat ${doc.id}:`, updatedChat.sellerName)
              }
            } catch (error) {
              console.error(`ChatList: Error fetching seller name for chat ${doc.id}:`, error)
              updatedChat.sellerName = "Unknown User"
            }
          }
          
          return updatedChat
        })
      )
      console.log("ChatList: Buyer chats with names:", buyerChats)
      
      // Update chats with buyer chats
      setChats(prevChats => {
        const nonBuyerChats = prevChats.filter(chat => chat.buyerId !== currentUser.uid)
        return [...nonBuyerChats, ...buyerChats]
      })
      setLoading(false)
    }, (error) => {
      console.error("ChatList: Error loading buyer chats:", error)
      setLoading(false)
    })

    const unsubscribe2 = onSnapshot(sellerQuery, async (snapshot) => {
      console.log("ChatList: Seller chats snapshot:", snapshot.docs.length, "chats")
      const sellerChats = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const chatData = { id: doc.id, ...doc.data() }
          
          // Update chat with proper user names
          const updatedChat = await updateChatWithUserNames(chatData)
          
          // Fetch buyer name for seller chats if still missing
          if (updatedChat.buyerId && !updatedChat.buyerName) {
            try {
              const buyerDoc = await getDoc(doc(db, "users", updatedChat.buyerId))
              if (buyerDoc.exists()) {
                const buyerData = buyerDoc.data()
                updatedChat.buyerName = buyerData.fullName || buyerData.name || "Unknown User"
                console.log(`ChatList: Fetched buyer name for chat ${doc.id}:`, updatedChat.buyerName)
              }
            } catch (error) {
              console.error(`ChatList: Error fetching buyer name for chat ${doc.id}:`, error)
              updatedChat.buyerName = "Unknown User"
            }
          }
          
          return updatedChat
        })
      )
      console.log("ChatList: Seller chats with names:", sellerChats)
      
      // Update chats with seller chats
      setChats(prevChats => {
        const nonSellerChats = prevChats.filter(chat => chat.sellerId !== currentUser.uid)
        return [...nonSellerChats, ...sellerChats]
      })
      setLoading(false)
    }, (error) => {
      console.error("ChatList: Error loading seller chats:", error)
      setLoading(false)
    })

    return () => {
      unsubscribe1()
      unsubscribe2()
    }
  }, [currentUser])

  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      setDeletingChatId(chatId)
      try {
        await deleteDoc(doc(db, "chats", chatId))
        setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId))
      } catch (error) {
        console.error("Error deleting chat:", error)
        alert("Failed to delete conversation")
      } finally {
        setDeletingChatId(null)
      }
    }
  }

  const getOtherUserName = (chat) => {
    if (chat.buyerId === currentUser?.uid) {
      return chat.sellerName || "Unknown User"
    } else if (chat.sellerId === currentUser?.uid) {
      return chat.buyerName || "Unknown User"
    }
    return "Unknown User"
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Messages</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Chat with buyers and sellers</p>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">Start chatting when you buy or sell items</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {chats
              .filter((chat) => {
                if (!searchQuery) return true
                const searchLower = searchQuery.toLowerCase()
                const otherUserName = getOtherUserName(chat)
                return (
                  otherUserName?.toLowerCase().includes(searchLower) ||
                  chat.lastMessage?.toLowerCase().includes(searchLower)
                )
              })
              .map((chat) => {
                const otherUserName = getOtherUserName(chat)
                return (
                  <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={`group cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedChatId === chat.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                        : "hover:border-l-2 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                          getAvatarColor(otherUserName || "Unknown")
                        }`}
                      >
                        {getInitials(otherUserName || "Unknown")}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {otherUserName || "Unknown User"}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {formatTimeAgo(chat.lastUpdated)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                            {chat.lastMessage || "No messages yet"}
                          </p>
                          
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteChat(chat.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all duration-200"
                            title="Delete conversation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {chats.length} conversation{chats.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

export default ChatList
