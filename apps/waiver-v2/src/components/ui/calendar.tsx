import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '../../lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const usesDropdownCaption =
    typeof props.captionLayout === 'string' && props.captionLayout.startsWith('dropdown')

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-2', className)}
      classNames={{
        months: 'flex flex-col',
        month: 'space-y-4',
        caption: 'relative flex items-center justify-center py-1',
        caption_label: cn('text-sm font-semibold text-brand-on-surface', usesDropdownCaption && 'sr-only'),
        caption_dropdowns: 'flex items-center gap-2 [&>*:first-child]:order-2 [&>*:last-child]:order-1',
        dropdown_root: 'relative',
        dropdown:
          'h-10 rounded-lg border border-brand-outline/55 bg-brand-surface px-3 pr-8 text-sm font-medium text-brand-on-surface shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-primary/30 hover:border-brand-primary/50',
        months_dropdown: 'min-w-[8.5rem]',
        years_dropdown: 'min-w-[6.5rem]',
        chevron: 'text-brand-secondary',
        nav: 'flex items-center gap-1',
        nav_button:
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-brand-outline/40 bg-brand-surface text-brand-on-surface transition hover:bg-brand-surface-variant focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell: 'w-9 text-[0.72rem] font-semibold text-brand-secondary',
        row: 'mt-1 flex w-full',
        cell: 'relative h-9 w-9 p-0 text-center text-sm',
        day: 'h-9 w-9 rounded-md p-0 font-medium text-brand-on-surface transition hover:bg-brand-surface-variant focus:outline-none focus:ring-2 focus:ring-brand-primary/30',
        day_selected: 'bg-brand-primary text-white hover:bg-brand-primary/90',
        day_today: 'border border-brand-primary/40',
        day_outside: 'text-brand-secondary/45',
        day_disabled: 'text-brand-secondary/35',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
