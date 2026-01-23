'use client'

export const dynamic = 'force-dynamic'

import { LeaderboardTable } from '@/components/stats/LeaderboardTable'
import { WeightProgressChart } from '@/components/stats/WeightProgressChart'
import { LinkButton } from '@/components/ui'
import { useLoading } from '@/contexts/LoadingContext'
import { useParticipants } from '@/hooks/useParticipants'
import { useWeightChartData } from '@/hooks/useWeightChartData'
import { useEffect, useState } from 'react'
import {
  HiOutlineClock,
  HiOutlineQuestionMarkCircle,
  HiOutlineShieldCheck,
  HiOutlineUserPlus,
  HiOutlineUsers
} from 'react-icons/hi2'

const TARGET_DATE = new Date('2026-08-01T00:00:00')

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const calculateTimeLeft = (): TimeLeft => {
  const now = new Date()
  const difference = TARGET_DATE.getTime() - now.getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  }
}

export default function Dashboard() {
  const {
    rankings,
    loading: participantsLoading,
    error
  } = useParticipants({ includeRankings: true })
  const { loading: chartLoading } = useWeightChartData()
  const { setInitialLoadComplete } = useLoading()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Track initial load completion
  useEffect(() => {
    if (!participantsLoading && !chartLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setInitialLoadComplete()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [participantsLoading, chartLoading, setInitialLoadComplete])

  return (
    <div className='bg-mesh min-h-screen py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='animate-fade-in-up mb-8 pt-8 text-center sm:pt-0'>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white'>
            🏔️ Snow Weight Tracker
          </h1>
          <p className='mx-auto mt-3 max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400'>
            <strong>Objetivo:</strong> Viaje a Chile el 1 de agosto de 2026 🇨🇱
          </p>
          <p className='mx-auto mt-2 max-w-2xl text-sm text-gray-500 sm:text-base dark:text-gray-400'>
            La meta es hacer snowboard la mayor cantidad de días posibles y
            pasarla bien entre amigos. ¡Ponte en forma para disfrutar al máximo
            las montañas! 🏂
          </p>

          {/* Countdown */}
          <div className='mt-6'>
            <p className='mb-3 text-sm font-medium text-gray-500 dark:text-gray-400'>
              ⏱️ Tiempo restante para el viaje
            </p>
            <div className='flex justify-center gap-2 sm:gap-4'>
              <div className='rounded-lg bg-linear-to-br from-blue-500 to-blue-600 px-3 py-2 text-white shadow-lg sm:px-4 sm:py-3'>
                <div className='text-2xl font-bold sm:text-3xl'>
                  {timeLeft.days}
                </div>
                <div className='text-xs uppercase tracking-wide opacity-80'>
                  Días
                </div>
              </div>
              <div className='rounded-lg bg-linear-to-br from-green-500 to-green-600 px-3 py-2 text-white shadow-lg sm:px-4 sm:py-3'>
                <div className='text-2xl font-bold sm:text-3xl'>
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
                <div className='text-xs uppercase tracking-wide opacity-80'>
                  Horas
                </div>
              </div>
              <div className='rounded-lg bg-linear-to-br from-amber-500 to-amber-600 px-3 py-2 text-white shadow-lg sm:px-4 sm:py-3'>
                <div className='text-2xl font-bold sm:text-3xl'>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
                <div className='text-xs uppercase tracking-wide opacity-80'>
                  Min
                </div>
              </div>
              <div className='rounded-lg bg-linear-to-br from-purple-500 to-purple-600 px-3 py-2 text-white shadow-lg sm:px-4 sm:py-3'>
                <div className='text-2xl font-bold sm:text-3xl'>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className='text-xs uppercase tracking-wide opacity-80'>
                  Seg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='animate-fade-in-up stagger-1 mb-8 flex flex-wrap justify-center gap-3'>
          <LinkButton
            href='/participants/new'
            size='lg'
            icon={<HiOutlineUserPlus className='h-5 w-5' />}
            className='btn-press'
          >
            Registrarse Ahora
          </LinkButton>
          <LinkButton
            href='/participants'
            variant='secondary'
            size='lg'
            icon={<HiOutlineUsers className='h-5 w-5' />}
            className='btn-press'
          >
            Ver Participantes
          </LinkButton>
        </div>

        {/* Leaderboard */}
        <div className='animate-fade-in-up stagger-2 card-hover rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6 dark:bg-gray-800/80'>
          <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h2 className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>
                Tabla de Posiciones
              </h2>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Clasificación por pérdida de peso (mejores resultados primero)
              </p>
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              {rankings.length} participante{rankings.length !== 1 ? 's' : ''}
            </div>
          </div>

          {error && (
            <div className='mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/30'>
              <p className='text-sm text-red-700 dark:text-red-400'>{error}</p>
            </div>
          )}

          <LeaderboardTable rankings={rankings} loading={participantsLoading} />
        </div>

        {/* Weight Progress Chart */}
        <div className='animate-fade-in-up stagger-3 mt-8 card-hover rounded-lg bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6 dark:bg-gray-800/80'>
          <div className='mb-6'>
            <h2 className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>
              📈 Progreso de Peso
            </h2>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Evolución del peso de todos los participantes a lo largo del
              tiempo
            </p>
          </div>
          <WeightProgressChart />
        </div>

        {/* Info Section */}
        <div className='mt-8 grid gap-6 md:grid-cols-3'>
          <div className='animate-fade-in-up stagger-4 card-hover rounded-lg border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80'>
            <div className='mb-3 flex items-center gap-2'>
              <HiOutlineQuestionMarkCircle className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Cómo Funciona
              </h3>
            </div>
            <ul className='space-y-2 text-sm text-gray-600 dark:text-gray-400'>
              <li>1. Regístrate con tu información</li>
              <li>2. Registra tu peso cada semana</li>
              <li>3. Compite en la tabla de posiciones</li>
              <li>4. ¡Llega en forma a Chile! 🏂</li>
            </ul>
          </div>

          <div className='animate-fade-in-up stagger-5 card-hover rounded-lg border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80'>
            <div className='mb-3 flex items-center gap-2'>
              <HiOutlineClock className='h-6 w-6 text-green-600 dark:text-green-400' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                La Meta 🎯
              </h3>
            </div>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Estar en la mejor forma posible para disfrutar el snowboard en
              Chile. Más días en la montaña, menos cansancio, ¡más diversión con
              los amigos!
            </p>
          </div>

          <div className='animate-fade-in-up card-hover rounded-lg border border-gray-200/50 bg-white/80 p-6 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/80'>
            <div className='mb-3 flex items-center gap-2'>
              <HiOutlineShieldCheck className='h-6 w-6 text-amber-600 dark:text-amber-400' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Nota de Privacidad
              </h3>
            </div>
            <ul className='space-y-1.5 text-sm text-gray-600 dark:text-gray-400'>
              <li>• Este es un rastreador público y visible para todos</li>
              <li>• Sé honesto: no falsifiques ni inventes datos</li>
              <li>• Sé constante: registra tu peso regularmente</li>
              <li>• Respeta a los demás participantes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
