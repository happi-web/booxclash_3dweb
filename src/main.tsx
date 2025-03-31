import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import  "./index.css";
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Hero/>
    </BrowserRouter>
  </React.StrictMode>
);
