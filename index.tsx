
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/i18n'; // Initialize i18next
import App from './App';
import { sound } from './src/audio/soundManager';

const rootElement = document.getElementById('root');
sound.preload(['click','start','slice','success','fail','cash','warning','game_over']);

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
