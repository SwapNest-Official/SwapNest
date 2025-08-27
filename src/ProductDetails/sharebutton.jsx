import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Copy,
  Share,
  X,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  LinkIcon,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// ShareButtons Component - renders a social sharing interface for colleges
function ShareButtons({ collegeName, className, profileName, profileUrl }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const shareUrl = profileUrl || (typeof window !== "undefined" ? window.location.href : "")
  const title = profileName 
    ? `Check out ${profileName}'s profile on UniBay!` 
    : `Check out this profile on UniBay!`

  // Handles copy to clipboard logic
  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  // Array of sharing platform options
  const shareOptions = [
    {
      name: "Facebook",
      icon: <Facebook className="h-4 w-4" />,
      color: "bg-[#3b5998] hover:bg-[#2d4373]",
      onClick: () =>
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl,
          )}&quote=${encodeURIComponent(title)}`,
          "_blank",
        ),
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-4 w-4" />,
      color: "bg-[#1DA1F2] hover:bg-[#0c85d0]",
      onClick: () =>
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            shareUrl,
          )}&text=${encodeURIComponent(title)}`,
          "_blank",
        ),
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
      color: "bg-[#25D366] hover:bg-[#1da851]",
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}`,
          "_blank",
        ),
    },
    {
      name: "Email",
      icon: <Mail className="h-4 w-4" />,
      color: "bg-[#D44638] hover:bg-[#b23121]",
      onClick: () =>
        window.open(
          `mailto:?subject=${encodeURIComponent(
            title,
          )}&body=${encodeURIComponent("Check this out: " + shareUrl)}`,
          "_blank",
        ),
    },
    {
      name: "Copy Link",
      icon: <LinkIcon className="h-4 w-4" />,
      color: "bg-gray-600 hover:bg-gray-700",
      onClick: handleCopy,
    },
  ]

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors",
                  className,
                )}
                onClick={() => setOpen(!open)}
              >
                <Share className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share Profile</p>
            </TooltipContent>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Share Profile</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12 text-left",
                  option.color,
                  "text-white hover:text-white"
                )}
                onClick={() => {
                  option.onClick()
                  setOpen(false)
                }}
              >
                {option.icon}
                <span className="font-medium">{option.name}</span>
                {option.name === "Copy Link" && copied && (
                  <span className="ml-auto text-sm opacity-80">Copied!</span>
                )}
              </Button>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Share this profile with your friends!</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">UniBay - Campus Marketplace</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

export default ShareButtons
