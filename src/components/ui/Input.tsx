'use client'

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export const Input = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 dark:text-gray-300'
      >
        {label}
      </label>
      <input
        id={id}
        className={`
          mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
          text-gray-900 shadow-sm
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
          dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
          dark:focus:border-blue-400 dark:focus:ring-blue-400
          dark:disabled:bg-gray-700
          ${error ? 'border-red-500 dark:border-red-400' : ''}
          ${className}
        `}
        {...props}
      />
      {helperText && !error && (
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>{helperText}</p>
      )}
      {error && (
        <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{error}</p>
      )}
    </div>
  )
}
