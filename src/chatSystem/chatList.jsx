"use client"

import { useState, useEffect } from "react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore"
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

  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const loadChats = async () => {
      try {
        const buyerQuery = query(collection(db, "chats"), where("buyerId", "==", currentUser.uid))
        const sellerQuery = query(collection(db, "chats"), where("sellerId", "==", currentUser.uid))

        const [buyerSnapshot, sellerSnapshot] = await Promise.all([getDocs(buyerQuery), getDocs(sellerQuery)])

        const buyerChats = buyerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        const sellerChats = sellerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        console.log("Raw buyer chats:", buyerChats)
        console.log("Raw seller chats:", sellerChats)

        const chatMap = new Map()
        ;[...buyerChats, ...sellerChats].forEach((chat) => {
          chatMap.set(chat.id, chat)
        })

        const allChats = Array.from(chatMap.values())

        const unsubscribes = []

        allChats.forEach((chat) => {
          const chatUnsubscribe = onSnapshot(doc(db, "chats", chat.id), async (chatDoc) => {
            if (chatDoc.exists()) {
              const updatedChatData = { id: chatDoc.id, ...chatDoc.data() }

              // Determine the other user's ID and fetch their name for real-time updates
              let otherUserId = null
              if (updatedChatData.buyerId === currentUser.uid) {
                otherUserId = updatedChatData.sellerId
              } else if (updatedChatData.sellerId === currentUser.uid) {
                otherUserId = updatedChatData.buyerId
              }

              // Fetch the other user's name
              let otherUserName = "Unknown User"
              if (otherUserId) {
                try {
                  const userDoc = await getDoc(doc(db, "users", otherUserId))
                  if (userDoc.exists()) {
                    const userData = userDoc.data()
                    console.log(`Real-time: User document data for ${otherUserId}:`, userData)
                    otherUserName = userData.fullName || userData.name || "Unknown User"
                    console.log(`Real-time: Fetched user name for ${otherUserId}:`, otherUserName, userData)
                  } else {
                    console.log(`Real-time: User document not found for ID: ${otherUserId}`)
                  }
                } catch (error) {
                  console.error("Real-time: Error fetching user name:", error)
                  otherUserName = "Unknown User"
                }
              } else {
                console.log("Real-time: No otherUserId found in chat:", updatedChatData)
              }

              setChats((prevChats) => {
                const newChats = prevChats.map((c) => {
                  if (c.id === chat.id) {
                    return { 
                      ...c, 
                      ...updatedChatData, 
                      otherUserName,
                      otherUserId
                    }
                  }
                  return c
                })
                return newChats.sort((a, b) => {
                  if (!a.lastUpdated || !b.lastUpdated) return 0
                  const aTime = a.lastUpdated instanceof Date ? a.lastUpdated : a.lastUpdated?.toDate()
                  const bTime = b.lastUpdated instanceof Date ? b.lastUpdated : b.lastUpdated?.toDate()
                  return bTime - aTime
                })
              })
            }
          })

          // Listen to read status changes
          const readStatusUnsubscribe = onSnapshot(
            doc(db, "chats", chat.id, "readStatus", currentUser.uid),
            (readDoc) => {
              const lastReadAt = readDoc.exists() ? readDoc.data().lastReadAt?.toDate() : null

              // Update read status for this specific chat
              setChats((prevChats) =>
                prevChats.map((c) => {
                  if (c.id === chat.id) {
                    const lastUpdated = c.lastUpdated instanceof Date ? c.lastUpdated : c.lastUpdated?.toDate()

                    // Key fix: Don't mark as unread if the last message was sent by current user
                    const isUnread =
                      lastReadAt && lastUpdated && c.lastMessageSenderId !== currentUser.uid
                        ? lastUpdated > lastReadAt
                        : c.lastMessageSenderId !== currentUser.uid && !!lastUpdated

                    return { ...c, isUnread, lastReadAt }
                  }
                  return c
                }),
              )
            },
          )

          unsubscribes.push(chatUnsubscribe, readStatusUnsubscribe)
        })

        const enrichedChats = await Promise.all(
          allChats.map(async (chat) => {
            const readRef = doc(db, "chats", chat.id, "readStatus", currentUser.uid)
            const readSnap = await getDoc(readRef)

            const lastReadAt = readSnap.exists()
              ? readSnap.data().lastReadAt instanceof Date
                ? readSnap.data().lastReadAt
                : readSnap.data().lastReadAt?.toDate()
              : null

            const lastUpdated = chat.lastUpdated instanceof Date
              ? chat.lastUpdated
              : chat.lastUpdated?.toDate()

            // Determine the other user's ID and fetch their name
            let otherUserId = null
            if (chat.buyerId === currentUser.uid) {
              otherUserId = chat.sellerId
            } else if (chat.sellerId === currentUser.uid) {
              otherUserId = chat.buyerId
            }

            // Fetch the other user's name
            let otherUserName = "Unknown User"
            if (otherUserId) {
              try {
                const userDoc = await getDoc(doc(db, "users", otherUserId))
                if (userDoc.exists()) {
                  const userData = userDoc.data()
                  console.log(`User document data for ${otherUserId}:`, userData)
                  otherUserName = userData.fullName || userData.name || "Unknown User"
                  console.log(`Fetched user name for ${otherUserId}:`, otherUserName, userData)
                } else {
                  console.log(`User document not found for ID: ${otherUserId}`)
                }
              } catch (error) {
                console.error("Error fetching user name:", error)
                otherUserName = "Unknown User"
              }
            } else {
              console.log("No otherUserId found in chat:", chat)
            }

            const isUnread =
              lastReadAt && lastUpdated && chat.lastMessageSenderId !== currentUser.uid
                ? lastUpdated > lastReadAt
                : chat.lastMessageSenderId !== currentUser.uid && !!lastUpdated

            return { 
              ...chat, 
              isUnread, 
              lastReadAt,
              otherUserName,
              otherUserId
            }
          }),
        )

        setChats(enrichedChats.sort((a, b) => {
          if (!a.lastUpdated || !b.lastUpdated) return 0
          const aTime = a.lastUpdated instanceof Date ? a.lastUpdated : a.lastUpdated?.toDate()
          const bTime = b.lastUpdated instanceof Date ? b.lastUpdated : b.lastUpdated?.toDate()
          return bTime - aTime
        }))

        setLoading(false)
      } catch (error) {
        console.error("Error loading chats:", error)
        setLoading(false)
      }
    }

    loadChats()

    return () => {
      // Cleanup subscriptions
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
                return (
                  chat.otherUserName?.toLowerCase().includes(searchLower) ||
                  chat.lastMessage?.toLowerCase().includes(searchLower)
                )
              })
              .map((chat) => (
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
                        getAvatarColor(chat.otherUserName || "Unknown")
                      }`}
                    >
                      {getInitials(chat.otherUserName || "Unknown")}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {chat.otherUserName || "Unknown User"}
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
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 ml-2"
                          title="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
