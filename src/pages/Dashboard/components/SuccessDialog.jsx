import { formatDate, getSkipReason } from '../utils'

export default function SuccessDialog({ dialog, onClose }) {
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

