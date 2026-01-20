'use client'

import { Button, Input } from '@/components/ui'
import type { Participant } from '@/types/database.types'
import { type FormEvent, useState } from 'react'
import { HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2'

interface ParticipantFormData {
  name: string
  age: number
  initial_weight: number
  height: number
}

interface ParticipantFormProps {
  participant?: Participant
  onSubmit: (data: ParticipantFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function ParticipantForm({
  participant,
  onSubmit,
  onCancel,
  isLoading = false,
}: ParticipantFormProps) {
  const [name, setName] = useState(participant?.name || '')
  const [age, setAge] = useState(participant?.age?.toString() || '')
  const [initialWeight, setInitialWeight] = useState(participant?.initial_weight?.toString() || '')
  const [height, setHeight] = useState(participant?.height?.toString() || '')
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!participant

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const ageNum = Number.parseInt(age, 10)
    const weightNum = Number.parseFloat(initialWeight)
    const heightNum = Number.parseFloat(height)

    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (isNaN(ageNum) || ageNum <= 0 || ageNum >= 150) {
      setError('La edad debe estar entre 1 y 149')
      return
    }

    if (isNaN(weightNum) || weightNum <= 0 || weightNum >= 500) {
      setError('El peso inicial debe estar entre 0.01 y 499.99 kg')
      return
    }

    if (isNaN(heightNum) || heightNum <= 0 || heightNum >= 300) {
      setError('La altura debe estar entre 0.1 y 299.9 cm')
      return
    }

    try {
      await onSubmit({
        name: name.trim(),
        age: ageNum,
        initial_weight: weightNum,
        height: heightNum,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <Input
        id="name"
        label="Nombre"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ingresa tu nombre"
        disabled={isLoading}
        required
      />

      <Input
        id="age"
        label="Edad"
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        placeholder="Ingresa tu edad"
        min={1}
        max={149}
        disabled={isLoading}
        required
      />

      <Input
        id="initialWeight"
        label="Peso Inicial (kg)"
        type="number"
        value={initialWeight}
        onChange={(e) => setInitialWeight(e.target.value)}
        placeholder="Ingresa tu peso inicial en kg"
        step={0.01}
        min={0.01}
        max={499.99}
        disabled={isLoading}
        required
      />

      <Input
        id="height"
        label="Altura (cm)"
        type="number"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        placeholder="Ingresa tu altura en cm"
        step={0.1}
        min={0.1}
        max={299.9}
        disabled={isLoading}
        required
      />

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          icon={<HiOutlineCheck className="h-4 w-4" />}
          className="flex-1"
        >
          {isLoading ? 'Guardando...' : isEditing ? 'Actualizar Perfil' : 'Registrarse'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            icon={<HiOutlineXMark className="h-4 w-4" />}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
