"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useLocation } from "react-router-dom"
import ChatList from "./chatList"
import ChatRoom from "./chatRoom"
import Navbar from "../navbar"
import { useTheme } from "../contexts/ThemeContext"

const auth = getAuth()

const ChatInterface = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isVisible, setIsVisible] = useState(false)
  const { isDarkMode } = useTheme()
  const location = useLocation()

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })

    return () => unsubscribe()
  }, [])

  // Check for chatId in URL params
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(location.search)
      const chatId = searchParams.get('chatId')
      if (chatId && currentUser) {
        setSelectedChat(chatId)
      }
    } catch (error) {
      console.error("Error parsing URL parameters:", error)
    }
  }, [location.search, currentUser])

  // Fade in animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId)
  }

  const handleBackToList = () => {
    setSelectedChat(null)
  }

  // Mobile: Show chat list when no chat selected, show chat room when chat selected
  // Desktop: Show both side by side
  if (isMobile) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500`}>
        <Navbar />
        <div className={`flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 transition-colors duration-200`}>
          {!selectedChat ? (
            // Show only chat list on mobile when no chat selected
            <div className={`w-full bg-white dark:bg-gray-800 flex flex-col h-full transition-colors duration-200`}>
              <ChatList currentUser={currentUser} selectedChatId={selectedChat} onChatSelect={handleChatSelect} />
            </div>
          ) : (
            // Show only chat room on mobile when chat selected
            <div className="w-full flex flex-col h-full">
              <ChatRoom chatId={selectedChat} currentUser={currentUser} onBackClick={handleBackToList} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop layout: Show both chat list and chat room side by side
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500`}>
      <Navbar />
      <div className={`flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 transition-colors duration-200`}>
        {/* Chat List Sidebar */}
        <div className={`w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-lg transition-colors duration-200`}>
          <ChatList currentUser={currentUser} selectedChatId={selectedChat} onChatSelect={handleChatSelect} />
        </div>

        {/* Chat Room */}
        <div className="flex-1 flex flex-col h-full">
          {selectedChat ? (
            <ChatRoom chatId={selectedChat} currentUser={currentUser} onBackClick={handleBackToList} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s9-3.582 9-8-4.03-8-9-8-9 3.582-9 8 4.03 8 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a chat to start messaging</h3>
                <p className="text-gray-500 dark:text-gray-400">Choose from your conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
