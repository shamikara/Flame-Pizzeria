"use client"

import { useEffect } from "react"

export default function FireSparkles() {
  useEffect(() => {
    const container = document.getElementById("fire-sparkles-container")
    if (!container) return

    const createSpark = () => {
      const spark = document.createElement("div")
      spark.className = "sparkle"

      const size = Math.random() * 6 + 4 // 4px to 10px
      spark.style.width = `${size}px`
      spark.style.height = `${size}px`

      spark.style.left = `${Math.random() * 100}%`
      spark.style.bottom = "0px"
      spark.style.setProperty("--x", `${Math.random() * 100 - 50}px`)
      spark.style.setProperty("--y", `${Math.random() * 200 + 150}px`)
      spark.style.setProperty("--delay", `${Math.random() * 3}s`)
      spark.style.setProperty("--duration", `${3 + Math.random() * 2}s`)

      container.appendChild(spark)

      // Remove the spark after animation
      setTimeout(() => container.removeChild(spark), 5000)
    }

    const interval = setInterval(() => {
      createSpark()
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return <div id="fire-sparkles-container" className="fire-sparkles" />
}
