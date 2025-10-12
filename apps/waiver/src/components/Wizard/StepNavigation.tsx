import React from 'react';
import { Button, Stack } from '@mui/material';

type Props = {
  disabledNext?: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  labels: {
    back: string;
    next: string;
    submit: string;
  };
};

const StepNavigation: React.FC<Props> = ({
  disabledNext,
  isFirstStep,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  labels,
}) => (
  <Stack
    direction="row"
    spacing={2}
    justifyContent="space-between"
    sx={{ mt: 3 }}
  >
    <Button
      variant="outlined"
      onClick={onBack}
      disabled={isFirstStep || isSubmitting}
    >
      {labels.back}
    </Button>
    <Button
      variant="contained"
      onClick={onNext}
      disabled={disabledNext || isSubmitting}
    >
      {isLastStep ? labels.submit : labels.next}
    </Button>
  </Stack>
);

export default StepNavigation;
