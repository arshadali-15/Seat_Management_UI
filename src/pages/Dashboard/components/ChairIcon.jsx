export default function ChairIcon({ color = 'currentColor' }) {
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

