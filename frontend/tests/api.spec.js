import { describe, it, expect, beforeEach } from 'vitest'
import { buildAuthHeaders } from '../src/utils/api'

describe('api utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('builds Authorization header when token present', () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'abc123' }))
    const headers = buildAuthHeaders()
    expect(headers.Authorization).toBe('Bearer abc123')
  })

  it('returns empty headers when no token', () => {
    const headers = buildAuthHeaders()
    expect(headers.Authorization).toBeUndefined()
  })
})
