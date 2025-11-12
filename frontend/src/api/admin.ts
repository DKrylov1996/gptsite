import { api } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export async function login (payload: LoginPayload) {
  const { data } = await api.post<{ token: string }>('/admin/login', payload)
  return data
}
