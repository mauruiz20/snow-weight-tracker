'use client'

export const dynamic = 'force-dynamic'

import { ParticipantList } from '@/components/participants/ParticipantList'
import { BackLink, LinkButton } from '@/components/ui'
import { useParticipants } from '@/hooks/useParticipants'
import { HiOutlineUserPlus } from 'react-icons/hi2'

export default function ParticipantsPage() {
  const { participants, rankings, loading, error } = useParticipants({ includeRankings: true })

  return (
    <div className="bg-mesh min-h-screen py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 pt-8 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pt-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">Participantes</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {participants.length} participante{participants.length !== 1 ? 's' : ''} registrado
              {participants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <LinkButton href="/participants/new" icon={<HiOutlineUserPlus className="h-5 w-5" />}>
            Registrarse
          </LinkButton>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <ParticipantList participants={participants} rankings={rankings} loading={loading} />

        <div className="mt-8">
          <BackLink href="/">Volver al Panel Principal</BackLink>
        </div>
      </div>
    </div>
  )
}
