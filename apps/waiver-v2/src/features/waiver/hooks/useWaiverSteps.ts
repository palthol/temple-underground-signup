import React from 'react'

export type UseWaiverStepsReturn = {
  index: number
  total: number
  isFirst: boolean
  isLast: boolean
  goNext: () => void
  goBack: () => void
  goTo: (nextIndex: number) => void
  reset: () => void
}

export const useWaiverSteps = (total: number): UseWaiverStepsReturn => {
  const [index, setIndex] = React.useState(0)

  const goNext = React.useCallback(() => {
    setIndex((current) => Math.min(current + 1, total - 1))
  }, [total])

  const goBack = React.useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0))
  }, [])

  const goTo = React.useCallback(
    (nextIndex: number) => {
      setIndex(() => {
        if (nextIndex < 0) return 0
        if (nextIndex >= total) return total - 1
        return nextIndex
      })
    },
    [total],
  )

  const reset = React.useCallback(() => setIndex(0), [])

  const isFirst = index === 0
  const isLast = index === total - 1

  return { index, total, isFirst, isLast, goNext, goBack, goTo, reset }
}
