/**
 * ScrapItBro Motion System
 * 
 * Precise, restrained, purposeful motion for privacy & inspection tools.
 * Quick, confident, GPU-accelerated micro-interactions (transform + opacity).
 */

import type { Variants, Transition } from 'framer-motion';

export const easings = {
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  easeOutCubic: [0.215, 0.61, 0.355, 1] as const,
};

// Hero Load Sequence (50ms stagger, 10px translateY, ~400ms ease-out)
export const heroContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const heroChild: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Photo Card Ingestion Reveal (scale 0.95 -> 1, opacity 0 -> 1, ~250ms)
export const photoGridCard: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Metadata Inspection Reveal (expand / progressive reveal ~420ms)
export const metadataSectionReveal: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Tab Active Sliding Pill Transition (Crisp sliding using transform)
export const tabPillTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 38,
};

// =========================================================================
// SHARED INTERACTION PRESETS (Based on Settings About visual interaction DNA)
// =========================================================================

/**
 * Primary & Action Button Interaction
 * Smooth slight elevation + color shift + tactile click compression
 */
export const buttonMotion = {
  whileHover: { y: -1.5 },
  whileTap: { scale: 0.97, y: 0 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
};

/**
 * Navigation Item & Secondary Button Interaction
 */
export const navItemMotion = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.97, y: 0 },
  transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
};

/**
 * List Row & Link Interaction (Settings About reference pattern)
 * Horizontal nudge + subtle background tint + arrow lead
 */
export const listRowMotion = {
  whileHover: { x: 3 },
  whileTap: { scale: 0.99, x: 0 },
  transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
};

/**
 * Small Icon Control Interaction (Heart, Back, Prev/Next, Delete, Close)
 */
export const iconButtonMotion = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.92 },
  transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
};

/**
 * Interactive Card Motion (Photo grid cards & info cards)
 */
export const cardMotion = {
  whileHover: { y: -3.5 },
  whileTap: { scale: 0.985, y: 0 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};


