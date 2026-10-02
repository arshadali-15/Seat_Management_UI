import { apiFetch } from './apiClient'

export async function getDesksBySection(section, date) {
    return apiFetch(
        `/v1/desks/${section}?date=${date}`
    )
}

export async function setDeskActiveStatus(deskId, isActive) {
    return apiFetch(
        `/v1/desks/status/${deskId}?isActive=${isActive}`,
        {
            method: 'PATCH',
        }
    )
}