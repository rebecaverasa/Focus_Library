import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme/fonts';
import { AppThemeProvider } from './theme';
import { AmbienceProvider } from './audio';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider>
      <AmbienceProvider>
        <App />
      </AmbienceProvider>
    </AppThemeProvider>
  </StrictMode>,
);
