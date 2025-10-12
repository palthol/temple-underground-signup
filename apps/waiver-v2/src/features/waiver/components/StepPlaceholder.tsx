import React from 'react'

type Props = {
  checked: boolean
  onChange: (value: boolean) => void
}

export const StepPlaceholder: React.FC<Props> = ({ checked, onChange }) => {
  return (
    <div className="rounded-md border p-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>I interacted with this step</span>
      </label>
    </div>
  )
}


