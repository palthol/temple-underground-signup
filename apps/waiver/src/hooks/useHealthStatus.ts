import React from 'react';

export type ServiceStatus = 'unknown' | 'ok' | 'fail';

export const useHealthStatus = (apiBase: string) => {
  const [apiStatus, setApiStatus] =
    React.useState<ServiceStatus>('unknown');
  const [dbStatus, setDbStatus] =
    React.useState<ServiceStatus>('unknown');

  const ping = React.useCallback(async () => {
    const apiUrl = apiBase ? `${apiBase}/health` : '/health';
    const dbUrl = apiBase ? `${apiBase}/health/deep` : '/health/deep';

    try {
      const response = await fetch(apiUrl);
      setApiStatus(response.ok ? 'ok' : 'fail');
    } catch {
      setApiStatus('fail');
    }

    try {
      const response = await fetch(dbUrl);
      setDbStatus(response.ok ? 'ok' : 'fail');
    } catch {
      setDbStatus('fail');
    }
  }, [apiBase]);

  React.useEffect(() => {
    void ping();
  }, [ping]);

  return React.useMemo(
    () => ({
      apiStatus,
      dbStatus,
      refresh: ping,
    }),
    [apiStatus, dbStatus, ping],
  );
};
