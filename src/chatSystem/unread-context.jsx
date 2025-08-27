"use client"

import { createContext, useContext, useState } from "react"

const UnreadContext = createContext()

export const UnreadProvider = ({ children }) => {
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)

  const value = {
    hasUnreadMessages,
    setHasUnreadMessages,
    // Helper function to clear unread status
    clearUnreadMessages: () => setHasUnreadMessages(false),
  }

  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
}

export const useUnread = () => {
  const context = useContext(UnreadContext)
  if (!context) {
    throw new Error("useUnread must be used within UnreadProvider")
  }
  return context
}