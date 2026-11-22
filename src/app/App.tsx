import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { VentureProvider } from '../context/VentureContext';
import { AppRoutes } from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VentureProvider>
          <AppRoutes />
        </VentureProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default App;
