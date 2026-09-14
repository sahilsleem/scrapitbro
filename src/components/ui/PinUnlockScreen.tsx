import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, AlertCircle, Delete, ShieldCheck } from 'lucide-react';
import { useVaultStore } from '@/store/useVaultStore';

interface PinUnlockScreenProps {
  onUnlock?: () => void;
}

export const PinUnlockScreen: React.FC<PinUnlockScreenProps> = ({ onUnlock }) => {
  const { unlockWithPin } = useVaultStore();
  const [pinBuffer, setPinBuffer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.key >= '0' && e.key <= '9') {
        if (pinBuffer.length < 6) {
          handleDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pinBuffer.length >= 4) {
          handleUnlock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinBuffer, isLoading]);

  const handleDigit = (digit: string) => {
    if (pinBuffer.length >= 6) return;
    setError(null);
    setPinBuffer((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setError(null);
    setPinBuffer((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(null);
    setPinBuffer('');
  };

  const handleUnlock = async (overrideBuffer?: string) => {
    const entered = overrideBuffer ?? pinBuffer;
    if (entered.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    await new Promise((r) => setTimeout(r, 250));

    try {
      const isValid = await unlockWithPin(entered);
      if (isValid) {
        onUnlock?.();
      } else {
        setError('Incorrect PIN');
        setPinBuffer('');
      }
    } catch {
      setError('Failed to verify PIN. Please try again.');
      setPinBuffer('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[75vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 flex flex-col items-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center mb-4 text-indigo-600 shadow-2xs">
          <Lock className="w-7 h-7 stroke-[2]" />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Your Vault is Locked
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 max-w-xs leading-relaxed">
          Enter your PIN to access your photos on this device.
        </p>

        <div className="flex items-center justify-center gap-3 mb-5">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isFilled = idx < pinBuffer.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${isFilled ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-slate-100 border-slate-300'}`}
              />
            );
          })}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-3"
          >
            <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isLoading}
              onClick={() => handleDigit(num)}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/70 text-slate-800 text-lg font-semibold flex items-center justify-center transition-colors cursor-pointer select-none disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isLoading || pinBuffer.length === 0}
            onClick={handleClear}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/70 text-slate-500 text-xs font-medium flex items-center justify-center transition-colors cursor-pointer select-none disabled:opacity-40"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/70 text-slate-800 text-lg font-semibold flex items-center justify-center transition-colors cursor-pointer select-none disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            disabled={isLoading || pinBuffer.length === 0}
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200/70 text-slate-600 flex items-center justify-center transition-colors cursor-pointer select-none disabled:opacity-40"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={isLoading || pinBuffer.length < 4}
          onClick={() => handleUnlock()}
          className="w-full max-w-[240px] py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Unlock Vault'}
        </motion.button>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-4">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
          <span>Local device protection</span>
        </div>
      </motion.div>
    </div>
  );
};
