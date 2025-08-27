import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEKBKSvoibTWKNCqK5BjcKtGeY6F7PdGs",
  authDomain: "project1-d300c.firebaseapp.com",
  projectId: "project1-d300c",
  storageBucket: "project1-d300c.firebasestorage.app",
  messagingSenderId: "866653665779",
  appId: "1:866653665779:web:3882f2d7de41dc62c8ba86",
  measurementId: "G-R18886JGHW"
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);




export const auth = getAuth(app);
export const db = getFirestore(app);
