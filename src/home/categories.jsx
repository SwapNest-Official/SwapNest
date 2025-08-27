"use client"

import { Link } from "react-router-dom"
import {
  Book,
  Laptop,
  Sofa,
  Shirt,
  FileText,
  Ticket,
  Backpack,
  BikeIcon as Bicycle,
  Coffee,
  Gift,
  TrendingUp,
  Clock,
} from "lucide-react"
import { useState } from "react"
import Navbar from "../navbar"

export default function Categories() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const categories = [
    {
      name: "Study Materials",
      icon: Book,
      count: 245,
      trending: true,
      limited: false,
      color: "from-orange-500 to-amber-500",
    },
    {
      name: "Electronics",
      icon: Laptop,
      count: 189,
      trending: true,
      limited: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Furniture",
      icon: Sofa,
      count: 124,
      trending: false,
      limited: false,
      color: "from-emerald-500 to-teal-500",
    },
    {
      name: "Clothing",
      icon: Shirt,
      count: 97,
      trending: false,
      limited: true,
      color: "from-violet-500 to-purple-500",
    },
    {
      name: "Event Tickets",
      icon: Ticket,
      count: 78,
      trending: false,
      limited: true,
      color: "from-pink-500 to-rose-500",
    },
    {
      name: "Transportation",
      icon: Bicycle,
      count: 45,
      trending: true,
      limited: false,
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Food & Drinks",
      icon: Coffee,
      count: 67,
      trending: false,
      limited: true,
      color: "from-red-500 to-orange-500",
    },
    {
      name: "Miscellaneous",
      icon: Gift,
      count: 93,
      trending: false,
      limited: false,
      color: "from-fuchsia-500 to-pink-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <section className="py-16 md:py-24 lg:py-32 text-white">
        <div className="container px-4 sm:px-6 mx-auto max-w-7xl">
          <div className="mb-12 md:mb-16 lg:mb-20 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 leading-tight">
              Discover What You Need
            </h2>

            
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon
              const isHovered = hoveredIndex === index

              return (
                <Link
                  key={category.name}
                  to={`/itemlist/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group relative flex flex-col items-center p-6 sm:p-5 md:p-6 lg:p-8 rounded-2xl bg-slate-800/60 backdrop-blur-md border border-slate-700/80 hover:border-slate-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 overflow-hidden"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Background gradient that appears on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
                  ></div>

                  {/* Category badges */}
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {false && (
                      <div className="flex items-center gap-1 bg-amber-500 text-amber-950 text-xs font-bold px-2.5 py-1 rounded-full shadow-lg transform group-hover:scale-105 transition-transform">
                        <TrendingUp className="w-3 h-3" />
                        <span>Hot</span>
                      </div>
                    )}
                    {false && (
                      <div className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg transform group-hover:scale-105 transition-transform">
                        <Clock className="w-3 h-3" />
                        <span>Limited</span>
                      </div>
                    )}
                  </div>

                  {/* Icon container with gradient background */}
                  <div
                    className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center rounded-full mb-5 md:mb-6 bg-gradient-to-br ${category.color} shadow-lg shadow-${category.color.split(" ")[1].replace("to-", "")}/30 transform group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}
                  >
                    <Icon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                  </div>

                  {/* Category name */}
                  <h3 className="text-white font-bold text-center text-lg sm:text-xl md:text-2xl mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                    {category.name}
                  </h3>


                  {/* CTA button that appears more prominently on hover */}
                  <div
                    className={`mt-auto py-2 px-5 rounded-full text-sm md:text-base font-medium bg-gradient-to-r ${category.color} text-white transform transition-all duration-300 shadow-lg ${
                      isHovered ? "opacity-100 translate-y-0 scale-105" : "opacity-80 translate-y-1"
                    } hover:shadow-${category.color.split(" ")[1].replace("to-", "")}/50`}
                  >
                    Explore Now
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
