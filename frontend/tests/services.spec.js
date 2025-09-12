import { describe, it, expect, beforeEach, vi } from 'vitest'
import api from '../src/services/apiClient'
import { login, logout } from '../src/services/authService'

describe('services', () => {
	beforeEach(() => {
		localStorage.clear()
		vi.restoreAllMocks()
	})

	it('apiClient attaches Authorization header from localStorage', async () => {
		localStorage.setItem('auth', JSON.stringify({ token: 'tok123' }))

		// mock axios request adapter so we don't actually send network requests
		const spy = vi.spyOn(api, 'request').mockImplementation((config) => {
			return Promise.resolve({ data: { ok: true }, config })
		})

		const resp = await api.get('/test')
		expect(resp.config.headers.Authorization).toBe('Bearer tok123')
		spy.mockRestore()
	})

	it('login stores token in localStorage', async () => {
		const fakeResponse = { data: { token: 'mytoken', user: { id: 1 } } }
		const postSpy = vi.spyOn(api, 'post').mockResolvedValue(fakeResponse)

		const data = await login({ email: 'a', password: 'b' })
		expect(localStorage.getItem('auth')).toBe(JSON.stringify({ token: 'mytoken' }))
		expect(data).toEqual(fakeResponse.data)

		postSpy.mockRestore()
	})

	it('logout clears auth', () => {
		localStorage.setItem('auth', JSON.stringify({ token: 'x' }))
		logout()
		expect(localStorage.getItem('auth')).toBeNull()
	})
})

