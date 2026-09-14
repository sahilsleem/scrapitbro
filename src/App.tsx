import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileShell } from '@/components/layout/MobileShell';
import { Library } from '@/pages/Library';
import { PhotoDetail } from '@/pages/PhotoDetail';
import { Settings } from '@/pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MobileShell>
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileShell>
    </BrowserRouter>
  );
};

export default App;
