
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Service Worker Registration
 * We use the absolute URL based on window.location.origin to satisfy same-origin requirements.
 */
if ('serviceWorker' in navigator) {
  const registerSW = async () => {
    try {
      // Ensure we are on a secure origin (localhost or HTTPS)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.warn('SW: Service Workers require a secure origin (HTTPS). Registration skipped.');
        return;
      }

      const swUrl = new URL('/sw.js', window.location.origin).href;
      console.log('SW: Attempting registration with URL:', swUrl);
      
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/'
      });
      
      console.log('SW: Registration successful. Scope:', registration.scope);

      // Listen for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          console.log('SW: New version is installing...');
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('SW: New content is available; please refresh.');
              } else {
                console.log('SW: Content is cached for offline use.');
              }
            }
          };
        }
      };
    } catch (error) {
      // Use exhaustive logging to help diagnose same-origin or installation errors
      console.error('SW: Registration failed with error:', error);
      if (error instanceof Error) {
        console.error('SW: Error message:', error.message);
        console.error('SW: Error stack:', error.stack);
      }
    }
  };

  // Register the service worker after the page has finished loading
  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}
