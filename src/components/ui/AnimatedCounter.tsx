import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const spring = useSpring(value, {
    stiffness: 140,
    damping: 18,
    mass: 0.8,
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (latest) => {
    const formatted = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
    return `${prefix}${formatted}${suffix}`;
  });

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.15, filter: 'brightness(1.3)' }}
      animate={{ scale: 1, filter: 'brightness(1)' }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      className={`inline-block font-mono tabular-nums ${className}`}
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  );
};
