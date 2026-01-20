'use client'

import Link from 'next/link'
import { HiOutlineArrowLeft } from 'react-icons/hi2'

interface BackLinkProps {
  href: string
  children: string
}

export const BackLink = ({ href, children }: BackLinkProps) => {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
    >
      <HiOutlineArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  )
}
