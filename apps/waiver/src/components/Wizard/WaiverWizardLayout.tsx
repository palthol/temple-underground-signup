import React from 'react';
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  CssBaseline,
} from '@mui/material';
import type { Locale } from '../../i18n';
import type { ServiceStatus } from '../../hooks/useHealthStatus';

type LanguageOption = {
  value: Locale;
  label: string;
};

type Props = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  title: string;
  stepTitle: string;
  stepIndicator: string;
  statuses: {
    apiStatus: ServiceStatus;
    dbStatus: ServiceStatus;
  };
  statusLabels: {
    api: string;
    db: string;
  };
  languageLabel: string;
  languageOptions: LanguageOption[];
  children: React.ReactNode;
};

const statusColor = (status: ServiceStatus) => {
  if (status === 'ok') return 'success.main';
  if (status === 'fail') return 'error.main';
  return 'text.secondary';
};

const WaiverWizardLayout: React.FC<Props> = ({
  locale,
  onLocaleChange,
  title,
  stepTitle,
  stepIndicator,
  statuses,
  statusLabels,
  languageLabel,
  languageOptions,
  children,
}) => (
  <React.Fragment>
    <CssBaseline />
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">{title}</Typography>
          <FormControl size="small" sx={{ width: 160 }}>
            <InputLabel id="waiver-lang-select">{languageLabel}</InputLabel>
            <Select
              labelId="waiver-lang-select"
              label={languageLabel}
              value={locale}
              onChange={(event) => onLocaleChange(event.target.value as Locale)}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Typography
            variant="caption"
            sx={{ color: statusColor(statuses.apiStatus) }}
          >
            {statusLabels.api}: {statuses.apiStatus}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: statusColor(statuses.dbStatus) }}
          >
            {statusLabels.db}: {statuses.dbStatus}
          </Typography>
        </Stack>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {stepIndicator}
          </Typography>
          <Typography variant="h6">{stepTitle}</Typography>
        </Box>

        <Box component="section">{children}</Box>
      </Stack>
    </Container>
  </React.Fragment>
);

export default WaiverWizardLayout;
