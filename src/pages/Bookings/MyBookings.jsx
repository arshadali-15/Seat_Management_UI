import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cancelBooking, getMyBookings } from '../../services/bookingService'

function MyBookings() {
    const navigate = useNavigate()

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [bookingToCancel, setBookingToCancel] = useState(null)
    const [cancelling, setCancelling] = useState(false)

    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        loadBookings()
    }, [])

    async function loadBookings() {
        try {
            setLoading(true)
            setError('')

            const data = await getMyBookings()

            setBookings(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load bookings:', error)
            setError(error.message || 'Failed to load your bookings.')
        } finally {
            setLoading(false)
        }
    }

    function openCancelModal(booking) {
        setBookingToCancel(booking)
    }

    function closeCancelModal() {
        if (cancelling) return
        setBookingToCancel(null)
    }

    async function handleCancel() {
        if (!bookingToCancel) return

        try {
            setCancelling(true)

            await cancelBooking(bookingToCancel.bookingId)

            setBookings((current) =>
                current.filter(
                    (booking) =>
                        booking.bookingId !== bookingToCancel.bookingId
                )
            )

            setBookingToCancel(null)

            setSuccessMessage(
                `Desk ${bookingToCancel.deskNumber} booking for ${formatDate(
                    bookingToCancel.bookingDate
                )} has been cancelled successfully.`
            )
        } catch (error) {
            console.error('Failed to cancel booking:', error)

            setBookingToCancel(null)

            setError(
                error.message || 'Failed to cancel the booking.'
            )
        } finally {
            setCancelling(false)
        }
    }

    function closeSuccessPopup() {
        setSuccessMessage('')
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-6">
            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            My Bookings
                        </h1>

                        <p className="mt-1 text-sm opacity-60">
                            View and manage your desk bookings.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/dashboard')}
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-base-300 bg-base-100">
                        <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="alert alert-error mb-4">
                        <div>
                            <h3 className="font-semibold">
                                Something went wrong
                            </h3>

                            <p className="text-sm">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => setError('')}
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && bookings.length === 0 && (
                    <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-base-300 bg-base-100">
                        <div className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-base-200 text-3xl">
                                📅
                            </div>

                            <h2 className="mt-4 text-xl font-semibold">
                                No bookings found
                            </h2>

                            <p className="mt-1 text-sm opacity-60">
                                You don't have any desk bookings yet.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary mt-5"
                                onClick={() => navigate('/dashboard')}
                            >
                                Book a Desk
                            </button>
                        </div>
                    </div>
                )}

                {/* Bookings */}
                {!loading && bookings.length > 0 && (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.bookingId}
                                booking={booking}
                                onCancel={openCancelModal}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {bookingToCancel && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md">

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error/10 text-2xl">
                                ⚠️
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">
                                    Cancel Booking?
                                </h3>

                                <p className="mt-1 text-sm opacity-60">
                                    Are you sure you want to cancel this booking?
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl bg-base-200 p-4">
                            <div className="flex justify-between">
                                <span className="text-sm opacity-60">
                                    Desk
                                </span>

                                <span className="font-semibold">
                                    {bookingToCancel.deskNumber}
                                </span>
                            </div>

                            <div className="mt-3 flex justify-between">
                                <span className="text-sm opacity-60">
                                    Booking Date
                                </span>

                                <span className="font-semibold">
                                    {formatDate(
                                        bookingToCancel.bookingDate
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                disabled={cancelling}
                                onClick={closeCancelModal}
                            >
                                Keep Booking
                            </button>

                            <button
                                type="button"
                                className="btn btn-error"
                                disabled={cancelling}
                                onClick={handleCancel}
                            >
                                {cancelling ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Cancelling...
                                    </>
                                ) : (
                                    'Yes, Cancel'
                                )}
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={closeCancelModal}
                    />
                </div>
            )}

            {/* Success Popup */}
            {successMessage && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl">
                            ✓
                        </div>

                        <h3 className="mt-4 text-2xl font-bold">
                            Booking Cancelled
                        </h3>

                        <p className="mt-2 text-sm opacity-60">
                            {successMessage}
                        </p>

                        <div className="modal-action justify-center">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={closeSuccessPopup}
                            >
                                Done
                            </button>
                        </div>
                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={closeSuccessPopup}
                    />
                </div>
            )}
        </div>
    )
}

function BookingCard({ booking, onCancel }) {
    const status = booking.status || 'BOOKED'
    const isBooked = status === 'BOOKED'

    return (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">

            <div className="flex flex-wrap items-start justify-between gap-4">

                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold">
                            Desk {booking.deskNumber}
                        </h2>

                        <span
                            className={`badge ${isBooked
                                    ? 'badge-success'
                                    : 'badge-ghost'
                                }`}
                        >
                            {status}
                        </span>
                    </div>

                    <p className="mt-1 text-xs opacity-40">
                        Booking ID: {booking.bookingId}
                    </p>
                </div>

                {isBooked && (
                    <button
                        type="button"
                        className="btn btn-error btn-outline btn-sm"
                        onClick={() => onCancel(booking)}
                    >
                        Cancel Booking
                    </button>
                )}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-xl bg-base-200 p-4">
                    <p className="text-xs font-medium uppercase opacity-50">
                        Booking Date
                    </p>

                    <p className="mt-1 font-semibold">
                        {formatDate(booking.bookingDate)}
                    </p>
                </div>

                <div className="rounded-xl bg-base-200 p-4">
                    <p className="text-xs font-medium uppercase opacity-50">
                        Booked By
                    </p>

                    <p className="mt-1 font-semibold">
                        {booking.bookedBy || 'You'}
                    </p>
                </div>

            </div>
        </div>
    )
}

function formatDate(date) {
    if (!date) return '-'

    const parsed = new Date(`${date}T00:00:00`)

    if (Number.isNaN(parsed.getTime())) {
        return date
    }

    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export default MyBookings