"use client"
import { Button } from "@/components/ui/button"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { Gift } from "lucide-react"
import { useNavigate } from "react-router-dom"
import ChatRoom from "./chatSystem/chatRoom"

const auth = getAuth()
const db = getFirestore()

const BuyButton = ({ listing, payloadRent }) => {
  //const [user, setUser] = useState(null);
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  //console.log(payloadRent);
  const [userId, setUserId] = useState(null)
  const [buyerData, setBuyerData] = useState(null)
  const [sellerData, setSellerData] = useState(null)

  // 🔥 New state to control ChatRoom rendering
  const [openChat, setOpenChat] = useState(false)
  const [chatId, setChatId] = useState(null)

  const payload = {
    user_email: buyerData !== null ? buyerData.email : "",
    user_phoneNo: buyerData !== null ? buyerData.phone : "",
    user_Name: buyerData !== null ? buyerData.fullName : "",
    user_Id: userId != null ? userId : "",
    product_owner_email: sellerData?.email,
    product_name: listing.title,
    product_price: listing.price,
    product_link: window.location.href, // Replace dynamically

    payloadRent: payloadRent,
    isSell: listing.listingType === "sell" || listing.listingType === "donate",
  }
  //console.log(payload)
  //console.log(listing);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const currentUserId = user.uid
        setUserId(currentUserId)
        //  console.log("Logged-in user ID:", currentUserId);

        // Fetch Buyer (Logged-in user) data
        try {
          const buyerDoc = await getDoc(doc(db, "users", currentUserId))
          if (buyerDoc.exists()) {
            const buyerInfo = buyerDoc.data()
            setBuyerData(buyerInfo)
            //  console.log("Buyer Data:", buyerInfo);
          } else {
            console.error("No user data found in Firestore for buyer")
          }
        } catch (error) {
          console.error("Error fetching buyer data:", error)
        }
      } else {
        setBuyerData(null)
        setUserId(null)
      }
    })

    //console.log(payload.product_link);

    // Fetch Seller data using listing.userId
    const fetchSellerData = async () => {
      const sellerId = listing?.userId
      if (!sellerId) return

      try {
        const sellerDoc = await getDoc(doc(db, "users", sellerId))
        if (sellerDoc.exists()) {
          const sellerInfo = sellerDoc.data()
          setSellerData(sellerInfo)
          // console.log("Seller Data:", sellerInfo);
        } else {
          console.error("No user data found in Firestore for seller")
        }
      } catch (error) {
        console.error("Error fetching seller data:", error)
      }
    }

    fetchSellerData()

    return () => unsubscribe()
  }, [])

  // console.log(listing);
  // console.log(window.location.href);

  // get seller data;
  // console.log(listing.userId);
  //console.log(user);
  const handleBuy = async () => {
    if (auth.currentUser == null) {
      alert("Kindly Login before Proceeding")
      navigate("/login")
      return
    }

    try {
      setLoading(true)
      /* const response = await fetch("https://college-fair.onrender.com/send-order-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
       if (!response.ok) {
      throw new Error("Email sending failed");
      }

      const data = await response.json();
      const producRef = doc(db,"items" , listing.id);
       await updateDoc(producRef, {
        interestCount : increment(1)
      })
      */

      // Create chat document
      const newChatId = `${listing.id}_${userId}`
      const chatRef = doc(db, "chats", newChatId)
      const chatDoc = await getDoc(chatRef)
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          chatId: newChatId,
          productId: listing.id,
          productTitle: listing.title,
          buyerId: userId,
          sellerId: listing.userId,
          buyerName: buyerData.fullName,
          sellerName: sellerData.fullName,
          lastMessage: "",
          lastUpdated: new Date().toISOString(),
        })
      }

      //   alert("Thank you for your interest! Redirecting to chat...");

      // Open ChatRoom after creating chat
      setChatId(newChatId)
      setOpenChat(true)
    } catch (error) {
      alert("Error sending email")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ If chat is open, show ChatRoom instead of the button
  if (openChat && chatId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 sm:p-6 md:p-8">
        <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Chat with {sellerData?.fullName}</h3>
            <Button variant="ghost" size="sm" onClick={() => setOpenChat(false)} className="rounded-full h-8 w-8 p-0">
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <ChatRoom
              chatId={chatId}
              currentUser={{ uid: userId, ...buyerData }}
              onBackClick={() => setOpenChat(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  // Check if user is trying to chat with their own product
  if (userId === listing?.userId) {
    return (
      <Button
        size="lg"
        disabled
        className="w-full text-gray-400 bg-gray-300 cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        This is your product
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      onClick={handleBuy}
      disabled={loading}
      className={`w-full text-white ${
        true
          ? "bg-green-600 hover:bg-green-700"
          : true
            ? "bg-purple-600 hover:bg-purple-700"
            : "bg-indigo-600 hover:bg-indigo-700"
      }`}
    >
      {listing.listingType === "donate" ? (
        <>
          <Gift className="h-4 w-4 mr-2" />
          Request Item
        </>
      ) : listing.listingType === "rent" ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Chat Now
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Chat Now
        </>
      )}
    </Button>
  )
}

export default BuyButton
