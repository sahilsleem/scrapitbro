import React from 'react';

export interface ScrapItBroLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ScrapItBroLogo: React.FC<ScrapItBroLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  textSize = 'md',
}) => {
  const textClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-bold',
    lg: 'text-lg font-extrabold',
    xl: 'text-xl font-extrabold',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Geometric Aperture + Vault Shield Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="pv-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="pv-inner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* Soft Rounded Vault Outer Shield Tile */}
        <rect
          x="2"
          y="2"
          width="32"
          height="32"
          rx="10"
          fill="url(#pv-logo-grad)"
          className="shadow-sm"
        />

        {/* Inner Aperture / Camera Lens Blades */}
        <circle cx="18" cy="18" r="9" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" />
        
        {/* Aperture Petal 1 */}
        <path
          d="M18 9L24.5 14"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        {/* Aperture Petal 2 */}
        <path
          d="M24.5 14L23.5 22.5"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        {/* Aperture Petal 3 */}
        <path
          d="M23.5 22.5L16 26"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        {/* Aperture Petal 4 */}
        <path
          d="M16 26L11.5 20"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        {/* Aperture Petal 5 */}
        <path
          d="M11.5 20L14 11.5"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* Center Iris Core */}
        <circle cx="18" cy="18" r="3.2" fill="white" />
      </svg>

      {showText && (
        <div className="flex items-center tracking-tight">
          <span className={`text-slate-900 ${textClasses[textSize]}`}>ScrapIt</span>
          <span className={`text-indigo-600 ${textClasses[textSize]}`}>Bro</span>
        </div>
      )}
    </div>
  );
};

export const PhotoVaultLogo = ScrapItBroLogo;
export type PhotoVaultLogoProps = ScrapItBroLogoProps;
