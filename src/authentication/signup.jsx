"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Lock, GraduationCap, Shield, Star, Users, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { auth, db } from "../firebase/config.js"
import { createUserWithEmailAndPassword, sendEmailVerification,fetchSignInMethodsForEmail,getAuth } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { Timestamp, doc, setDoc } from "firebase/firestore"
import EmailVerification from "./email-verification"
const SignupPage = () => {
  const [userCredentials, setUserCredentials] = useState({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const navigate = useNavigate()
  
const auth = getAuth();

  function handleChange(e) {
    setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value })
  }
  
/* const checkIfEmailExists = async (email) => {
  try {
    const cleanEmail = email.trim().toLowerCase(); // normalize
    const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
    console.log(methods);
    return methods.length > 0; // true if registered
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};
*/
  async function sendVerificationCode() {
  setLoading(true);
  setError("");

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
      sessionStorage.setItem("verificationCode", code)
      sessionStorage.setItem("verificationEmail", userCredentials.email)

    const res = await fetch("http://localhost:5000/send-otp", {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userCredentials.email, code:code }),
    });

    
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();

    if (data.success) {
      setVerificationSent(true);
      setShowVerification(true);

    } else {
      setError(data.message || "Failed to send OTP");
    }
  } catch (error) {
    console.error("OTP send error:", error);
    setError("Failed to send verification code. Please try again.");
  } finally {
    setLoading(false);
  }
}


  async function handleSignup(e) {
    e.preventDefault()

    if (!userCredentials.fullName || !userCredentials.email || !userCredentials.password) {
      setError("Please fill in all fields")
      return
    }

    if (userCredentials.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }


    if (!userCredentials.email.endsWith("@pec.edu.in")) {
  setError("Please Use Your College Email-ID")
  return
}

/*
  const exists = await checkIfEmailExists(userCredentials.email);
  console.log(exists);
if (exists) {
  setError("This email is already registered");
  return;
}*/

    await sendVerificationCode()
  }

  async function handleVerificationComplete(enteredCode) {
    setLoading(true)
    setError("")

   
    try {
      const storedCode = sessionStorage.getItem("verificationCode")
      const storedEmail = sessionStorage.getItem("verificationEmail")

      console.log(storedCode,storedEmail,enteredCode,userCredentials.email);
      if (enteredCode !== storedCode || userCredentials.email !== storedEmail) {
        throw new Error("Invalid verification code")
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userCredentials.email, userCredentials.password)
      const user = userCredential.user

      await sendEmailVerification(user)

      await setDoc(doc(db, "users", user.uid), {
        fullName: userCredentials.fullName || "New User",
        email: userCredential.user.email,
        profilePic: "https://res.cloudinary.com/db8elhbqj/image/upload/v1750560498/nyt9v8clbdk6j4uo3j1k.png",
        collegeName: "Punjab Engineering College",
        yearofStudy: "",
        itemsSold: 0,
        Rating: 0,
        isVerified: true,
        phone: "",
        createdAt: Timestamp.now(),
      })

      sessionStorage.removeItem("verificationCode")
      sessionStorage.removeItem("verificationEmail")

      navigate("/")
    } catch (error) {
      console.error("Verification error:", error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  function handleBackToSignup() {
    setShowVerification(false)
    setVerificationSent(false)
    setError("")
  }

  async function handleResendCode() {
    await sendVerificationCode()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {showVerification ? (
        <div className="relative z-10">
          <EmailVerification
            email={userCredentials.email}
            onVerificationComplete={handleVerificationComplete}
            onBack={handleBackToSignup}
            onResendCode={handleResendCode}
            loading={loading}
            error={error}
          />
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
          <div className="hidden lg:block space-y-8 px-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Punjab Engineering College
              </Badge>
              <h1 className="text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                Join Your College Community
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with fellow students, buy and sell items, and build lasting relationships within your college
                community.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">500+</p>
                  <p className="text-sm text-gray-600">Active Students</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Secure college-verified accounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Safe marketplace for students</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">Build your campus network</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="space-y-2 text-center pb-6">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Create an Account
                </CardTitle>
                <CardDescription className="text-gray-600">Join us today! It takes only a few steps.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Your Name"
                        onChange={handleChange}
                        required
                        className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="E-mail ID"
                        onChange={handleChange}
                        required
                        className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        onChange={handleChange}
                        required
                        className="pl-10 h-11 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending Code...</span>
                      </div>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <Separator className="my-6" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-3 text-sm text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-medium"
                    onClick={() => (window.location.href = "/login")}
                  >
                    Log in
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="lg:hidden mt-8 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm">
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">500+</p>
                    <p className="text-xs text-gray-600">Active Students</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                <p className="text-gray-700 text-sm font-medium text-center">
                  🎓 Join your college community and connect with fellow PEC students
                </p>
              </div>

              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Trusted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignupPage
