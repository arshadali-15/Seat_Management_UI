import { useEffect, useMemo, useState } from 'react'
import { cancelBooking } from '../../services/bookingService'
import { getAllUsers } from '../../services/userService'
import { useNavigate } from 'react-router-dom'

function formatDate(date) {
    if (!date) return '-'

    const [year, month, day] = String(date).split('-')

    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    ).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export default function AdminUsers() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')

    const [expandedUser, setExpandedUser] = useState(null)

    const [bookingToCancel, setBookingToCancel] = useState(null)
    const [cancelling, setCancelling] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')

    async function loadUsers() {
        try {
            setLoading(true)
            setError('')

            const data = await getAllUsers()

            setUsers(Array.isArray(data) ? data : [])

        } catch (err) {
            console.error('Failed to load users:', err)

            if (
                err.status === 403 ||
                err.errorCode === 'ACCESS_DENIED'
            ) {
                setError(
                    'You are not authorized to access the User Management page.'
                )
            } else {
                setError(
                    err.message || 'Failed to load users.'
                )
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const filteredUsers = useMemo(() => {
        const value = search.trim().toLowerCase()

        if (!value) return users

        return users.filter(user =>
            user.name?.toLowerCase().includes(value) ||
            user.email?.toLowerCase().includes(value) ||
            user.slsId?.toLowerCase().includes(value)
        )
    }, [users, search])

    function toggleUser(userId) {
        setExpandedUser(current =>
            current === userId ? null : userId
        )
    }

    async function handleCancelBooking() {

        if (!bookingToCancel) return

        try {
            setCancelling(true)

            await cancelBooking(
                bookingToCancel.bookingId
            )

            setUsers(current =>
                current.map(user => ({
                    ...user,
                    bookings: user.bookings?.filter(
                        booking =>
                            booking.bookingId !==
                            bookingToCancel.bookingId
                    ) || [],
                }))
            )

            setSuccessMessage(
                `Desk ${bookingToCancel.deskNumber} booking for ${formatDate(
                    bookingToCancel.bookingDate
                )} has been cancelled.`
            )

            setBookingToCancel(null)

        } catch (err) {
            console.error(
                'Failed to cancel booking:',
                err
            )

            setError(
                err.message ||
                'Failed to cancel booking.'
            )

            setBookingToCancel(null)

        } finally {
            setCancelling(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-6">

            <div className="mx-auto max-w-6xl">

                {/* Header */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

                    <div>
                        <h1 className="text-3xl font-bold">
                            Manage Users
                        </h1>

                        <p className="mt-1 text-sm opacity-60">
                            View employees and manage their desk bookings
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

                {/* Search */}
                <div className="mb-5">
                    <input
                        type="text"
                        className="input input-bordered w-full rounded-xl"
                        placeholder="Search by name, email or SLS ID..."
                        value={search}
                        onChange={e =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-8 text-center shadow-sm">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-error">
                                <svg
                                    className="h-8 w-8"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v4M12 17h.01"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.3 3.7L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.7a2 2 0 00-3.4 0z"
                                    />
                                </svg>
                            </div>

                            <h2 className="mt-5 text-xl font-bold">
                                Access Denied
                            </h2>

                            <p className="mt-2 text-sm opacity-60">
                                You are not authorized to access User Management.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary mt-6 rounded-xl"
                                onClick={() => window.history.back()}
                            >
                                Go Back
                            </button>

                        </div>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="loading loading-spinner loading-lg" />
                    </div>
                ) : filteredUsers.length === 0 ? (

                    <div className="rounded-2xl border border-base-300 bg-base-100 p-10 text-center">
                        <p className="font-semibold">
                            No users found
                        </p>

                        <p className="mt-1 text-sm opacity-50">
                            Try a different search.
                        </p>
                    </div>

                ) : (

                    <div className="space-y-3">

                        {filteredUsers.map(user => {

                            const isExpanded =
                                expandedUser === user.userId

                            const bookings =
                                user.bookings || []

                            return (
                                <div
                                    key={user.userId}
                                    className="overflow-hidden rounded-2xl border border-base-300 bg-base-100"
                                >

                                    {/* User row */}
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-base-200/50"
                                        onClick={() =>
                                            toggleUser(user.userId)
                                        }
                                    >

                                        <div className="flex min-w-0 items-center gap-4">

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
                                                <span className="font-bold">
                                                    {user.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}
                                                </span>
                                            </div>

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-bold">
                                                        {user.name}
                                                    </p>

                                                    <span className="badge badge-ghost badge-sm">
                                                        {user.slsId}
                                                    </span>
                                                </div>

                                                <p className="truncate text-sm opacity-50">
                                                    {user.email}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="flex shrink-0 items-center gap-3">

                                            <span className="badge badge-primary badge-outline">
                                                {bookings.length}{' '}
                                                {bookings.length === 1
                                                    ? 'Booking'
                                                    : 'Bookings'}
                                            </span>

                                            <span className="text-lg opacity-50">
                                                {isExpanded ? '⌃' : '⌄'}
                                            </span>

                                        </div>

                                    </button>

                                    {/* Booking details */}
                                    {isExpanded && (
                                        <div className="border-t border-base-300 bg-base-200/30 p-5">

                                            {bookings.length === 0 ? (

                                                <div className="rounded-xl border border-dashed border-base-300 bg-base-100 p-6 text-center">
                                                    <p className="text-sm opacity-50">
                                                        No active bookings
                                                    </p>
                                                </div>

                                            ) : (

                                                <div className="space-y-3">

                                                    {bookings.map(
                                                        booking => (
                                                            <div
                                                                key={
                                                                    booking.bookingId
                                                                }
                                                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-base-300 bg-base-100 p-4"
                                                            >

                                                                <div className="flex items-center gap-4">

                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                        <svg
                                                                            className="h-5 w-5"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            strokeWidth="2"
                                                                        >
                                                                            <rect
                                                                                x="4"
                                                                                y="4"
                                                                                width="16"
                                                                                height="16"
                                                                                rx="2"
                                                                            />
                                                                            <path d="M8 9h8M8 13h5" />
                                                                        </svg>
                                                                    </div>

                                                                    <div>

                                                                        <p className="font-semibold">
                                                                            Desk{' '}
                                                                            {
                                                                                booking.deskNumber
                                                                            }
                                                                        </p>

                                                                        <p className="text-sm opacity-50">
                                                                            {
                                                                                formatDate(
                                                                                    booking.bookingDate
                                                                                )
                                                                            }
                                                                        </p>

                                                                    </div>

                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-error btn-sm"
                                                                        onClick={() =>
                                                                            setBookingToCancel(
                                                                                {
                                                                                    ...booking,
                                                                                    userName:
                                                                                        user.name,
                                                                                }
                                                                            )
                                                                        }
                                                                    >
                                                                        Cancel Booking
                                                                    </button>

                                                                </div>

                                                            </div>
                                                        )
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    )}

                                </div>
                            )
                        })}

                    </div>
                )}

            </div>

            {/* Cancel confirmation */}
            {bookingToCancel && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={() => {
                            if (!cancelling) {
                                setBookingToCancel(null)
                            }
                        }}
                    />

                    <div className="relative w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl">

                        <h3 className="text-xl font-bold">
                            Cancel Booking?
                        </h3>

                        <p className="mt-2 text-sm opacity-60">
                            You are about to cancel the booking for:
                        </p>

                        <div className="mt-5 rounded-xl bg-base-200 p-4">

                            <p className="font-bold">
                                {bookingToCancel.userName}
                            </p>

                            <p className="mt-1 text-sm opacity-60">
                                Desk {bookingToCancel.deskNumber}
                                {' · '}
                                {formatDate(
                                    bookingToCancel.bookingDate
                                )}
                            </p>

                        </div>

                        <p className="mt-4 text-sm text-warning">
                            This action will immediately release the desk.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                type="button"
                                className="btn btn-ghost"
                                disabled={cancelling}
                                onClick={() =>
                                    setBookingToCancel(null)
                                }
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
                                        <span className="loading loading-spinner loading-sm" />
                                        Cancelling...
                                    </>
                                ) : (
                                    'Cancel Booking'
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* Success */}
            {successMessage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={() =>
                            setSuccessMessage('')
                        }
                    />

                    <div className="relative w-full max-w-sm rounded-2xl bg-base-100 p-8 text-center shadow-2xl">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                            <svg
                                className="h-8 w-8"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <path d="M5 12l4 4L19 6" />
                            </svg>
                        </div>

                        <h3 className="mt-5 text-2xl font-bold">
                            Booking Cancelled
                        </h3>

                        <p className="mt-2 text-sm opacity-60">
                            {successMessage}
                        </p>

                        <button
                            type="button"
                            className="btn btn-success mt-6 w-full rounded-xl"
                            onClick={() =>
                                setSuccessMessage('')
                            }
                        >
                            Done
                        </button>

                    </div>
                </div>
            )}

        </div>
    )
}