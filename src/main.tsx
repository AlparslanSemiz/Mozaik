import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyTheme, readTheme } from './theme';
import './styles.css';

// Before the first paint, otherwise the page flashes light and then flips.
applyTheme(readTheme());

const root = document.getElementById('root');
if (root === null) throw new Error('#root bulunamadı');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
