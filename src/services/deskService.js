import { apiFetch } from './apiClient'

export async function getDesksBySection(section, date) {
    return apiFetch(
        `/v1/desks/${section}?date=${date}`
    )
}