"use client"

import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { Store, Menu, X, User, ChevronDown, MessageCircle, Sun, Moon } from "lucide-react"
import { auth } from "./firebase/config"
import { signOut } from "firebase/auth"
import { getFirestore, collection, query, where, getDocs, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore"
import { useTheme } from "./contexts/ThemeContext"

const db = getFirestore()

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const chatRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useTheme()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setIsUserMenuOpen(false)
  }, [location])

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  // Fetch unread message count with proper logic
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0)
      return
    }

    const unsubscribe = onSnapshot(
      collection(db, "chats"),
      async (snapshot) => {
        let count = 0
        
        for (const chatDoc of snapshot.docs) {
          const chatData = chatDoc.data()
          
          // Check if current user is a participant in this chat
          if (chatData.buyerId === currentUser.uid || chatData.sellerId === currentUser.uid) {
            // Check if there's a last message and it's not from the current user
            if (chatData.lastMessage && chatData.lastMessageSenderId !== currentUser.uid) {
              try {
                // Get the user's read status for this chat
                const readStatusRef = doc(db, "chats", chatDoc.id, "readStatus", currentUser.uid)
                const readStatusDoc = await getDoc(readStatusRef)
                
                if (readStatusDoc.exists()) {
                  const lastReadAt = readStatusDoc.data().lastReadAt
                  const lastMessageTime = chatData.lastUpdated
                  
                  // If last message is newer than last read time, it's unread
                  if (lastMessageTime && lastReadAt && lastMessageTime.toDate() > lastReadAt.toDate()) {
                    count++
                  }
                } else {
                  // No read status means unread
                  count++
                }
              } catch (error) {
                console.error("Error checking read status:", error)
                // If there's an error, assume unread
                count++
              }
            }
          }
        }
        
        setUnreadCount(count)
      },
      (error) => {
        console.error("Error fetching unread messages:", error)
      }
    )

    return () => unsubscribe()
  }, [currentUser])

 
  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  
  const navigateToAllChats = () => {
    setIsChatOpen(false)
    navigate("/chating")
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 sticky top-0 w-full z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink
              className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight flex items-center transition-colors duration-200"
              to="/"
              aria-label="UniBay Home"
            >
              <span className="text-purple-600">Uni</span>
              <span className="text-gray-800 dark:text-gray-200">Bay</span>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between flex-1 ml-10">
            <div className="flex space-x-1">
              <NavLink
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? "text-purple-600 dark:text-purple-400" 
                      : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                  }`
                }
                to="/"
              >
                Home
              </NavLink>
              <NavLink
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? "text-purple-600 dark:text-purple-400" 
                      : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                  }`
                }
                to="/categories"
              >
                Categories
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? "text-purple-600 dark:text-purple-400" 
                      : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                  }`
                }
                to="/about"
              >
                About
              </NavLink>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <NavLink
                to="/addItem"
                className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Sell an item"
              >
                <Store size={16} className="mr-1" /> Sell Item
              </NavLink>

              {currentUser && (
                <div className="relative" ref={chatRef}>
                  <NavLink
                     to="/chating"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    aria-expanded={isChatOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <MessageCircle size={15} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium">Messages</span>
                  </NavLink>
                </div>
              )}

              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <User size={15} />
                    <span className="text-sm font-medium">Account</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-md py-1 z-50 border border-gray-100 dark:border-gray-700">
                      <NavLink
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Profile
                      </NavLink>
                      <NavLink
                        to="/removeItem"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Listings
                      </NavLink>
                      <NavLink
                        to="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Favorites
                      </NavLink>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <NavLink
                    to="/login"
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors duration-200"
                    aria-label="Sign in"
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="px-3 py-1.5 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Register"
                  >
                    Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-3 lg:hidden">
            {currentUser && (
              <>
                <NavLink
                  to="/chating"
                 
                  className="p-1.5 text-gray-700 rounded hover:bg-gray-50 relative"
                  aria-label="Messages"
                >
                  <MessageCircle size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/profile"
                  className="p-1.5 text-gray-700 rounded hover:bg-gray-50"
                  aria-label="Your profile"
                >
                  <User size={18} />
                </NavLink>
              </>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 text-gray-700 rounded hover:bg-gray-50 focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium ${
                  isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`
              }
              to="/"
            >
              Home
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium ${
                  isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`
              }
              to="/categories"
            >
              Categories
            </NavLink>

            <NavLink
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-base font-medium ${
                  isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                }`
              }
              to="/about"
            >
              About
            </NavLink>
            {currentUser && (
              <NavLink
                className={({ isActive }) =>
                  `block px-3 py-2 rounded text-base font-medium ${
                    isActive ? "text-purple-600" : "text-gray-700 hover:text-purple-600"
                  }`
                }
                to="/chating"
              >
                <div className="flex items-center justify-between">
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              </NavLink>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            {currentUser ? (
              <div className="space-y-1">
                <NavLink
                  to="/profile"
                  className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/removeItem"
                  className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  My Listings
                </NavLink>
                <NavLink
                  to="/favorites"
                  className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  My Favorites
                </NavLink>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <NavLink
                  to="/login"
                  className="block px-3 py-2 rounded text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="block px-3 py-2 rounded text-base font-medium text-white bg-gray-800 hover:bg-gray-700"
                >
                  Register
                </NavLink>
              </div>
            )}

            <NavLink
              to="/addItem"
              className="mt-3 block w-full px-4 py-3 rounded-lg text-center text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-200"
            >
              <Store size={16} className="inline-block mr-2" /> Sell Your Items
            </NavLink>
          </div>
        </div>
      )}

      {/* Mobile Chat Dropdown */}
      {isChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" ref={chatRef}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg">Messages</h3>
              <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar