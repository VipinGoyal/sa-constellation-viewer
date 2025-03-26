"use client"

import type React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-black font-semibold",
          description: "group-[.toast]:text-black text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:border-none group-[.toast]:bg-transparent group-[.toast]:text-gray-500 hover:group-[.toast]:bg-gray-100 group-[.toast]:rounded-full",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

