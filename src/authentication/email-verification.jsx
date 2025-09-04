"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

const EmailVerification = ({ email, onVerificationComplete, onBack, onResendCode, loading, error }) => {
  const [verificationCode, setVerificationCode] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (verificationCode.length === 6) {
      onVerificationComplete(verificationCode)
    }
  }

  const handleResend = () => {
    onResendCode()
    setTimeLeft(300)
    setCanResend(false)
    setVerificationCode("")
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                className="text-center text-lg tracking-widest h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 text-center">Enter the 6-digit code sent to your email</p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Email</span>
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              {canResend ? (
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 font-medium mt-1"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Resend Code
                </Button>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Resend available in {formatTime(timeLeft)}</p>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={onBack}
              className="w-full text-gray-600 hover:text-gray-700 hover:bg-gray-50 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign Up
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium">Check your spam folder</p>
                <p>If you don't see the email, please check your spam or junk folder.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailVerification
