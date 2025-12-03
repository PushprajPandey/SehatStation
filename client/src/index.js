import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Chart, Filler } from 'chart.js';
import { inject } from '@vercel/analytics';
import { RecoilRoot } from 'recoil';
import ScrollProgressIndicator from './components/ScrollProgressIndicator';

// Register Chart.js plugins globally to avoid Chart.js warnings about missing plugins
Chart.register(Filler);

inject();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ScrollProgressIndicator />
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
);

reportWebVitals();
