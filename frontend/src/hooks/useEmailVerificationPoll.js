import { useEffect, useRef } from 'react'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

// Poll périodiquement /auth/me pour détecter la vérification email sans re-login
export function useEmailVerificationPoll(enabled, { interval = 5000, onVerified } = {}) {
  const timerRef = useRef(null)
  const { refreshUser } = useAuth()

  useEffect(() => {
    if (!enabled) return

    const tick = async () => {
      try {
        const { data } = await apiClient.get('/auth/me')
        if (data?.user?.email_verified_at) {
          clearInterval(timerRef.current)
          await refreshUser()
          onVerified?.(data.user)
        }
      } catch (_) {
        // ignorer erreurs passagères
      }
    }

    timerRef.current = setInterval(tick, interval)
    return () => clearInterval(timerRef.current)
  }, [enabled, interval, onVerified, refreshUser])
}
