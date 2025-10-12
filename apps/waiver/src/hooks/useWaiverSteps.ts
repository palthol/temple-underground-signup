import React from 'react';
import type { WaiverStepDefinition } from '../types/Waiver';

export type UseWaiverStepsReturn = {
  step: WaiverStepDefinition;
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  goNext: () => void;
  goBack: () => void;
  goTo: (nextIndex: number) => void;
  reset: () => void;
};

export const useWaiverSteps = (
  steps: WaiverStepDefinition[],
): UseWaiverStepsReturn => {
  const [index, setIndex] = React.useState(0);
  const total = steps.length;

  const goNext = React.useCallback(() => {
    setIndex((current) => Math.min(current + 1, total - 1));
  }, [total]);

  const goBack = React.useCallback(() => {
    setIndex((current) => Math.max(current - 1, 0));
  }, []);

  const goTo = React.useCallback((nextIndex: number) => {
    setIndex(() => {
      if (nextIndex < 0) return 0;
      if (nextIndex >= total) return total - 1;
      return nextIndex;
    });
  }, [total]);

  const reset = React.useCallback(() => {
    setIndex(0);
  }, []);

  const step = React.useMemo(() => steps[index], [steps, index]);
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return {
    step,
    index,
    total,
    isFirst,
    isLast,
    goNext,
    goBack,
    goTo,
    reset,
  };
};
