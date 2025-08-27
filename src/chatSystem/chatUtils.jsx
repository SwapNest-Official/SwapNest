// Format time in a human-readable way
export const formatTimeAgo = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return ""

  const now = new Date()
  const date = timestamp.toDate()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return "just now"

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

// Get initials from name
export const getInitials = (name) => {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

// Generate a color based on name
export const getAvatarColor = (name) => {
  if (!name) return "from-purple-500 to-violet-500"

  const colors = [
    "from-purple-500 to-violet-500",
    "from-blue-500 to-indigo-400",
    "from-pink-500 to-rose-400",
    "from-indigo-500 to-blue-400",
    "from-fuchsia-500 to-pink-500",
    "from-violet-500 to-indigo-500",
  ]

  const charCode = name.charCodeAt(0)
  return colors[charCode % colors.length]
}