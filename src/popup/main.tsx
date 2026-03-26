import React from 'react';
import { createRoot } from 'react-dom/client';
import { Popup } from './Popup';
import '../shared/styles/globals.css';

createRoot(document.getElementById('root')!).render(<Popup />);
