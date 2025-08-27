"use client"

import { useState, useEffect } from "react"
import { Calendar, AlertCircle, CheckCircle, Clock, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ButtonClick from "../src/buttonClick"

export default function RentalOptions({ listing }) {
  const [rentalDays, setRentalDays] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [validationError, setValidationError] = useState("")
  const payloadRent = {
    rentDays  : rentalDays,
    startDate : startDate,
    endDate : endDate,
    price : listing.rentAmount,
    
  }
 // console.log(listing)
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  }

  
  const minDate = listing.availableFrom || new Date().toISOString().split("T")[0];
  const maxDate = listing.availableTo || "";

 
  const totalRentalCost = listing.rentAmount * (parseInt(rentalDays) || 0);

  useEffect(() => {
    
    setValidationError("");
  }, [startDate, rentalDays]);

  const handleRentalDaysChange = (e) => {
    const days = parseInt(e.target.value);
    
    if (isNaN(days)) {
      setRentalDays("");
      setEndDate("");
      return;
    }
    
    if (days < 1) {
      setValidationError("Minimum rental period is 1 day");
      setRentalDays(days);
      return;
    }
    
    if (days > 30) {
      setValidationError("Maximum rental period is 30 days");
      setRentalDays(30);
      calculateEndDate(30);
      return;
    }
    
    setRentalDays(days);
  }

  

  useEffect(() => {
    if (!startDate || !rentalDays) {
      setEndDate("");
      return;
    }
  
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(rentalDays) - 1);
  
    if (listing.availableTo && end > new Date(listing.availableTo)) {
      setValidationError("Selected period exceeds available date range");
      const availableEnd = new Date(listing.availableTo);
      const maxDays = Math.floor((availableEnd - start) / (1000 * 60 * 60 * 24)) + 1;
      setRentalDays(maxDays.toString());
      end.setDate(start.getDate() + maxDays - 1);
    } else {
      setValidationError(""); // Clear previous errors if any
    }
  
    setEndDate(end.toISOString().split("T")[0]);
  }, [startDate, rentalDays, listing.availableTo]); // dependencies
  

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    
    // Validate start date is within available range
    if (listing.availableFrom && new Date(newStartDate) < new Date(listing.availableFrom)) {
      setValidationError(`Start date must be on or after ${formatDate(listing.availableFrom)}`);
      return;
    }
    
    setStartDate(newStartDate);
   
  }

  const handleSubmit = () => {
    // Here you would handle the rental submission
    alert(`Rental request submitted for ${rentalDays} days starting ${formatDate(startDate)}`);
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-sky-50">
      <CardHeader className="bg-gradient-to-r from-sky-600 to-blue-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rental Options
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Available Period Info */}
        {(listing.availableFrom || listing.availableTo) && (
          <Alert className="bg-blue-50 border-blue-100 text-blue-800">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Available Period</AlertTitle>
            <AlertDescription className="text-blue-700">
              {listing.availableFrom && `From: ${formatDate(listing.availableFrom)}`}
              {listing.availableFrom && listing.availableTo && " • "}
              {listing.availableTo && `To: ${formatDate(listing.availableTo)}`}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Error */}
        {validationError && (
          <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-800">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700">Validation Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {validationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="rental-days" className="block text-sm font-medium text-gray-700">
              Number of Days
            </label>
            <Input
              type="number"
              id="rental-days"
              min="1"
              max="30"
              value={rentalDays}
              onChange={handleRentalDaysChange}
              className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              placeholder="Enter days (1-30)"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Input
              type="date"
              id="start-date"
              value={startDate}
              onChange={handleStartDateChange}
              min={minDate}
              max={maxDate}
              className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Date Summary */}
        {startDate && endDate && (
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center text-blue-700 font-medium mb-2">
              <Calendar className="h-5 w-5 mr-2" />
              Selected Rental Period
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-blue-600 font-medium">FROM</span>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 px-3 py-1">
                    {formatDate(startDate)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-blue-600 font-medium">TO</span>
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-white border-blue-200 text-blue-700 px-3 py-1">
                    {formatDate(endDate)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-100">
              <span className="text-xs text-blue-600 font-medium">DURATION</span>
              <div className="text-blue-700 font-medium">
                {rentalDays} {parseInt(rentalDays) === 1 ? "day" : "days"}
              </div>
            </div>
          </div>
        )}

        {/* Cost Summary */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">Cost Summary</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Daily Rate:</span>
              <span className="font-medium">₹{listing.rentAmount}/day</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Number of Days:</span>
              <span className="font-medium">{rentalDays || 0} {parseInt(rentalDays) === 1 ? "day" : "days"}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold text-blue-700">
              <span>Total Rental Cost:</span>
              <span>₹{totalRentalCost}</span>
            </div>
          </div>
        </div>

        {/* Security Deposit */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800 mb-1">Security Deposit</h4>
              <p className="text-amber-700 font-medium">₹{listing.securityDeposit}</p>
              <p className="text-xs text-amber-600 mt-1">
                Fully refundable upon return in original condition as per the damage policy.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
     
      <ButtonClick listing = {listing}  payloadRent = {payloadRent} ></ButtonClick>
      
    </Card>
  )
}
