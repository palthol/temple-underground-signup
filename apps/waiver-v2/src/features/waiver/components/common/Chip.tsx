import React from 'react'

type ChipProps = {
  label: React.ReactNode
  active?: boolean
  className?: string
}

export const Chip: React.FC<ChipProps> = ({ label, active = false, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        active
          ? 'border-transparent bg-gradient-to-r from-slate-700 to-blue-900 text-white shadow-sm'
          : 'border-brand-outline/50 bg-brand-surface-variant text-brand-secondary'
      } ${className}`}
    >
      {label}
    </span>
  )
}


