'use client'

import type { InputHTMLAttributes, CSSProperties } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  helperText?: string
  inline?: boolean
  labelClassName?: string
  labelStyle?: CSSProperties
}

export const Checkbox = ({
  label,
  error,
  helperText,
  id,
  className = '',
  inline = false,
  labelClassName = '',
  labelStyle,
  ...props
}: CheckboxProps) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(7)}`

  if (inline) {
    return (
      <div className='flex items-center gap-2'>
        <input
          id={checkboxId}
          type='checkbox'
          className={`
            h-4 w-4 rounded border-gray-300 text-blue-600
            focus:ring-blue-500
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-gray-600 dark:bg-gray-700
            ${error ? 'border-red-500 dark:border-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className={`cursor-pointer text-sm text-gray-700 dark:text-gray-300 ${labelClassName}`}
          style={labelStyle}
        >
          {label}
        </label>
        {error && (
          <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className='flex items-start gap-2'>
        <input
          id={checkboxId}
          type='checkbox'
          className={`
            mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600
            focus:ring-blue-500
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-gray-600 dark:bg-gray-700
            ${error ? 'border-red-500 dark:border-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        <div className='flex-1'>
          <label
            htmlFor={checkboxId}
            className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}
            style={labelStyle}
          >
            {label}
          </label>
          {helperText && !error && (
            <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>{helperText}</p>
          )}
          {error && (
            <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
