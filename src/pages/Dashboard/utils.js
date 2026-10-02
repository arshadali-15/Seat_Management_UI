export function getToday() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function getBookingErrorMessage(error) {
    switch (error.errorCode) {
        case 'DESK_NOT_ACTIVE':
            return 'This desk is currently inactive and cannot be booked.'

        case 'DESK_UNAVAILABLE':
            return 'This desk is currently unavailable.'

        case 'INVALID_BOOKING_DATE':
            return 'You cannot book a date in the past.'

        case 'INVALID_DATE_RANGE':
            return 'The end date cannot be before the start date.'

        case 'BOOKING_CONFLICTS':
            return error.message || 'None of the selected dates are available.'

        case 'DESK_ALREADY_BOOKED':
            return 'This desk was just booked by another user. Please refresh and select another desk.'

        case 'SESSION_EXPIRED':
            return 'Your session has expired. Please log in again.'

        default:
            return error.message || 'Unable to complete the booking. Please try again.'
    }
}

export function formatDate(date) {
    if (!date) return '-'

    const [year, month, day] = String(date).split('-')
    if (!year || !month || !day) return date

    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(
        'en-IN',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }
    )
}

export function getSkipReason(reason) {
    switch (reason) {
        case 'USER_ALREADY_BOOKED':
            return 'You already have a booking'
        case 'DESK_ALREADY_BOOKED':
            return 'Desk was already booked'
        default:
            return reason || 'Date was unavailable'
    }
}

