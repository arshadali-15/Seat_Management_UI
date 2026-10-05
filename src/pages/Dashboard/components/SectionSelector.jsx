import { SECTIONS } from '../constants'

export default function SectionSelector({ selectedSection, onSectionChange }) {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {SECTIONS.map(section => {
                const isSelected = selectedSection === section.id
                const total = section.total

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

