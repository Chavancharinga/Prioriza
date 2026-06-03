import React from 'react'

export default function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton rounded-md ${className}`}
      {...props}
    />
  )
}

Skeleton.Text = function SkeletonText({ lines = 1, className = '', ...props }) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-md w-full last:w-5/6"
        />
      ))}
    </div>
  )
}

Skeleton.Circle = function SkeletonCircle({ size = 'h-10 w-10', className = '', ...props }) {
  return (
    <div
      className={`skeleton rounded-full ${size} ${className}`}
      {...props}
    />
  )
}

Skeleton.Card = function SkeletonCard({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-neutral-800/40 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-700/50 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
