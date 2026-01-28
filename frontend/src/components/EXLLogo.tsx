import React from 'react';

interface EXLLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const EXLLogo: React.FC<EXLLogoProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} rounded-lg flex items-center justify-center border border-white/30 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden shadow-lg`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse" />
      
      {/* EXL Text */}
      <span className="relative text-white font-black" style={{ fontSize: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px' }}>
        EXL
      </span>
    </div>
  );
};

export default EXLLogo;
