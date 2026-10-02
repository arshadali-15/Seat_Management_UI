import { useEffect, useMemo, useState } from 'react'
import { getDesksBySection, setDeskActiveStatus } from '../../services/deskService'
import { bookDesk, getDeskBookings } from '../../services/bookingService'
import { resetPassword, addUser } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

import { SECTIONS } from './constants'
import { getToday, getBookingErrorMessage } from './utils'
import ChairIcon from './components/ChairIcon'
import StatusDot from './components/StatusDot'
import DeskButton from './components/DeskButton'
import SectionSelector from './components/SectionSelector'
import SectionDeskMap from './components/SectionDeskMap'
import StatCard from './components/StatCard'
import BookingDetails from './components/BookingDetails'
import SuccessDialog from './components/SuccessDialog'

export default function Dashboard() {
    const { user, logout } = useAuth()
    const [desks, setDesks] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [selectedSection, setSelectedSection] = useState('CSM')
    const [date, setDate] = useState(() => getToday())
    const [bookingFromDate, setBookingFromDate] = useState(getToday())
    const [bookingToDate, setBookingToDate] = useState('')
    const [deskBookings, setDeskBookings] = useState([])
    const [loadingDeskBookings, setLoadingDeskBookings] = useState(false)
    const [updatingDeskStatus, setUpdatingDeskStatus] = useState(false)
    const [showResetPassword, setShowResetPassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [resetError, setResetError] = useState('')
    const [resetSuccess, setResetSuccess] = useState(false)

    const [showAddUser, setShowAddUser] = useState(false)
    const [newUserName, setNewUserName] = useState('')
    const [newUserEmail, setNewUserEmail] = useState('')
    const [newUserSlsId, setNewUserSlsId] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')
    const [addUserLoading, setAddUserLoading] = useState(false)
    const [addUserError, setAddUserError] = useState('')
    const [addUserSuccess, setAddUserSuccess] = useState(false)

    const [bookingLoading, setBookingLoading] = useState(false)

    const [dialog, setDialog] = useState({
        open: false,
        type: '',
        title: '',
        message: '',
        booking: null,
    })

    async function loadDesks(showLoader = true) {
        if (showLoader) setLoading(true)

        try {
            const data = await getDesksBySection(selectedSection, date)
            setDesks(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load desks:', err)

            setDialog({
                open: true,
                type:
                    err.errorCode === 'SESSION_EXPIRED'
                        ? 'SESSION_EXPIRED'
                        : 'error',
                title:
                    err.errorCode === 'SESSION_EXPIRED'
                        ? 'Session Expired'
                        : 'Failed to Load Desks',
                message: err.message || 'Unable to load desks.',
                booking: null,
            })
        } finally {
            if (showLoader) setLoading(false)
        }
    }

    async function handleResetPassword() {
        setResetError('')

        if (!currentPassword || !newPassword || !confirmPassword) {
            setResetError('Please fill in all password fields.')
            return
        }

        if (newPassword.length < 6) {
            setResetError('New password must be at least 6 characters.')
            return
        }

        if (newPassword !== confirmPassword) {
            setResetError('New password and confirm password do not match.')
            return
        }

        try {
            setResetLoading(true)

            await resetPassword(
                currentPassword,
                newPassword
            )

            setShowResetPassword(false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setResetSuccess(true)

        } catch (err) {
            console.error('Password reset failed:', err)

            setResetError(
                err.message || 'Failed to reset password.'
            )
        } finally {
            setResetLoading(false)
        }
    }

    async function handleAddUser() {
        setAddUserError('')

        if (
            !newUserName ||
            !newUserEmail ||
            !newUserSlsId ||
            !newUserPassword
        ) {
            setAddUserError('Please fill in all fields.')
            return
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(newUserEmail.trim())) {
            setAddUserError('Please enter a valid email address.')
            return
        }

        if (newUserPassword.length < 6 || newUserPassword.length > 20) {
            setAddUserError(
                'Password must be between 6 and 20 characters.'
            )
            return
        }

        if (newUserSlsId.length < 4 || newUserSlsId.length > 20) {
            setAddUserError(
                'Enter a valid SLS ID.'
            )
            return
        }

        try {
            setAddUserLoading(true)

            await addUser(
                newUserName,
                newUserEmail,
                newUserSlsId,
                newUserPassword
            )

            setShowAddUser(false)

            setNewUserName('')
            setNewUserEmail('')
            setNewUserSlsId('')
            setNewUserPassword('')

            setAddUserSuccess(true)

        } catch (err) {
            console.error('Failed to add user:', err)

            setAddUserError(
                err.message || 'Failed to add user.'
            )
        } finally {

            setNewUserName('')
            setNewUserEmail('')
            setNewUserSlsId('')
            setNewUserPassword('')

            setAddUserLoading(false)
        }
    }

    useEffect(() => {
        setSelected(null)
        setDeskBookings([])
        loadDesks(true)
        // The API intentionally reloads when either section OR date changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSection, date])

    const selectedDesk = desks.find(desk => desk.deskId === selected)

    const currentSection = SECTIONS.find(
        section => section.id === selectedSection
    )

    const stats = useMemo(
        () => ({
            total: desks.length,
            available: desks.filter(desk => desk.status === 'AVAILABLE').length,
            booked: desks.filter(desk => desk.status === 'BOOKED').length,
            inactive: desks.filter(desk => desk.status === 'INACTIVE').length,
        }),
        [desks]
    )

    function handleSectionChange(sectionId) {
        if (sectionId === selectedSection) return

        setSelectedSection(sectionId)
        setSelected(null)
        setDeskBookings([])
    }

    async function toggleSelect(desk) {
        if (desk.status === 'UNAVAILABLE') {
            return
        }

        if (desk.status === 'INACTIVE' && user?.role !== 'ADMIN') {
            return
        }

        if (desk.status === 'BOOKED') {
            setSelected(desk.deskId)
            setDeskBookings([])
            setLoadingDeskBookings(true)

            try {
                const bookings = await getDeskBookings(desk.deskId)
                setDeskBookings(Array.isArray(bookings) ? bookings : [])
            } catch (err) {
                console.error('Failed to fetch desk bookings:', err)
                setDeskBookings([])

                setDialog({
                    open: true,
                    type: 'error',
                    title: 'Error Fetching Bookings',
                    message:
                        err.message || 'Failed to fetch desk bookings.',
                    booking: null,
                })
            } finally {
                setLoadingDeskBookings(false)
            }

            return
        }

        const isSameDesk = selected === desk.deskId
        setSelected(isSameDesk ? null : desk.deskId)
        setDeskBookings([])

        if (!isSameDesk) {
            setBookingFromDate(date)
            setBookingToDate('')
        }
    }

    async function handleSetActiveStatus(isActive) {
        if (!selectedDesk || user?.role !== 'ADMIN') return

        try {
            setUpdatingDeskStatus(true)
            // if (selectedDesk.status == "BOOKED") {
            //     setDialog({
            //         open: true,
            //         type: 'error',
            //         title: 'Please cancel the existing booking.',
            //         booking: null,
            //     })

            //     return;
            // }

            await setDeskActiveStatus(selectedDesk.deskId, isActive)

            const updatedDesks = await getDesksBySection(
                selectedSection,
                date
            )

            const safeDesks = Array.isArray(updatedDesks) ? updatedDesks : []
            setDesks(safeDesks)

            const updatedSelectedDesk = safeDesks.find(
                desk => desk.deskId === selectedDesk.deskId
            )

            if (updatedSelectedDesk) {
                setSelected(updatedSelectedDesk.deskId)
            }
        } catch (err) {
            console.error('Failed to update desk status:', err)

            setDialog({
                open: true,
                type: 'error',
                title: 'Desk Status Update Failed',
                message: err.message || 'Unable to update desk status.',
                booking: null,
            })
        } finally {
            setUpdatingDeskStatus(false)
        }
    }

    function handleFromDateChange(value) {
        setBookingFromDate(value)

        if (bookingToDate && value > bookingToDate) {
            setBookingToDate(value)
        }
    }

    function closeDialog() {
        if (dialog.type === 'SESSION_EXPIRED') {
            sessionStorage.removeItem('accessToken')
            window.location.replace('/login')
            return
        }

        setDialog(prev => ({ ...prev, open: false }))
    }

    async function handleBook() {
        if (!selectedDesk) return

        if (!bookingFromDate) {
            setDialog({
                open: true,
                type: 'error',
                title: 'Booking Date Required',
                message: 'Please select a booking start date.',
                booking: null,
            })
            return
        }

        if (bookingToDate && bookingFromDate > bookingToDate) {
            setDialog({
                open: true,
                type: 'error',
                title: 'Invalid Date Range',
                message: 'To date cannot be earlier than From date.',
                booking: null,
            })
            return
        }

        try {
            const result = await bookDesk(
                selectedDesk.deskId,
                bookingFromDate,
                bookingToDate || null
            )

            await loadDesks(false)

            setSelected(null)
            setDeskBookings([])
            setBookingFromDate(date)
            setBookingToDate('')

            setDialog({
                open: true,
                type: 'success',
                title: 'Booking Successful',
                message: '',
                booking: result,
            })
        } catch (err) {
            console.error('Booking failed:', err)
            if (err.errorCode === 'SESSION_EXPIRED') {
                sessionStorage.removeItem('accessToken')
                window.location.href = '/login'
                return
            }
            setShowBookingConfirmation(false)
            setBookingError(getBookingErrorMessage(err))
        } finally {
            setBookingLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-base-200 p-4 lg:p-6">
            <div className="mx-auto max-w-[1500px]">
                <SuccessDialog dialog={dialog} onClose={closeDialog} />

                {selectedDesk && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <button
                            type="button"
                            aria-label="Close desk details"
                            className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
                            onClick={() => setSelected(null)}
                        />

                        <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-base-100 shadow-2xl">
                            <div className="shrink-0 border-b border-base-300 px-6 py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider opacity-50">
                                            Desk Details
                                        </p>

                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-200">
                                                <div className="h-7 w-7">
                                                    <ChairIcon
                                                        color={
                                                            selectedDesk.status ===
                                                                'BOOKED'
                                                                ? '#f87171'
                                                                : selectedDesk.status ===
                                                                    'AVAILABLE'
                                                                    ? '#22c55e'
                                                                    : '#94a3b8'
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <h2 className="text-xl font-bold">
                                                    Desk {selectedDesk.deskNumber}
                                                </h2>
                                                <p className="text-sm opacity-50">
                                                    {selectedDesk.type ||
                                                        'Regular Desk'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        aria-label="Close"
                                        onClick={() => setSelected(null)}
                                        className="btn btn-sm btn-circle btn-ghost"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                                <div
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${selectedDesk.status === 'BOOKED'
                                        ? 'border-error/30 bg-error/10'
                                        : selectedDesk.status === 'AVAILABLE'
                                            ? 'border-success/30 bg-success/10'
                                            : 'border-base-300 bg-base-200'
                                        }`}
                                >
                                    <div>
                                        <p className="text-xs opacity-50">
                                            Current status
                                        </p>
                                        <p className="mt-0.5 font-semibold">
                                            {selectedDesk.status}
                                        </p>
                                    </div>
                                    {/* <StatusDot status={selectedDesk.status} /> */}

                                    {user?.role === 'ADMIN' && (
                                        <div className="rounded-xl border border-base-300 bg-base-200/50">
                                            <div className="flex items-center justify-between gap-4">

                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${selectedDesk.status === 'INACTIVE'
                                                        ? 'btn-success'
                                                        : 'btn-error btn-outline'
                                                        }`}
                                                    disabled={
                                                        updatingDeskStatus ||
                                                        selectedDesk.status === 'UNAVAILABLE'
                                                    }
                                                    onClick={() =>
                                                        handleSetActiveStatus(
                                                            selectedDesk.status === 'INACTIVE'
                                                        )
                                                    }
                                                >
                                                    {updatingDeskStatus ? (
                                                        <span className="loading loading-spinner loading-xs" />
                                                    ) : selectedDesk.status === 'INACTIVE' ? (
                                                        'Activate'
                                                    ) : (
                                                        'Deactivate'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold">
                                        Desk Information
                                    </h3>

                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-base-200 p-4">
                                            <p className="text-xs opacity-50">
                                                Desk Number
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {selectedDesk.deskNumber}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-base-200 p-4">
                                            <p className="text-xs opacity-50">
                                                Type
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {selectedDesk.type || 'Regular'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedDesk.status === 'AVAILABLE' && (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold">
                                                Book this desk
                                            </h3>
                                            <span className="badge badge-success badge-sm">
                                                Available
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-4">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-medium opacity-60">
                                                    From date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingFromDate}
                                                    min={getToday()}
                                                    onChange={e =>
                                                        handleFromDateChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="input input-bordered w-full"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-xs font-medium opacity-60">
                                                    To date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingToDate}
                                                    min={
                                                        bookingFromDate ||
                                                        getToday()
                                                    }
                                                    onChange={e =>
                                                        setBookingToDate(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="input input-bordered w-full"
                                                />
                                            </div>

                                            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs opacity-75">
                                                Leave To date empty to book only the selected From date.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedDesk.status === 'BOOKED' && (
                                    <BookingDetails
                                        selectedDesk={selectedDesk}
                                        deskBookings={deskBookings}
                                        loading={loadingDeskBookings}
                                        onBookingCancelled={async () => {
                                            if (!selectedDesk) return

                                            try {
                                                // Refresh booking history
                                                const updatedBookings = await getDeskBookings(
                                                    selectedDesk.deskId
                                                )

                                                setDeskBookings(updatedBookings || [])

                                                // Refresh desk availability/status
                                                await loadDesks(false)
                                            } catch (err) {
                                                console.error(
                                                    'Failed to refresh after cancellation:',
                                                    err
                                                )
                                            }
                                        }}
                                    />
                                )}

                                {selectedDesk.status === 'UNAVAILABLE' && (
                                    <div className="mt-6 rounded-xl border border-warning/20 bg-warning/10 p-4">
                                        <p className="font-semibold text-warning">
                                            Desk unavailable
                                        </p>
                                        <p className="mt-1 text-sm opacity-70">
                                            This desk cannot currently be booked.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedDesk.status === 'AVAILABLE' && (
                                <div className="shrink-0 border-t border-base-300 bg-base-100 px-6 py-4">
                                    <button
                                        type="button"
                                        onClick={handleBook}
                                        disabled={!bookingFromDate || bookingLoading || loading}
                                        className="btn btn-primary w-full"
                                    >  {bookingLoading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Booking...
                                        </>
                                    ) : (
                                        'Book Desk'
                                    )}
                                        Book Desk {selectedDesk.deskNumber}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight">
                            Workspace Desk Booking
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Refresh */}
                        <button
                            type="button"
                            onClick={() => loadDesks(true)}
                            disabled={loading}
                            className="btn btn-outline btn-sm gap-2"
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <svg
                                    className="h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 4v6h6M20 20v-6h-6M19 9a7 7 0 00-12.5-3.8L4 7M5 15a7 7 0 0012.5 3.8L20 17"
                                    />
                                </svg>
                            )}

                            Refresh
                        </button>

                        {/* User Menu */}
                        <div className="dropdown dropdown-end">
                            <button
                                type="button"
                                tabIndex={0}
                                className="btn btn-ghost btn-sm gap-2 px-2"
                                aria-label="User menu"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-content">
                                    <span className="text-sm font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </button>
                            <ul
                                tabIndex={0}
                                className="dropdown-content menu z-[60] mt-2 w-64 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl"
                            >
                                {/* User information */}
                                <li className="pointer-events-none mb-1">
                                    <div className="flex items-center gap-3 rounded-xl px-3 py-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
                                            <span className="font-bold">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">
                                                {user?.name || 'User'}
                                            </p>

                                            <p className="truncate text-xs opacity-50">
                                                {user?.email || ''}
                                            </p>

                                            <span className="badge badge-ghost badge-xs mt-1">
                                                {user?.role || 'USER'}
                                            </span>
                                        </div>
                                    </div>
                                </li>

                                <div className="divider my-1" />

                                {/* My Bookings */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            window.location.href = '/myBookings'
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                                            />
                                        </svg>

                                        My Bookings
                                    </button>
                                </li>
                                {user?.role === 'ADMIN' && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAddUserError('')
                                                setShowAddUser(true)
                                            }}
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                                />
                                                <circle cx="9" cy="7" r="4" />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19 8v6M16 11h6"
                                                />
                                            </svg>

                                            Add User
                                        </button>
                                    </li>
                                )}
                                {user?.role === 'ADMIN' && (
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                window.location.href = '/users'
                                            }}
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                                />
                                                <circle cx="9" cy="7" r="4" />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M19 8v6M16 11h6"
                                                />
                                            </svg>

                                            Manage Users
                                        </button>
                                    </li>
                                )}

                                {/* Reset Password */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCurrentPassword('')
                                            setNewPassword('')
                                            setConfirmPassword('')
                                            setResetError('')
                                            setShowResetPassword(true)
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 7a3 3 0 1 0-6 0v2m-2 0h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm5 5v3"
                                            />
                                        </svg>

                                        Reset Password
                                    </button>
                                </li>

                                <div className="divider my-1" />

                                {/* Logout */}
                                <li>
                                    <button
                                        type="button"
                                        className="text-error"
                                        onClick={() => {
                                            logout()
                                            window.location.href = '/login'
                                        }}
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4 4-4-4-4m4 4H3"
                                            />
                                        </svg>

                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>

                <section className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-3">
                    <StatCard
                        label="Available"
                        value={stats.available}
                        tone="success"
                        helper={currentSection?.label}
                    />
                    <StatCard
                        label="Booked"
                        value={stats.booked}
                        tone="error"
                        helper={currentSection?.label}
                    />
                    <StatCard
                        label="Inactive"
                        value={stats.inactive}
                        tone="neutral"
                    />
                    {/* <StatCard
                        label="Unavailable"
                        value={stats.unavailable}
                        tone="warning"
                    /> */}
                    {/* <StatCard
                        label="Total"
                        value={stats.total}
                        tone="neutral"
                        helper={`of ${currentSection?.end - currentSection?.start + 1 || 0}`}
                    /> */}
                </section>

                <section className="mb-6">
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-bold">Floor Sections</h2>
                            <p className="text-sm opacity-60">
                                Choose an area to view its desks.
                            </p>
                        </div>
                    </div>

                    <SectionSelector
                        selectedSection={selectedSection}
                        onSectionChange={handleSectionChange}
                    />
                </section>

                <SectionDeskMap
                    desks={desks}
                    selectedSection={selectedSection}
                    selected={selected}
                    onDeskClick={toggleSelect}
                    date={date}
                    setDate={setDate}
                    loading={loading}
                    canManageInactive={user?.role === 'ADMIN'}
                />
            </div>
            {showAddUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

                    {/* Blurred background */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={() => {
                            if (!addUserLoading) {
                                setShowAddUser(false)
                            }
                        }}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-base-100 shadow-2xl">

                        {/* Header */}
                        <div className="border-b border-base-300 px-6 py-5">
                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <svg
                                        className="h-6 w-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                        />
                                        <circle cx="9" cy="7" r="4" />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 8v6M16 11h6"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold">
                                        Add New User
                                    </h3>

                                    <p className="text-sm opacity-60">
                                        Create an employee account
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6">

                            {addUserError && (
                                <div className="mb-5 rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">
                                    {addUserError}
                                </div>
                            )}

                            <div className="space-y-4">

                                {/* Name */}
                                <label className="form-control">
                                    <span className="mb-2 text-sm font-semibold">
                                        Full Name
                                    </span>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full rounded-xl"
                                        placeholder="Enter full name"
                                        value={newUserName}
                                        onChange={(e) =>
                                            setNewUserName(e.target.value.slice(0, 100))
                                        }
                                        minLength={3}
                                        maxLength={100}
                                        disabled={addUserLoading}
                                    />
                                </label>

                                {/* Email */}
                                <label className="form-control">
                                    <span className="mb-2 text-sm font-semibold">
                                        Email
                                    </span>

                                    <input
                                        type="email"
                                        className="input input-bordered w-full rounded-xl"
                                        placeholder="Enter email address"
                                        value={newUserEmail}
                                        onChange={(e) =>
                                            setNewUserEmail(e.target.value.slice(0, 150))
                                        }
                                        minLength={3}
                                        maxLength={150}
                                        disabled={addUserLoading}
                                    />
                                </label>

                                {/* SLS ID */}
                                <label className="form-control">
                                    <span className="mb-2 text-sm font-semibold">
                                        SLS ID
                                    </span>

                                    <input
                                        type="text"
                                        className="input input-bordered w-full rounded-xl"
                                        placeholder="Enter SLS ID"
                                        value={newUserSlsId}
                                        onChange={(e) =>
                                            setNewUserSlsId(e.target.value)
                                        }
                                        minLength={7}
                                        maxLength={10}
                                        disabled={addUserLoading}
                                    />
                                </label>

                                {/* Password */}
                                <label className="form-control">
                                    <span className="mb-2 text-sm font-semibold">
                                        Temporary Password
                                    </span>
                                    <div className="mt-1 flex justify-between text-xs opacity-50">
                                        <span> Minimum 8 characters</span>
                                        <span>{newUserPassword.length}/30</span>
                                    </div>

                                    <input
                                        type="password"
                                        className="input input-bordered w-full rounded-xl"
                                        placeholder="Enter password"
                                        value={newUserPassword}
                                        maxLength={20}
                                        onChange={(e) =>
                                            setNewUserPassword(
                                                e.target.value.slice(0, 20)
                                            )
                                        }
                                        disabled={addUserLoading}
                                    />
                                </label>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 border-t border-base-300 bg-base-200/40 px-6 py-4">

                            <button
                                type="button"
                                className="btn btn-ghost rounded-xl"
                                disabled={addUserLoading}
                                onClick={() => setShowAddUser(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary rounded-xl px-6"
                                disabled={addUserLoading}
                                onClick={handleAddUser}
                            >
                                {addUserLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 5v14M5 12h14"
                                            />
                                        </svg>
                                        Add User
                                    </>
                                )}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetPassword && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Blurred background */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={() => {
                            if (!resetLoading) setShowResetPassword(false)
                        }}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-base-100 shadow-2xl">

                        {/* Header */}
                        <div className="border-b border-base-300 px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <svg
                                        className="h-6 w-6"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <rect x="3" y="11" width="18" height="10" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold">
                                        Reset Password
                                    </h3>
                                    <p className="text-sm opacity-60">
                                        Update your account password
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6">

                            {resetError && (
                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">
                                    <svg
                                        className="mt-0.5 h-5 w-5 shrink-0"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="12" cy="12" r="9" />
                                        <path d="M12 8v4M12 16h.01" />
                                    </svg>

                                    <span>{resetError}</span>
                                </div>
                            )}

                            <div className="space-y-5">

                                {/* Current password */}
                                <label className="form-control">
                                    <span className="mb-2 text-sm font-semibold">
                                        Current Password
                                    </span>

                                    <div className="relative">
                                        <input
                                            type="password"
                                            className="input input-bordered w-full rounded-xl pr-4"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(e.target.value.slice(0, 30))
                                            }
                                            placeholder="Enter current password"
                                            disabled={resetLoading}
                                        />
                                    </div>
                                </label>

                                {/* New password */}
                                <label className="form-control">
                                    <span className="mb-2 text-sm font-semibold">
                                        New Password
                                    </span>
                                    <div className="mt-1 flex justify-between text-xs opacity-50">
                                        <span> Minimum 8 characters</span>
                                        <span>{newPassword.length}/30</span>
                                    </div>
                                    <input
                                        type="password"
                                        className="input input-bordered w-full rounded-xl"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value.slice(0, 30))
                                        }
                                        placeholder="Enter new password"
                                        minLength={6}
                                        maxLength={30}
                                        disabled={resetLoading}
                                    />
                                </label>

                                {/* Confirm password */}
                                <label className="form-control">
                                    <span className="mb-2 text-sm font-semibold">
                                        Confirm New Password
                                    </span>

                                    <input
                                        type="password"
                                        className={`input w-full rounded-xl ${confirmPassword &&
                                            newPassword !== confirmPassword
                                            ? 'input-error'
                                            : 'input-bordered'
                                            }`}
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value.slice(0, 30))
                                        }
                                        minLength={6}
                                        maxLength={30}
                                        placeholder="Confirm new password"
                                        disabled={resetLoading}
                                    />

                                    {confirmPassword &&
                                        newPassword !== confirmPassword && (
                                            <span className="mt-1.5 text-xs text-error">
                                                Passwords do not match
                                            </span>
                                        )}
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 border-t border-base-300 bg-base-200/40 px-6 py-4">
                            <button
                                type="button"
                                className="btn btn-ghost rounded-xl"
                                disabled={resetLoading}
                                onClick={() => setShowResetPassword(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary rounded-xl px-6"
                                disabled={resetLoading}
                                onClick={handleResetPassword}
                            >
                                {resetLoading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="h-4 w-4"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M20 7L10 17l-5-5" />
                                        </svg>
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Password Reset Success */}
            {resetSuccess && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl text-success">
                            ✓
                        </div>

                        <h3 className="mt-4 text-2xl font-bold">
                            Password Updated
                        </h3>

                        <p className="mt-2 text-sm opacity-60">
                            Your password has been changed successfully.
                        </p>

                        <div className="modal-action justify-center">
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={() => setResetSuccess(false)}
                            >
                                Done
                            </button>
                        </div>

                    </div>

                    <div
                        className="modal-backdrop"
                        onClick={() => setResetSuccess(false)}
                    />
                </div>
            )}

        </div>
    )
}

