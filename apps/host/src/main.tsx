import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import './index.css';

document.body.classList.add('retrowave-bg');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/host">
      <Routes>
        <Route path="/:slug" element={<LoginPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
