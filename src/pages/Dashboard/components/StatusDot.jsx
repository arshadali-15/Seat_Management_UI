export default function StatusDot({ status }) {
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

