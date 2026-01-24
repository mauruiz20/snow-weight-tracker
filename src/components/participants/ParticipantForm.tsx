'use client'

import { Button, Input, Select } from '@/components/ui'
import type { Participant } from '@/types/database.types'
import { type FormEvent, useState } from 'react'
import { HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2'

interface ParticipantFormData {
  name: string
  age: number
  gender: 'male' | 'female'
  initial_weight: number
  target_weight?: number | null
  height: number
  created_at?: string
}

interface ParticipantFormProps {
  participant?: Participant
  onSubmit: (data: ParticipantFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export const ParticipantForm = ({
  participant,
  onSubmit,
  onCancel,
  isLoading = false,
}: ParticipantFormProps) => {
  const [name, setName] = useState(participant?.name || '')
  const [age, setAge] = useState(participant?.age?.toString() || '')
  const [gender, setGender] = useState<'male' | 'female'>(participant?.gender || 'male')
  const [initialWeight, setInitialWeight] = useState(participant?.initial_weight?.toString() || '')
  const [targetWeight, setTargetWeight] = useState(participant?.target_weight?.toString() || '')
  const [height, setHeight] = useState(participant?.height?.toString() || '')
  const [initialDate, setInitialDate] = useState(() => {
    if (participant?.created_at) {
      return new Date(participant.created_at).toISOString().split('T')[0]
    }
    return ''
  })
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

    // Validate target weight if provided
    let targetWeightNum: number | null = null
    if (targetWeight) {
      targetWeightNum = Number.parseFloat(targetWeight)
      if (isNaN(targetWeightNum) || targetWeightNum <= 0 || targetWeightNum >= 500) {
        setError('El peso objetivo debe estar entre 0.01 y 499.99 kg')
        return
      }
    }

    try {
      const data: ParticipantFormData = {
        name: name.trim(),
        age: ageNum,
        gender,
        initial_weight: weightNum,
        target_weight: targetWeightNum,
        height: heightNum,
      }

      // Include created_at when editing and date is provided
      if (isEditing && initialDate) {
        data.created_at = new Date(initialDate).toISOString()
      }

      await onSubmit(data)
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

      <Select
        id="gender"
        label="Sexo"
        value={gender}
        onChange={(e) => setGender(e.target.value as 'male' | 'female')}
        disabled={isLoading}
        options={[
          { value: 'male', label: 'Masculino' },
          { value: 'female', label: 'Femenino' },
        ]}
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
        id="targetWeight"
        label="Peso Objetivo (kg)"
        type="number"
        value={targetWeight}
        onChange={(e) => setTargetWeight(e.target.value)}
        placeholder="Ingresa tu peso objetivo (opcional)"
        step={0.01}
        min={0.01}
        max={499.99}
        disabled={isLoading}
        helperText="El peso que deseas alcanzar para el viaje."
      />

      {isEditing && (
        <Input
          id="initialDate"
          label="Fecha de Registro Inicial"
          type="date"
          value={initialDate}
          onChange={(e) => setInitialDate(e.target.value)}
          disabled={isLoading}
          helperText="La fecha en que se registró el peso inicial. Afecta los cálculos de tendencia."
        />
      )}

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
