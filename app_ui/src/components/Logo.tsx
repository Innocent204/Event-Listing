import { motion } from 'motion/react';
import React from 'react';

interface LogoProps {
  className?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', animated = false, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const pulseAnimation = animated ? {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div 
        className={`${sizes[size]} relative`}
        animate={pulseAnimation}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* City skyline */}
          <rect x="4" y="28" width="6" height="16" fill="currentColor" className="text-primary" />
          <rect x="12" y="20" width="6" height="24" fill="currentColor" className="text-primary" />
          <rect x="20" y="16" width="6" height="28" fill="currentColor" className="text-primary" />
          <rect x="28" y="24" width="6" height="20" fill="currentColor" className="text-primary" />
          <rect x="36" y="18" width="6" height="26" fill="currentColor" className="text-primary" />
          
          {/* Pulse circles */}
          <motion.circle 
            cx="24" 
            cy="12" 
            r="6" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-chart-1"
            animate={animated ? {
              r: [4, 8, 4],
              opacity: [0.8, 0.3, 0.8]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.circle 
            cx="24" 
            cy="12" 
            r="3" 
            fill="currentColor"
            className="text-chart-1"
            animate={animated ? {
              scale: [1, 1.2, 1]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Additional pulse rings */}
          <motion.circle 
            cx="24" 
            cy="12" 
            r="10" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1"
            strokeOpacity="0.4"
            className="text-chart-2"
            animate={animated ? {
              r: [8, 12, 8],
              opacity: [0.4, 0.1, 0.4]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </svg>
      </motion.div>
      
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-none text-primary">PulseCity</span>
        <span className="text-xs text-muted-foreground leading-none">Events & Community</span>
      </div>
    </div>
  );
}