import React from 'react';
import { useTranslation } from 'react-i18next';
import { Npc as NpcType } from '../types';
import { NPC_SIZE } from '../constants';

interface NpcProps {
  data: NpcType;
  isActive: boolean;
}

const NPC_SPRITES = [
  { 
    hair: 'bg-yellow-800', 
    shirt: 'bg-red-700', 
    pants: 'bg-blue-900',
    accessory: '🎩' // Hat
  },
  { 
    hair: 'bg-gray-400', 
    shirt: 'bg-purple-600', 
    pants: 'bg-gray-800',
    accessory: '👓' // Glasses
  },
  { 
    hair: 'bg-orange-600', 
    shirt: 'bg-green-600', 
    pants: 'bg-indigo-900',
    accessory: '🎀' // Bow
  },
  { 
    hair: 'bg-black', 
    shirt: 'bg-teal-500', 
    pants: 'bg-blue-400',
    accessory: '⭐' // Star
  },
];

const Npc: React.FC<NpcProps> = ({ data, isActive }) => {
    const { t } = useTranslation();
    const spriteColors = NPC_SPRITES[data.sprite % NPC_SPRITES.length];
    
  return (
    <div
      className={`absolute transition-all duration-500 ease-in-out z-0 ${isActive && data.isWaiting ? 'drop-shadow-[0_0_8px_rgba(255,255,100,0.9)]' : ''}`}
      style={{
        left: `${data.position.x}px`,
        top: `${data.position.y}px`,
        width: `${NPC_SIZE.width}px`,
        height: `${NPC_SIZE.height}px`,
      }}
    >
      <div className="relative w-full h-full animate-idle">
        {/* Head with shading */}
        <div className="absolute top-[2px] left-[8px] w-[16px] h-[14px] bg-[#f2c6a0] border border-black">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#f5d0aa]"></div>
        </div>
        
        {/* Hair with better detail */}
        <div className={`absolute top-0 left-[6px] w-[20px] h-[8px] ${spriteColors.hair} border-t border-x border-black rounded-t-sm`}>
          <div className="absolute top-1 left-1 w-2 h-1 bg-black opacity-20"></div>
        </div>
        
        {/* Eyes with pupils */}
        <div className="absolute top-[8px] left-[11px] w-[3px] h-[3px] bg-white border border-black rounded-full">
          <div className="absolute top-0.5 left-0.5 w-[1px] h-[1px] bg-black rounded-full"></div>
        </div>
        <div className="absolute top-[8px] left-[18px] w-[3px] h-[3px] bg-white border border-black rounded-full">
          <div className="absolute top-0.5 left-0.5 w-[1px] h-[1px] bg-black rounded-full"></div>
        </div>
        
        {/* Mouth */}
        <div className="absolute top-[12px] left-[13px] w-[6px] h-[1px] bg-[#d4a077]"></div>
        
        {/* Shirt with shading */}
        <div className={`absolute top-[16px] left-[6px] w-[20px] h-[16px] ${spriteColors.shirt} border-x border-black`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-white opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-black opacity-20"></div>
        </div>
        
        {/* Pants with shading */}
        <div className={`absolute top-[32px] left-[8px] w-[16px] h-[16px] ${spriteColors.pants} border border-black`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-white opacity-10"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-black opacity-30"></div>
        </div>
        
        {/* Shoes */}
        <div className="absolute top-[46px] left-[8px] w-[6px] h-[2px] bg-gray-800 border border-black"></div>
        <div className="absolute top-[46px] left-[18px] w-[6px] h-[2px] bg-gray-800 border border-black"></div>
        
        {/* Accessory badge */}
        <div className="absolute -top-2 -right-2 text-xs">{spriteColors.accessory}</div>
      </div>


      {/* Patience Bar with better styling */}
      <div className="absolute -top-3 w-full h-2 bg-gray-900 border border-black rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            data.patience > 60 ? 'bg-green-500' : data.patience > 30 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${data.patience}%` }}
        ></div>
      </div>
      
      {/* Order bubble with better design */}
       {data.isWaiting && (
         <div className="absolute -top-14 -left-4 bg-white p-2 border-3 border-black rounded-xl text-xs whitespace-nowrap shadow-lg">
           <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
           <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-black"></div>
           <p className="font-bold text-black">
             {`${data.order.weight}g ${t(`cheese.${data.order.type}`)}`}
           </p>
       </div>
       )}
    </div>
  );
};

export default Npc;