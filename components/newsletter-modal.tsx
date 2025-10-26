"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()

  useEffect(() => {
    // Only show on homepage (/)
    if (pathname !== '/') return

    // Check if user has already interacted with the modal (subscribed or dismissed)
    const hasInteractedWithModal = localStorage.getItem('hasInteractedWithNewsletterModal')

    // Show modal only if user hasn't interacted with it before and is on homepage
    if (!hasInteractedWithModal) {
      // Small delay to ensure page loads first
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [pathname])

  const handleClose = () => {
    // Mark that user has dismissed the modal - don't show again
    localStorage.setItem('hasInteractedWithNewsletterModal', 'true')
    setIsOpen(false)
  }

  const handleSubscribed = () => {
    // Mark that user has subscribed - don't show again
    localStorage.setItem('hasInteractedWithNewsletterModal', 'true')
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
        <NewsletterSubscription
          variant="modal"
          onSubscribed={handleSubscribed}
        />
        <div className="text-center">
          <Button variant="ghost" onClick={handleClose} className="text-sm">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
