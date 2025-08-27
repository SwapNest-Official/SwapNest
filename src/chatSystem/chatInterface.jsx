"use client"

import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
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
        <div className="w-2/3 lg:w-3/4 flex flex-col h-full">
          {!selectedChat ? (
            <div className={`flex flex-col items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-center p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Select a conversation</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-md text-lg leading-relaxed">
                Choose a conversation from the list to start chatting with buyers and sellers
              </p>
              <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Secure</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ChatRoom chatId={selectedChat} currentUser={currentUser} onBackClick={handleBackToList} />
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
