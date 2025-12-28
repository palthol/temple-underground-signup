import React from 'react'

const toneClasses: Record<'default' | 'primary' | 'success' | 'warning' | 'error', string> = {
  default: 'bg-brand-surface-variant text-brand-secondary',
  primary: 'bg-gradient-to-r from-slate-700 to-blue-900 text-white shadow-sm',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-brand-error/10 text-brand-error',
}

type BadgeProps = {
  tone?: keyof typeof toneClasses
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ tone = 'default', icon, children, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${toneClasses[tone]} ${className}`}
    >
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </span>
  )
}


