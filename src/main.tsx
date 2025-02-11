// main.tsx
import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './tailwind.css';
import App from './App';
import FAQ from './FAQ';
import Navbar from './Navbar';
import Multiplier from './Multiplier';     // Pohjalaskuri page (Multiplier)
import MeatCalculator from './MeatCalculator'; // Lihalaskuri page (MeatCalculator)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/pohjalaskuri" element={<Multiplier />} />
        <Route path="/lihalaskuri" element={<MeatCalculator />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
