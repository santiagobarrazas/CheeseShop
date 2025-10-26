
import React from 'react';

interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ children, className }) => {
  return (
    <div className={`bg-[#c2a26e] border-4 border-[#4b2d3a] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] ${className}`}>
      {children}
    </div>
  );
};
