import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './theme/fonts';
import { AppThemeProvider } from './theme';
import { AmbienceProvider } from './audio';
import { queryClient } from './api/queryClient';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <AmbienceProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AmbienceProvider>
    </AppThemeProvider>
  </StrictMode>,
);
