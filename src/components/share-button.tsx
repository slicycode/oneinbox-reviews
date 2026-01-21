'use client'

import { Share2 } from 'lucide-react'

interface ShareButtonProps {
  title: string
  description?: string
}

export function ShareButton({ title, description }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      await navigator.share({
        title,
        text: description,
        url: window.location.href,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="flex items-center gap-4 mb-8">
      <Share2 className="w-5 h-5" />
      <button
        onClick={handleShare}
        className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        Share this article
      </button>
    </div>
  )
} 