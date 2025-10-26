"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NewsletterSubscription } from "./newsletter-subscription"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisitedHome')
    const hasSubscribed = localStorage.getItem('hasSubscribed')

    // Show modal only if user hasn't visited before and hasn't subscribed
    if (!hasVisited && !hasSubscribed) {
      // Small delay to ensure page loads first
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSubscribed = () => {
    localStorage.setItem('hasSubscribed', 'true')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Welcome to Flames Pizzeria! 🎉</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Join our newsletter for exclusive deals and be the first to know about new menu items!
          </DialogDescription>
        </DialogHeader>
        <NewsletterSubscription variant="modal" />
        <div className="text-center">
          <Button variant="ghost" onClick={handleClose} className="text-sm">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
