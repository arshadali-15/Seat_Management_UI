import { apiFetch } from './apiClient'

export async function bookDesk(deskId, fromDate, toDate) {
    return apiFetch('/v1/bookings', {
        method: 'POST',
        body: JSON.stringify({
            deskId,
            fromDate,
            toDate,
        }),
    })
}

export async function getDeskBookings(deskId) {
    return apiFetch(`/v1/bookings/desk/${deskId}`)
}

export async function getMyBookings() {
    return apiFetch('/v1/bookings/myBookings')
}

export async function cancelBooking(bookingId) {
    return apiFetch(`/v1/bookings/cancel/${bookingId}`, {
        method: 'PUT',
    })
}