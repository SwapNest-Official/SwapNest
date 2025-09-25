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
import { db } from "../firebase/config.js"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
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

  const authInstance = getAuth()

  function handleChange(e) {
    setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value })
  }

  async function sendVerificationCode() {
    setLoading(true)
    setError("")

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      sessionStorage.setItem("verificationCode", code)
      sessionStorage.setItem("verificationEmail", userCredentials.email)

      const res = await fetch("https://swapnest-m4p9.onrender.com/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userCredentials.email, code: code }),
      })

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json()

      if (data.success) {
        setVerificationSent(true)
        setShowVerification(true)
      } else {
        setError(data.message || "Failed to send OTP")
      }
    } catch (error) {
      console.error("OTP send error:", error)
      setError("Failed to send verification code. Please try again.")
    } finally {
      setLoading(false)
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

    await sendVerificationCode()
  }

  async function handleVerificationComplete(enteredCode) {
    setLoading(true)
    setError("")

    try {
      const storedCode = sessionStorage.getItem("verificationCode")
      const storedEmail = sessionStorage.getItem("verificationEmail")

      if (enteredCode !== storedCode || userCredentials.email !== storedEmail) {
        throw new Error("Invalid verification code")
      }

      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        userCredentials.email,
        userCredentials.password,
      )
      const user = userCredential.user

      await sendEmailVerification(user)

      await setDoc(doc(db, "users", user.uid), {
        fullName: userCredentials.fullName || "New User",
        email: userCredential.user.email,
        profilePic:
          "https://res.cloudinary.com/db8elhbqj/image/upload/v1750560498/nyt9v8clbdk6j4uo3j1k.png",
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

  // 🔹 Google Signup
  async function handleGoogleSignup() {
    setLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(authInstance, provider)
      const user = result.user

      await setDoc(doc(db, "users", user.uid), {
        fullName: user.displayName || "New User",
        email: user.email,
        profilePic:
          user.photoURL ||
          "https://res.cloudinary.com/db8elhbqj/image/upload/v1750560498/nyt9v8clbdk6j4uo3j1k.png",
        collegeName: "",
        yearofStudy: "",
        itemsSold: 0,
        Rating: 0,
        isVerified: true, // Google ensures email verification
        phone: user.phoneNumber || "",
        createdAt: Timestamp.now(),
      })

      navigate("/")
    } catch (error) {
      console.error("Google signup error:", error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
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
            {/* Left panel with info */}
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Student Community
              </Badge>
              <h1 className="text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
                Join Your College Community
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with fellow students, buy and sell items, and build lasting relationships within your college
                community.
              </p>
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
                {/* Email Signup Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" placeholder="Your Name" onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="E-mail ID" onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </Button>
                </form>

                {/* OR Divider */}
                <div className="flex items-center gap-2 my-4">
                  <Separator className="flex-1" />
                  <span className="text-sm text-gray-500">OR</span>
                  <Separator className="flex-1" />
                </div>

                {/* Google Signup */}
                <Button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg flex items-center justify-center space-x-2"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span>Sign up with Google</span>
                </Button>

                <div className="text-center mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => (window.location.href = "/login")}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Log in
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignupPage
