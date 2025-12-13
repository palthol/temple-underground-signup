import React from 'react'

export type UseStepInteractedReturn = {
  interacted: boolean[]
  setInteracted: (index: number, value: boolean) => void
  reset: () => void
}

export const useStepInteracted = (total: number): UseStepInteractedReturn => {
  const [interacted, setInteractedState] = React.useState<boolean[]>(
    () => Array.from({ length: total }, () => false),
  )

  const setInteracted = React.useCallback((index: number, value: boolean) => {
    setInteractedState((prev) => {
      const next = prev.slice()
      if (index >= 0 && index < next.length) next[index] = value
      return next
    })
  }, [])

  const reset = React.useCallback(() => {
    setInteractedState(Array.from({ length: total }, () => false))
  }, [total])

  return { interacted, setInteracted, reset }
}


