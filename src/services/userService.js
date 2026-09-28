import { apiFetch } from './apiClient'

export async function getAllUsers() {
    return apiFetch('/v1/users')
}