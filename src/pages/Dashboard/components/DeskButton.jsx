import ChairIcon from './ChairIcon'

export default function DeskButton({ desk, isSelected, onClick, isTopRow, canManageInactive = false }) {
    const isBooked = desk.status === 'BOOKED'
    const isInactive = desk.status === 'INACTIVE'
    const isUnavailable = desk.status === 'UNAVAILABLE'
    const isDisabled = isUnavailable || (isInactive && !canManageInactive)

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
                {desk.status !== 'INACTIVE' && desk.bookedBy && (
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

