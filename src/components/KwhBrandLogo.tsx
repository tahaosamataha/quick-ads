import React from 'react';

interface KwhBrandLogoProps {
  variant?: 'full-yellow' | 'full-purple' | 'icon-yellow' | 'icon-purple' | 'card-purple' | 'card-yellow';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const KwhBrandLogo: React.FC<KwhBrandLogoProps> = ({
  variant = 'full-yellow',
  className = '',
  size = 'md'
}) => {
  const sizeStyles = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  }[size];

  if (variant === 'icon-yellow') {
    return (
      <img
        src="/kwh-icon-yellow.svg"
        alt="خد وهات"
        className={`${sizeStyles} object-contain ${className}`}
      />
    );
  }

  if (variant === 'icon-purple') {
    return (
      <img
        src="/kwh-icon-purple.svg"
        alt="خد وهات"
        className={`${sizeStyles} object-contain ${className}`}
      />
    );
  }

  if (variant === 'card-purple') {
    return (
      <img
        src="/kwh-card-purple.svg"
        alt="خد وهات"
        className={`rounded-2xl shadow-xl ${sizeStyles} object-contain ${className}`}
      />
    );
  }

  if (variant === 'card-yellow') {
    return (
      <img
        src="/kwh-card-yellow.svg"
        alt="خد وهات"
        className={`rounded-2xl shadow-xl ${sizeStyles} object-contain ${className}`}
      />
    );
  }

  const isYellow = variant === 'full-yellow';
  const textColor = isYellow ? 'text-[#F5B800]' : 'text-[#482878]';
  const iconSrc = isYellow ? '/kwh-icon-yellow.svg' : '/kwh-icon-purple.svg';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} dir="rtl">
      <img src={iconSrc} alt="خد وهات" className={`${sizeStyles} aspect-square object-contain`} />
      <div className="flex flex-col">
        <span className={`text-2xl sm:text-3xl font-black font-alexandria tracking-tight leading-none ${textColor}`}>
          خد وهات
        </span>
        <span className="text-[10px] tracking-widest uppercase font-bold text-zinc-400 mt-0.5">
          AI Ads & Content Suite
        </span>
      </div>
    </div>
  );
};
