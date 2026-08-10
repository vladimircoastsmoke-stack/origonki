import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { OrganizerGate } from './components/OrganizerGate';
import './index.css';

document.body.classList.add('retrowave-bg');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OrganizerGate>
      <App />
    </OrganizerGate>
  </StrictMode>
);
