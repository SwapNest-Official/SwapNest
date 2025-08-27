import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Share } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple ShareButton Component - just copies link to clipboard
function ShareButton({ className, profileName, profileUrl }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = profileUrl || (typeof window !== "undefined" ? window.location.href : "")

  // Simple copy to clipboard function
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        console.log("Link copied to clipboard:", shareUrl)
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        console.log("Link copied to clipboard (fallback):", shareUrl)
      }
    } catch (error) {
      console.error("Failed to copy link:", error)
      alert("Failed to copy link. Please copy manually: " + shareUrl)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-9 w-9 rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors",
        className,
      )}
      onClick={handleCopy}
      title={`Copy ${profileName ? "product" : "profile"} link`}
    >
      {copied ? (
        <Copy className="h-4 w-4 text-green-600" />
      ) : (
        <Share className="h-4 w-4" />
      )}
    </Button>
  )
}

export default ShareButton
