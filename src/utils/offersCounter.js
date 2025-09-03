import { getFirestore, doc, getDoc, onSnapshot } from "firebase/firestore"

const db = getFirestore()

// Function to get the current offers count
export const getOffersCount = async () => {
  try {
    const counterRef = doc(db, "counters", "offers")
    const counterDoc = await getDoc(counterRef)
    
    if (counterDoc.exists()) {
      return counterDoc.data().totalOffers || 0
    } else {
      return 0
    }
  } catch (error) {
    console.error("Error fetching offers count:", error)
    return 0
  }
}

// Function to listen for real-time updates to the offers count
export const subscribeToOffersCount = (callback) => {
  try {
    const counterRef = doc(db, "counters", "offers")
    return onSnapshot(counterRef, (doc) => {
      if (doc.exists()) {
        const count = doc.data().totalOffers || 0
        callback(count)
      } else {
        callback(0)
      }
    }, (error) => {
      console.error("Error listening to offers count:", error)
      callback(0)
    })
  } catch (error) {
    console.error("Error setting up offers count listener:", error)
    callback(0)
  }
}
