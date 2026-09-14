import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Settings, Plus } from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="w-full max-w-[360px] pointer-events-auto bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.10)] px-3 py-1.5 flex items-center justify-between"
      >
        {/* Photos / Library Tab */}
        <NavLink
          to="/"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('vault:scroll-to-photos'));
            }
          }}
          className={({ isActive }) =>
            `relative flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
              isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
            }`
          }
        >
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="w-full flex flex-col items-center justify-center relative z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-indigo-50 border border-indigo-100/80 rounded-xl -m-1"
                  transition={{
                    type: 'spring',
                    stiffness: 520,
                    damping: 28,
                    mass: 0.6,
                  }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Image className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium tracking-tight">
                  Photos
                </span>
              </div>
            </motion.div>
          )}
        </NavLink>

        {/* Center Quick Import Action */}
        <div className="flex-shrink-0 px-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 480, damping: 18 }}
            className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-all"
            title="Import Photos into Vault"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('vault:shutter'));
            }}
          >
            <Plus className="w-5 h-5 text-white stroke-[2.5]" />
          </motion.button>
        </div>

        {/* Settings Tab */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `relative flex-1 flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
              isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
            }`
          }
        >
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="w-full flex flex-col items-center justify-center relative z-10"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-indigo-50 border border-indigo-100/80 rounded-xl -m-1"
                  transition={{
                    type: 'spring',
                    stiffness: 520,
                    damping: 28,
                    mass: 0.6,
                  }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Settings className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] font-medium tracking-tight">
                  Settings
                </span>
              </div>
            </motion.div>
          )}
        </NavLink>
      </motion.div>
    </nav>
  );
};
