'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

type LinkButtonVariant = 'primary' | 'secondary'
type LinkButtonSize = 'sm' | 'md' | 'lg'

interface LinkButtonProps {
  href: string
  variant?: LinkButtonVariant
  size?: LinkButtonSize
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const variantStyles: Record<LinkButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
  secondary:
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
}

const sizeStyles: Record<LinkButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
}

export const LinkButton = ({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
}: LinkButtonProps) => {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium shadow-sm
        transition-all duration-150 ease-in-out
        hover:scale-[1.02] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon}
      {children}
    </Link>
  )
}
