'use client'

export const dynamic = 'force-dynamic'

import { ParticipantForm } from '@/components/participants/ParticipantForm'
import { WeightStatsCard } from '@/components/stats/WeightStatsCard'
import { BackLink, Button } from '@/components/ui'
import { WeightRecordForm } from '@/components/weight/WeightRecordForm'
import { WeightRecordList } from '@/components/weight/WeightRecordList'
import { useParticipants } from '@/hooks/useParticipants'
import { useWeightRecords } from '@/hooks/useWeightRecords'
import type { Participant } from '@/types/database.types'
import { calculateWeightStats } from '@/utils/weight-calculations'
import { use, useEffect, useState } from 'react'
import { HiOutlinePencilSquare } from 'react-icons/hi2'

interface ParticipantFormData {
  name: string
  age: number
  gender: 'male' | 'female'
  initial_weight: number
  height: number
}

interface ParticipantPageProps {
  params: Promise<{ id: string }>
}

export default function ParticipantPage({ params }: ParticipantPageProps) {
  const { id } = use(params)
  const { getParticipant, updateParticipant } = useParticipants()
  const {
    records,
    createRecord,
    updateRecord,
    deleteRecord,
    loading: recordsLoading,
  } = useWeightRecords({ participantId: id })

  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingRecord, setEditingRecord] = useState<string | null>(null)

  useEffect(() => {
    const fetchParticipant = async () => {
      setLoading(true)
      const data = await getParticipant(id)
      if (data) {
        setParticipant(data)
      } else {
        setError('Participante no encontrado')
      }
      setLoading(false)
    }
    fetchParticipant()
  }, [id, getParticipant])

  const handleUpdateParticipant = async (data: ParticipantFormData) => {
    if (!participant) return
    setIsUpdating(true)

    const updated = await updateParticipant(participant.id, data)
    if (updated) {
      setParticipant(updated)
      setIsEditing(false)
    }
    setIsUpdating(false)
  }

  const handleAddWeightRecord = async (data: {
    weight: number
    recorded_at: string
    notes: string | null
  }) => {
    await createRecord({
      ...data,
      participant_id: id,
    })
  }

  const handleUpdateWeightRecord = async (
    recordId: string,
    data: { weight: number; recorded_at: string; notes: string | null }
  ) => {
    await updateRecord(recordId, data)
    setEditingRecord(null)
  }

  const handleDeleteWeightRecord = async (recordId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de peso?')) {
      await deleteRecord(recordId)
    }
  }

  if (loading) {
    return (
      <div className="bg-mesh min-h-screen py-4 sm:py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse pt-8 sm:pt-0">
            <div className="h-6 w-32 rounded bg-gray-200 sm:h-8 sm:w-48 dark:bg-gray-700" />
            <div className="mt-4 h-48 rounded-lg bg-gray-200 sm:h-64 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !participant) {
    return (
      <div className="bg-mesh min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">
              {error || 'Participante no encontrado'}
            </p>
          </div>
          <div className="mt-4">
            <BackLink href="/participants">Volver a Participantes</BackLink>
          </div>
        </div>
      </div>
    )
  }

  const stats = calculateWeightStats(participant, records)

  return (
    <div className="bg-mesh min-h-screen py-4 sm:py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 pt-8 sm:mb-6 sm:pt-0">
          <BackLink href="/participants">Volver a Participantes</BackLink>
        </div>

        {/* Profile Section */}
        <div className="animate-fade-in-up rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6 dark:bg-gray-800/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
                {participant.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {participant.age} años • {participant.gender === 'male' ? 'Masculino' : 'Femenino'}
              </p>
            </div>
            {!isEditing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<HiOutlinePencilSquare className="h-4 w-4" />}
              >
                Editar Perfil
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="mt-6">
              <ParticipantForm
                participant={participant}
                onSubmit={handleUpdateParticipant}
                onCancel={() => setIsEditing(false)}
                isLoading={isUpdating}
              />
            </div>
          ) : (
            <div className="mt-6">
              <WeightStatsCard participant={participant} stats={stats} />
            </div>
          )}
        </div>

        {/* Weight Records Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
            Registros de Peso
          </h2>

          <div className="animate-fade-in-up stagger-1 rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6 dark:bg-gray-800/80">
            <h3 className="mb-4 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
              Agregar Nuevo Registro
            </h3>
            <WeightRecordForm onSubmit={handleAddWeightRecord} />
          </div>

          <div className="mt-6">
            <WeightRecordList
              records={records}
              loading={recordsLoading}
              editingId={editingRecord}
              onEdit={setEditingRecord}
              onUpdate={handleUpdateWeightRecord}
              onDelete={handleDeleteWeightRecord}
              onCancelEdit={() => setEditingRecord(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
