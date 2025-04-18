// Simplified version of the shadcn/ui use-toast
"use client"

export type ToastProps = {
  title?: string
  description?: string
  duration?: number
}

export const toast = ({ title, description, duration = 3000 }: ToastProps) => {
  // In a real implementation, this would use a context
  // For our demo, we'll just log to console
  console.log(`Toast: ${title} - ${description}`)
  // You could implement a real toast notification system here

  // Return an empty object to match shadcn's API
  return {}
}
