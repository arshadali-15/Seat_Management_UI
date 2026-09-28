import { useEffect, useMemo, useState } from 'react'
import { getDesksBySection } from '../../services/deskService'
import { bookDesk, getDeskBookings } from '../../services/bookingService'
import { resetPassword, addUser } from '../../services/authService'
const SEATS_PER_ROW = 20
const AISLE_AFTER = 40
import { useAuth } from '../../context/AuthContext'

const SECTIONS = [
    {
        id: 'CSM',
        label: 'CSM',
        description: 'Customer Success Management',
        start: 1,
        end: 50,
    },
    {
        id: 'BOTTOM',
        label: 'Bottom',
        description: 'Bottom Wing',
        start: 51,
        end: 150,
    },
    {
        id: 'RIGHT',
        label: 'Right',
        description: 'Right Wing',
        start: 151,
        end: 200,
    },
    {
        id: 'TOP',
        label: 'Top',
        description: 'Bay Area',
        start: 201,
        end: 230,
    },
]

function getToday() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function getBookingErrorMessage(error) {
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

function formatDate(date) {
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

function getSkipReason(reason) {
    switch (reason) {
        case 'USER_ALREADY_BOOKED':
            return 'You already have a booking'
        case 'DESK_ALREADY_BOOKED':
            return 'Desk was already booked'
        default:
            return reason || 'Date was unavailable'
    }
}

function ChairIcon({ color = 'currentColor' }) {
    return (
        <svg
            viewBox="0 0 25 25"
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            aria-hidden="true"
        >
            <rect x="5" y="3" width="14" height="6" rx="2" />
            <rect x="4" y="10" width="16" height="5" rx="2" />
            <rect x="5" y="15" width="2.5" height="6" rx="1" />
            <rect x="16.5" y="15" width="2.5" height="6" rx="1" />
            <rect x="2" y="9" width="3" height="2" rx="1" />
            <rect x="19" y="9" width="3" height="2" rx="1" />
        </svg>
    )
}

function StatusDot({ status }) {
    const className =
        status === 'AVAILABLE'
            ? 'bg-success'
            : status === 'BOOKED'
                ? 'bg-error'
                : status === 'INACTIVE'
                    ? 'bg-base-content/25'
                    : 'bg-warning'

    return <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
}

function DeskButton({ desk, isSelected, onClick, isTopRow }) {
    const isBooked = desk.status === 'BOOKED'
    const isInactive = desk.status === 'INACTIVE'
    const isUnavailable = desk.status === 'UNAVAILABLE'
    const isDisabled = isInactive || isUnavailable

    let containerClass = ''
    let iconColor = ''

    if (isInactive) {
        containerClass =
            'border-base-300 bg-base-300/60 text-base-content/30 cursor-not-allowed'
        iconColor = '#94a3b8'
    } else if (isUnavailable) {
        containerClass =
            'border-warning/30 bg-warning/10 text-warning cursor-not-allowed'
        iconColor = '#f59e0b'
    } else if (isBooked) {
        containerClass =
            'border-error/30 bg-error/10 text-error hover:bg-error/15 cursor-pointer'
        iconColor = '#fb7185'
    } else if (isSelected) {
        containerClass =
            'border-primary bg-primary text-primary-content ring-4 ring-primary/20 shadow-lg scale-105'
        iconColor = 'white'
    } else {
        containerClass =
            'border-success/30 bg-success/5 text-success hover:bg-success/15 hover:border-success hover:-translate-y-0.5 hover:shadow-md cursor-pointer'
        iconColor = '#22c55e'
    }

    return (
        <div className="group relative flex justify-center">
            <div
                className={`pointer-events-none invisible absolute left-1/2 z-30 w-max -translate-x-1/2 rounded-lg bg-neutral px-3 py-2 text-xs text-neutral-content opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100
                     ${isTopRow
                        ? 'top-[calc(100%+8px)]'
                        : 'bottom-[calc(100%+8px)]'
                    }`}
            >
                <div className="font-semibold">
                    Desk {desk.deskNumber}
                </div>
                <div className="mt-0.5 opacity-70">{desk.status}</div>
                {desk.bookedBy && (
                    <div className="mt-1 max-w-40 truncate opacity-80">
                        {desk.bookedBy}
                    </div>
                )}
            </div>

            <button
                type="button"
                disabled={isDisabled}
                aria-label={`Desk ${desk.deskNumber}, ${desk.status}`}
                aria-pressed={isSelected}
                onClick={() => onClick(desk)}
                className={`relative aspect-square w-16 rounded-xl border transition-all duration-150 select-none ${containerClass}`}
            >
                <div className="flex h-full flex-col items-center justify-center">
                    <div className="h-6 w-6 sm:h-7 sm:w-7">
                        <ChairIcon color={iconColor} />
                    </div>
                    <span className="text-xs font-bold">{desk.deskNumber}</span>
                </div>
            </button>
        </div >
    )
}

function SectionSelector({ selectedSection, onSectionChange }) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {SECTIONS.map(section => {
                const isSelected = selectedSection === section.id
                const total = section.end - section.start + 1

                return (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => onSectionChange(section.id)}
                        className={`rounded-2xl border p-4 text-left transition-all duration-150 ${isSelected
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-base-300 bg-base-100 hover:border-primary/40 hover:bg-base-100'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{section.label}</span>
                                </div>
                                <div className="mt-1 text-xs opacity-50">
                                    {section.description}
                                </div>
                            </div>
                            <span className="badge badge-ghost shrink-0">
                                {total}
                            </span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

function SectionDeskMap({
    desks,
    selectedSection,
    selected,
    onDeskClick,
    date,
    setDate,
    loading,
}) {
    const section = SECTIONS.find(item => item.id === selectedSection)

    const rows = useMemo(() => {
        const sorted = [...desks].sort(
            (a, b) => a.deskNumber - b.deskNumber
        )

        const result = []
        for (let i = 0; i < sorted.length; i += SEATS_PER_ROW) {
            result.push(sorted.slice(i, i + SEATS_PER_ROW))
        }
        return result
    }, [desks])

    if (!section) return null

    return (
        <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
            <div className="border-b border-base-300 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-bold">{section.label}</h2>
                            <span className="badge badge-ghost">
                                {section.end - section.start + 1} desks
                            </span>
                        </div>
                        <p className="mt-1 text-sm opacity-55">
                            Select a desk to view details or make a booking.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <span className="opacity-60">Date</span>
                            <input
                                type="date"
                                value={date}
                                min={getToday()}
                                onChange={e => setDate(e.target.value)}
                                className="input input-bordered input-sm"
                            />
                        </label>

                        <div className="flex flex-wrap items-center gap-3 text-xs opacity-75">
                            <span className="flex items-center gap-1.5">
                                <StatusDot status="AVAILABLE" /> Available
                            </span>
                            <span className="flex items-center gap-1.5">
                                <StatusDot status="BOOKED" /> Booked
                            </span>
                            <span className="flex items-center gap-1.5">
                                <StatusDot status="INACTIVE" /> Inactive
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="rounded-2xl border border-base-300/60 bg-base-200/40 p-3 sm:p-5">
                    <div className="mb-4 flex items-center justify-between text-xs opacity-50">
                        <span>{formatDate(date)}</span>
                        <span>{desks.length} desks loaded</span>
                    </div>

                    {loading ? (
                        <div className="flex min-h-72 items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <span className="loading loading-spinner loading-lg text-primary" />
                                <span className="text-sm opacity-60">
                                    Loading {section.label} desks...
                                </span>
                            </div>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-base-300">
                            <div className="text-center">
                                <p className="font-semibold">No desks found</p>
                                <p className="mt-1 text-sm opacity-50">
                                    Try another section or date.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-x-auto pb-1">
                            {rows.map((row, rowIndex) => {
                                const sectionDesks = row.slice(0, 15)
                                // const right = row.slice(4)

                                return (
                                    <div
                                        key={`row-${rowIndex}`}
                                    >
                                        <div className="grid grid-cols-15 gap-x-2 gap-y-3 w-fit mx-auto">
                                            {sectionDesks.map(desk => (
                                                <DeskButton
                                                    key={desk.deskId}
                                                    desk={desk}
                                                    isSelected={
                                                        selected === desk.deskId
                                                    }
                                                    onClick={onDeskClick}
                                                    isTopRow={rowIndex == 0}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, tone = 'neutral', helper }) {
    const styles = {
        success: 'border-success/20 bg-success/10 text-success',
        error: 'border-error/20 bg-error/10 text-error',
        warning: 'border-warning/20 bg-warning/10 text-warning',
        neutral: 'border-base-300 bg-base-100',
    }

    return (
        <div className={`rounded-2xl border p-4 ${styles[tone]}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-medium opacity-65">{label}</p>
                    <p className="mt-1 text-2xl font-bold">{value}</p>
                </div>
                {helper && (
                    <span className="text-right text-[11px] opacity-50">
                        {helper}
                    </span>
                )}
            </div>
        </div>
    )
}

function BookingDetails({ selectedDesk, deskBookings, loading }) {
    const bookings = deskBookings.flatMap(item => {
        if (!Array.isArray(item.bookings)) return []

        return item.bookings.map(booking => ({
            bookingId: booking.bookingId,
            date: booking.date,
            status: item.status,
            bookedBy: item.bookedBy,
        }))
    })

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Current booking</h3>

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

                {!loading && bookings.length > 0 && (
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

                            <div className="mt-4">
                                <p className="text-xs opacity-50">
                                    Booking date
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                    {formatDate(booking.date)}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {!loading && bookings.length === 0 && (
                    <div className="rounded-xl border border-base-300 bg-base-200 p-4 text-sm opacity-60">
                        No booking details are available for this desk.
                    </div>
                )}
            </div>
        </div>
    )
}
function SuccessDialog({ dialog, onClose }) {
    if (!dialog.open) return null

    const bookedDates = Array.isArray(dialog.booking?.bookings)
        ? dialog.booking.bookings
        : []

    const skippedDates = Array.isArray(dialog.booking?.skippedDates)
        ? dialog.booking.skippedDates
        : []

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-base-100 shadow-2xl">
                <div className="flex justify-center pt-7">
                    <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full ${dialog.type === 'success'
                            ? 'bg-success/15 text-success'
                            : 'bg-error/15 text-error'
                            }`}
                    >
                        {dialog.type === 'success' ? (
                            <svg
                                className="h-9 w-9"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-9 w-9"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        )}
                    </div>
                </div>

                <div className="px-6 pb-6 pt-5 text-center">
                    <h3 className="text-xl font-bold">{dialog.title}</h3>

                    {dialog.booking ? (
                        <div className="mt-5 space-y-3 text-left">
                            <div className="rounded-xl bg-base-200 p-4">
                                <p className="text-xs opacity-50">Desk</p>
                                <p className="mt-1 text-lg font-bold">
                                    Desk {dialog.booking.deskNumber ?? '-'}
                                </p>
                            </div>

                            {bookedDates.length > 0 && (
                                <div className="rounded-xl bg-base-200 p-4">
                                    <p className="text-xs opacity-50">
                                        Confirmed booking{bookedDates.length > 1 ? 's' : ''}
                                    </p>

                                    <div className="mt-3 space-y-2">
                                        {bookedDates.map(booking => (
                                            <div
                                                key={booking.bookingId}
                                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                                            >
                                                <span className="font-medium">
                                                    {formatDate(booking.date)}
                                                </span>

                                                <span className="badge badge-success badge-sm">
                                                    BOOKED
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(dialog.booking.bookedDates) &&
                                dialog.booking.bookedDates.length > 0 && (
                                    <div className="rounded-xl bg-base-200 p-4">
                                        <p className="text-xs opacity-50">
                                            Dates booked
                                        </p>
                                        <p className="mt-2 text-sm font-medium leading-6">
                                            {dialog.booking.bookedDates
                                                .map(formatDate)
                                                .join(' · ')}
                                        </p>
                                    </div>
                                )}

                            {skippedDates.length > 0 && (
                                <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                                    <p className="text-xs font-semibold text-warning">
                                        Dates skipped
                                    </p>
                                    <div className="mt-2 space-y-1 text-sm">
                                        {skippedDates.map(item => (
                                            <div
                                                key={`${item.date}-${item.reason}`}
                                                className="flex flex-wrap justify-between gap-2"
                                            >
                                                <span>{formatDate(item.date)}</span>
                                                <span className="opacity-70">
                                                    {getSkipReason(item.reason)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-base-content/60">
                            {dialog.message}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className={`btn mt-6 w-full ${dialog.type === 'success'
                            ? 'btn-success'
                            : 'btn-error'
                            }`}
                    >
                        {dialog.type === 'success' ? 'Done' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function Dashboard() {
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

    const [showBookingConfirmation, setShowBookingConfirmation] = useState(false)
    const [showBookingResult, setShowBookingResult] = useState(false)
    const [bookingResult, setBookingResult] = useState(null)
    const [bookingError, setBookingError] = useState('')
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
        if (desk.status === 'INACTIVE' || desk.status === 'UNAVAILABLE') {
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
                                    <StatusDot status={selectedDesk.status} />
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

            {showBookingConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl">

                        <h2 className="text-xl font-bold">
                            Confirm Booking
                        </h2>

                        <div className="mt-4 space-y-2 text-sm">
                            <p>
                                <span className="opacity-60">Desk:</span>{' '}
                                <span className="font-semibold">
                                    {selectedDesk?.deskNumber}
                                </span>
                            </p>

                            <p>
                                <span className="opacity-60">From:</span>{' '}
                                <span className="font-semibold">
                                    {formatBookingDate(fromDate)}
                                </span>
                            </p>

                            <p>
                                <span className="opacity-60">To:</span>{' '}
                                <span className="font-semibold">
                                    {formatBookingDate(toDate || fromDate)}
                                </span>
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                className="btn btn-ghost flex-1"
                                onClick={() => setShowBookingConfirmation(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary flex-1"
                                disabled={bookingLoading}
                                onClick={confirmBooking}
                            >
                                {bookingLoading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {showBookingResult && bookingResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-base-100 shadow-2xl">

                        <div className="p-6">

                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                                    ✓
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold">
                                        Booking Completed
                                    </h2>

                                    <p className="text-sm opacity-60">
                                        Desk {bookingResult.deskNumber}
                                    </p>
                                </div>
                            </div>

                            {/* Successfully booked */}
                            {bookingResult.bookings?.length > 0 && (
                                <div className="mb-4 rounded-xl bg-success/10 p-4">
                                    <p className="mb-2 font-semibold text-success">
                                        Successfully booked
                                    </p>

                                    <div className="space-y-1 text-sm">
                                        {bookingResult.bookings.map((booking) => (
                                            <div
                                                key={booking.bookingId}
                                                className="flex justify-between"
                                            >
                                                <span>
                                                    {formatBookingDate(booking.date)}
                                                </span>

                                                <span className="font-medium">
                                                    Booking confirmed
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skipped */}
                            {bookingResult.skippedDates?.length > 0 && (
                                <div className="mb-4 rounded-xl bg-warning/10 p-4">
                                    <p className="mb-2 font-semibold text-warning">
                                        Skipped dates
                                    </p>

                                    <div className="space-y-2 text-sm">
                                        {bookingResult.skippedDates.map(
                                            (item, index) => (
                                                <div
                                                    key={`${item.date}-${index}`}
                                                    className="flex flex-col"
                                                >
                                                    <span className="font-medium">
                                                        {formatBookingDate(item.date)}
                                                    </span>

                                                    <span className="opacity-70">
                                                        {item.reason}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                className="btn btn-primary w-full"
                                onClick={() => {
                                    setShowBookingResult(false)
                                    setBookingResult(null)
                                }}
                            >
                                Done
                            </button>

                        </div>
                    </div>
                </div>
            )}
            {bookingError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-base-100 p-6 shadow-2xl">

                        <div className="text-center">

                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-2xl text-error">
                                !
                            </div>

                            <h2 className="text-xl font-bold">
                                Booking Failed
                            </h2>

                            <p className="mt-3 text-sm opacity-70">
                                {bookingError}
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary mt-6 w-full"
                                onClick={() => setBookingError('')}
                            >
                                OK
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
