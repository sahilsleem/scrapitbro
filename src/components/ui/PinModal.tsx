import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, X, Delete } from 'lucide-react';
import { setupPin, changePin, disablePin, verifyPin } from '@/lib/pin-security';

export type PinModalMode = 'setup' | 'change' | 'disable' | 'unlock';

interface PinModalProps {
  isOpen: boolean;
  mode: PinModalMode;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [pinBuffer, setPinBuffer] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setPinBuffer('');
      setFirstPin('');
      setCurrentPin('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, mode]);

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        if (pinBuffer.length < 6) {
          handleDigit(e.key);
        }
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (pinBuffer.length >= 4) {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pinBuffer, step, isLoading]);

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

  const getTitleAndSubtitle = () => {
    if (mode === 'setup') {
      if (step === 1) {
        return {
          title: 'Set a Vault PIN',
          subtitle: 'Enter a 4 to 6 digit PIN to protect your local photo vault',
        };
      }
      return {
        title: 'Confirm your PIN',
        subtitle: 'Re-enter the exact same PIN to confirm setup',
      };
    }

    if (mode === 'change') {
      if (step === 1) {
        return {
          title: 'Enter Current PIN',
          subtitle: 'Verify your current PIN before setting a new one',
        };
      }
      if (step === 2) {
        return {
          title: 'Set New PIN',
          subtitle: 'Enter your new 4 to 6 digit PIN',
        };
      }
      return {
        title: 'Confirm New PIN',
        subtitle: 'Re-enter your new PIN to confirm',
      };
    }

    if (mode === 'disable') {
      return {
        title: 'Disable PIN Protection',
        subtitle: 'Enter your current PIN to turn off vault protection',
      };
    }

    return {
      title: 'Unlock Vault',
      subtitle: 'Enter your PIN to access your photo gallery',
    };
  };

  const handleSubmit = async (overrideBuffer?: string) => {
    const entered = overrideBuffer ?? pinBuffer;
    if (entered.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    await new Promise((r) => setTimeout(r, 200));

    try {
      if (mode === 'setup') {
        if (step === 1) {
          setFirstPin(entered);
          setPinBuffer('');
          setStep(2);
          setIsLoading(false);
          return;
        }

        if (step === 2) {
          if (entered !== firstPin) {
            setError('PINs do not match. Please try again.');
            setPinBuffer('');
            setStep(1);
            setFirstPin('');
            setIsLoading(false);
            return;
          }

          const success = await setupPin(entered);
          if (success) {
            onSuccess();
            onClose();
          } else {
            setError('Failed to setup PIN. Please try again.');
          }
          setIsLoading(false);
          return;
        }
      }

      if (mode === 'change') {
        if (step === 1) {
          const isValid = await verifyPin(entered);
          if (!isValid) {
            setError('Incorrect current PIN');
            setPinBuffer('');
            setIsLoading(false);
            return;
          }
          setCurrentPin(entered);
          setPinBuffer('');
          setStep(2);
          setIsLoading(false);
          return;
        }

        if (step === 2) {
          setFirstPin(entered);
          setPinBuffer('');
          setStep(3);
          setIsLoading(false);
          return;
        }

        if (step === 3) {
          if (entered !== firstPin) {
            setError('New PINs do not match. Please try again.');
            setPinBuffer('');
            setStep(2);
            setFirstPin('');
            setIsLoading(false);
            return;
          }

          const success = await changePin(currentPin, entered);
          if (success) {
            onSuccess();
            onClose();
          } else {
            setError('Failed to update PIN');
          }
          setIsLoading(false);
          return;
        }
      }

      if (mode === 'disable') {
        const success = await disablePin(entered);
        if (success) {
          onSuccess();
          onClose();
        } else {
          setError('Incorrect PIN. Protection remains active.');
          setPinBuffer('');
        }
        setIsLoading(false);
        return;
      }

      if (mode === 'unlock') {
        const success = await verifyPin(entered);
        if (success) {
          onSuccess();
          onClose();
        } else {
          setError('Incorrect PIN');
          setPinBuffer('');
        }
        setIsLoading(false);
        return;
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <AnimatePresence>
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 flex flex-col items-center text-center relative"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mb-3.5 shadow-2xs">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            {subtitle}
          </p>

          {/* Masked PIN Indicators (4-6 digits) */}
          <div className="flex items-center justify-center gap-3 my-5">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isFilled = idx < pinBuffer.length;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${isFilled ? 'bg-indigo-600 border-indigo-600 scale-110' : 'bg-slate-100 border-slate-300'}`}
                />
              );
            })}
          </div>

          {/* Error Message */}
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

          {/* Numeric Touch Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-4">
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

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading || pinBuffer.length < 4}
            onClick={() => handleSubmit()}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Verifying...</span>
            ) : (
              <span>
                {mode === 'setup'
                  ? step === 1
                    ? 'Continue'
                    : 'Confirm PIN'
                  : mode === 'change'
                  ? step === 1
                    ? 'Verify Current PIN'
                    : step === 2
                    ? 'Continue'
                    : 'Confirm New PIN'
                  : mode === 'disable'
                  ? 'Disable PIN'
                  : 'Unlock'}
              </span>
            )}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
