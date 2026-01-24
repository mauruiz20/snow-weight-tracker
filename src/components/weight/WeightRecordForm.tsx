'use client'

import { Button, Input, TextArea } from '@/components/ui'
import type { WeightRecord } from '@/types/database.types'
import { type FormEvent, useState } from 'react'
import { HiOutlineCheck, HiOutlinePlus, HiOutlineXMark } from 'react-icons/hi2'

// Format date to local datetime-local input format (YYYY-MM-DDTHH:mm)
const toLocalDateTimeString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

interface WeightRecordFormData {
  weight: number
  recorded_at: string
  notes: string | null
}

interface WeightRecordFormProps {
  record?: WeightRecord
  onSubmit: (data: WeightRecordFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export const WeightRecordForm = ({
  record,
  onSubmit,
  onCancel,
  isLoading = false,
}: WeightRecordFormProps) => {
  const [weight, setWeight] = useState(record?.weight?.toString() || '')
  const [recordedAt, setRecordedAt] = useState(
    toLocalDateTimeString(record?.recorded_at ? new Date(record.recorded_at) : new Date())
  )
  const [notes, setNotes] = useState(record?.notes || '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isEditing = !!record

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const weightNum = Number.parseFloat(weight)

    if (isNaN(weightNum) || weightNum <= 0 || weightNum >= 500) {
      setError('El peso debe estar entre 0.01 y 499.99 kg')
      return
    }

    if (!recordedAt) {
      setError('La fecha y hora son requeridas')
      return
    }

    setSubmitting(true)

    try {
      await onSubmit({
        weight: weightNum,
        recorded_at: new Date(recordedAt).toISOString(),
        notes: notes.trim() || null,
      })

      if (!isEditing) {
        setWeight('')
        setRecordedAt(toLocalDateTimeString(new Date()))
        setNotes('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    } finally {
      setSubmitting(false)
    }
  }

  const loading = isLoading || submitting

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="weight"
          label="Peso (kg)"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ingresa el peso"
          step={0.01}
          min={0.01}
          max={499.99}
          disabled={loading}
          required
        />

        <Input
          id="recordedAt"
          label="Fecha y Hora"
          type="datetime-local"
          value={recordedAt}
          onChange={(e) => setRecordedAt(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <TextArea
        id="notes"
        label="Notas (opcional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Cualquier nota sobre esta medición..."
        rows={2}
        disabled={loading}
      />

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          icon={
            isEditing ? (
              <HiOutlineCheck className="h-4 w-4" />
            ) : (
              <HiOutlinePlus className="h-4 w-4" />
            )
          }
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar Registro' : 'Agregar Registro'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            icon={<HiOutlineXMark className="h-4 w-4" />}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
