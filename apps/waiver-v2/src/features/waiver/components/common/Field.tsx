import React from 'react'

export const inputBaseClasses =
  'mt-2 w-full rounded-lg border border-brand-outline/60 bg-brand-surface px-3 py-2 text-sm text-brand-on-surface shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:cursor-not-allowed disabled:bg-brand-surface-variant/70'

export const textareaBaseClasses = `${inputBaseClasses} min-h-[120px] resize-y`

export const checkboxClasses =
  'h-4 w-4 rounded border-brand-outline/60 text-brand-primary focus:ring-brand-primary/30'

type FieldProps = {
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const Field: React.FC<FieldProps> = ({ label, description, error, required, children, className = '' }) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary/90">
        {label}
        {required && <span className="ml-1 text-brand-primary">*</span>}
      </label>
      {description && <p className="mt-1 text-xs text-brand-secondary/70">{description}</p>}
      {children}
      {error && <p className="mt-1 text-xs font-medium text-brand-error">{error}</p>}
    </div>
  )
}


