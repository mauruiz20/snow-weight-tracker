'use client'

export const dynamic = 'force-dynamic'

import { ParticipantForm } from '@/components/participants/ParticipantForm'
import { BackLink } from '@/components/ui'
import { useParticipants } from '@/hooks/useParticipants'
import { ROUTES } from '@/lib/constants'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ParticipantFormData {
  name: string
  age: number
  gender: 'male' | 'female'
  initial_weight: number
  target_weight?: number | null
  height: number
}

const NewParticipantPage = () => {
  const router = useRouter()
  const { createParticipant } = useParticipants()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: ParticipantFormData) => {
    setIsLoading(true)
    setError(null)

    const participant = await createParticipant(data)

    if (participant) {
      router.push(ROUTES.participant(participant.id))
    } else {
      setError('Error al crear participante. Por favor intenta de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-mesh min-h-screen py-4 sm:py-8'>
      <div className='mx-auto max-w-md px-4 sm:px-6 lg:px-8'>
        <div className='mb-6 pt-8 sm:mb-8 sm:pt-0'>
          <BackLink href={ROUTES.participants}>Volver a Participantes</BackLink>
        </div>

        <div className='animate-fade-in-up rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-8 dark:bg-gray-800/80'>
          <h1 className='mb-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>
            Registrarse
          </h1>
          <p className='mb-4 text-sm text-gray-500 sm:mb-6 dark:text-gray-400'>
            ¡Únete al Snow Weight Tracker y comienza tu camino de pérdida de
            peso!
          </p>

          {error && (
            <div className='mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/30'>
              <p className='text-sm text-red-700 dark:text-red-400'>{error}</p>
            </div>
          )}

          <ParticipantForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default NewParticipantPage
