import { useMemo } from 'react'
import { SEATS_PER_ROW, SECTIONS } from '../constants'
import { getToday, formatDate } from '../utils'
import StatusDot from './StatusDot'
import DeskButton from './DeskButton'

export default function SectionDeskMap({
    desks,
    selectedSection,
    selected,
    onDeskClick,
    date,
    setDate,
    loading,
    canManageInactive,
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
                                                    canManageInactive={canManageInactive}
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

