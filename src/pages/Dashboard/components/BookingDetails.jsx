import { formatDate } from '../utils'
import { useAuth } from '../../../context/AuthContext'
import { cancelBooking } from '../../../services/bookingService'
import { useState } from 'react'

export default function BookingDetails({
    selectedDesk,
    deskBookings,
    loading,
    onBookingCancelled,
}) {
    const { user } = useAuth()

    const [bookingToCancel, setBookingToCancel] = useState(null)
    const [cancelling, setCancelling] = useState(false)
    const [cancelError, setCancelError] = useState('')

    const bookings = deskBookings.flatMap(item => {
        if (!Array.isArray(item.bookings)) return []

        return item.bookings.map(booking => ({
            bookingId: booking.bookingId,
            date: booking.date,
            status: item.status,
            bookedBy: item.bookedBy,
        }))
    })

    async function handleCancelBooking() {
        if (!bookingToCancel) return

        try {
            setCancelling(true)
            setCancelError('')

            await cancelBooking(bookingToCancel.bookingId)

            // Close confirmation dialog
            setBookingToCancel(null)

            // Tell Dashboard to refresh everything
            if (onBookingCancelled) {
                await onBookingCancelled()
            }
        } catch (err) {
            console.error('Failed to cancel booking:', err)

            setDialog({
                open: true,
                type: 'error',
                title: err.errorCode || 'Cancelling Failed',
                message:
                    err.errorDescription ||
                    'Unable to cancel the booking.',
                booking: null,
            })
        } finally {
            setCancelling(false)
        }
    }

    return (
        <>
            <div className="mt-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                        Current booking
                    </h3>

                    {bookings.length > 0 && (
                        <span className="badge badge-ghost">
                            {bookings.length}
                        </span>
                    )}
                </div>

                <div className="mt-3 space-y-3">
                    {loading && (
                        <div className="flex justify-center rounded-xl border border-base-300 bg-base-200 py-8">
                            <span className="loading loading-spinner loading-md" />
                        </div>
                    )}

                    {!loading && bookings.length > 0 &&
                        bookings.map(booking => (
                            <div
                                key={booking.bookingId}
                                className="rounded-xl border border-error/20 bg-error/5 p-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs opacity-50">
                                            Booked by
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {booking.bookedBy || 'Unknown'}
                                        </p>
                                    </div>

                                    <span className="badge badge-error badge-sm">
                                        BOOKED
                                    </span>
                                </div>

                                <div className="mt-4 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-xs opacity-50">
                                            Booking date
                                        </p>

                                        <p className="mt-1 text-sm font-medium">
                                            {formatDate(booking.date)}
                                        </p>
                                    </div>

                                    {user?.role === 'ADMIN' && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-error btn-outline"
                                            disabled={cancelling}
                                            onClick={() =>
                                                setBookingToCancel(booking)
                                            }
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    }

                    {!loading && bookings.length === 0 && (
                        <div className="rounded-xl border border-base-300 bg-base-200 p-4 text-sm opacity-60">
                            No booking details are available for this desk.
                        </div>
                    )}
                </div>
            </div>

            {/* Cancel confirmation */}
            {bookingToCancel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl">

                        <h3 className="text-lg font-bold">
                            Cancel Booking?
                        </h3>

                        <p className="mt-2 text-sm opacity-70">
                            Are you sure you want to cancel this booking?
                        </p>

                        <div className="mt-4 rounded-xl bg-base-200 p-4">
                            <div className="flex justify-between">
                                <span className="text-xs opacity-50">
                                    Desk
                                </span>

                                <span className="font-semibold">
                                    Desk {selectedDesk?.deskNumber}
                                </span>
                            </div>

                            <div className="mt-2 flex justify-between">
                                <span className="text-xs opacity-50">
                                    Booking date
                                </span>

                                <span className="font-semibold">
                                    {formatDate(bookingToCancel.date)}
                                </span>
                            </div>

                            <div className="mt-2 flex justify-between">
                                <span className="text-xs opacity-50">
                                    Booked by
                                </span>

                                <span className="font-semibold">
                                    {bookingToCancel.bookedBy || 'Unknown'}
                                </span>
                            </div>
                        </div>

                        {cancelError && (
                            <div className="alert alert-error mt-4 text-sm">
                                {cancelError}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                disabled={cancelling}
                                onClick={() => {
                                    setBookingToCancel(null)
                                    setCancelError('')
                                }}
                            >
                                Keep Booking
                            </button>

                            <button
                                type="button"
                                className="btn btn-error"
                                disabled={cancelling}
                                onClick={handleCancelBooking}
                            >
                                {cancelling ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs" />
                                        Cancelling...
                                    </>
                                ) : (
                                    'Yes, Cancel'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}