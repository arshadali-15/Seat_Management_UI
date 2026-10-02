export default function StatCard({ label, value, tone = 'neutral', helper }) {
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

