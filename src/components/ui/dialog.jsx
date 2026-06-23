import { useState } from 'react'

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-xl p-4 max-w-md w-full shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ children, className }) {
  return <div className={className}>{children}</div>
}

export function DialogHeader({ children }) {
  return <div className="border-b pb-2 mb-2">{children}</div>
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-semibold">{children}</h2>
}
