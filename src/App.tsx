import React, { useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MobileShell } from '@/components/layout/MobileShell';
import { Library } from '@/pages/Library';
import { PhotoDetail } from '@/pages/PhotoDetail';
import { Settings } from '@/pages/Settings';
import { About } from '@/pages/About';
import { HowItWorks } from '@/pages/HowItWorks';
import { Privacy } from '@/pages/Privacy';
import { Terms } from '@/pages/Terms';
import { Security } from '@/pages/Security';
import { Contact } from '@/pages/Contact';
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker';

const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    // If not navigating with a specific in-page anchor (like #your-photos), reset to top instantly
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col w-full"
      >
        <Routes location={location}>
          <Route path="/" element={<Library />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/security" element={<Security />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnalyticsTracker />
      <MobileShell>
        <AnimatedRoutes />
      </MobileShell>
    </BrowserRouter>
  );
};

export default App;
