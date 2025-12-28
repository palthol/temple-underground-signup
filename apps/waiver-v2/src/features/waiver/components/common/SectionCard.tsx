import React from 'react'
import { useParallaxScroll } from '../../hooks/useParallaxScroll'

type SectionCardProps = {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  alignHeader?: 'left' | 'center'
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  alignHeader = 'left',
  actions,
  children,
  className = '',
}) => {
  const parallaxOffset = useParallaxScroll(0.1)

  return (
    <section
      className={`rounded-card border border-brand-outline/30 bg-brand-surface shadow-brand-soft transition-all duration-300 hover:shadow-lg hover:shadow-brand-outline/15 hover:border-brand-outline/40 active:scale-[0.999] active:shadow-md ${className}`}
    >
      {(title || subtitle || actions) && (
        <header
          className={`mesh-gradient-section relative flex flex-col gap-2 border-b border-brand-outline/10 px-6 py-4 transition-all duration-300 hover:shadow-md hover:shadow-slate-900/10 md:flex-row md:items-center ${
            alignHeader === 'center' ? 'md:justify-center text-center' : 'md:justify-between text-left'
          }`}
        >
          <div
            className="mesh-gradient-section-bg"
            style={{
              transform: `translate3d(0, ${parallaxOffset * 0.25}px, 0)`,
            }}
          />
          <div
            className="mesh-gradient-section-noise"
            style={{
              transform: `translate3d(0, ${parallaxOffset * 0.15}px, 0)`,
            }}
          />
          <div
            className="mesh-gradient-section-highlight"
            style={{
              transform: `translate3d(0, ${parallaxOffset * 0.2}px, 0)`,
            }}
          />
          <div className="relative z-10 space-y-1">
            {typeof title === 'string' ? (
              <h2 className="text-lg font-semibold tracking-tight text-white drop-shadow-sm">{title}</h2>
            ) : (
              title
            )}
            {subtitle && <p className="text-sm text-white/85">{subtitle}</p>}
          </div>
          {actions && <div className="relative z-10 flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}


