import React from 'react';
import { useTranslation } from 'react-i18next';
import { Npc as NpcType, Position } from '../types';
import Player from './Player';
import Npc from './Npc';
import { INTERACTION_POS } from '../constants';

interface GameSceneProps {
  npcs: NpcType[];
  playerPos: Position;
  setPlayerPos: React.Dispatch<React.SetStateAction<Position>>;
  canServe: boolean;
  isServing: boolean;
}

const GameScene: React.FC<GameSceneProps> = ({ npcs, playerPos, setPlayerPos, canServe, isServing }) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full h-full bg-[#5d9250] relative overflow-hidden">
      {/* Sky gradient background */}
      <div className="absolute top-0 w-full h-[180px] bg-gradient-to-b from-[#87CEEB] to-[#5d9250]"></div>
      
      {/* Clouds */}
      <div className="absolute top-8 left-20 w-16 h-6 bg-white rounded-full opacity-70"></div>
      <div className="absolute top-12 left-16 w-12 h-6 bg-white rounded-full opacity-70"></div>
      <div className="absolute top-20 right-40 w-20 h-8 bg-white rounded-full opacity-70"></div>
      <div className="absolute top-24 right-36 w-14 h-6 bg-white rounded-full opacity-70"></div>
      
      {/* Trees in background */}
      <div className="absolute top-[120px] left-10 flex flex-col items-center">
        <div className="w-12 h-16 bg-[#2d5016] rounded-full"></div>
        <div className="w-4 h-12 bg-[#6b4423]"></div>
      </div>
      <div className="absolute top-[110px] right-20 flex flex-col items-center">
        <div className="w-16 h-20 bg-[#2d5016] rounded-full"></div>
        <div className="w-5 h-14 bg-[#6b4423]"></div>
      </div>
      
      {/* Path for NPCs with stone texture */}
      <div className="absolute top-[180px] w-full h-32 bg-[#9b8b7e] border-y-4 border-[#7a6d61]">
        {/* Stone pattern */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-[#8a7a6d] border border-[#6b5e52] rounded-sm"
            style={{
              left: `${(i % 10) * 80 + (Math.floor(i / 10) % 2) * 40}px`,
              top: `${Math.floor(i / 10) * 60}px`,
              width: '32px',
              height: '24px'
            }}
          ></div>
        ))}
      </div>
      
      {/* Shop Building with enhanced details */}
      <div className="absolute bg-[#d2a679] w-[400px] h-[250px] left-[200px] top-[100px] border-4 border-[#4b2d3a] shadow-2xl">
          {/* Roof with texture */}
          <div className="absolute -top-10 left-[-20px] w-[440px] h-[40px] bg-[#8c5a3c] border-4 border-[#4b2d3a] -skew-y-6 z-10 shadow-lg">
            {/* Roof tiles */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute top-2 h-6 w-12 bg-[#7a4a2c] border-r border-[#6b3a1c]" style={{ left: `${i * 55}px` }}></div>
            ))}
          </div>
          
          {/* Chimney */}
          <div className="absolute -top-24 right-16 w-8 h-16 bg-[#8c5a3c] border-2 border-[#4b2d3a] z-20">
            <div className="absolute -top-2 -left-1 w-10 h-3 bg-[#6b4423] border-2 border-[#4b2d3a]"></div>
            {/* Smoke */}
            <div className="absolute -top-8 left-1 w-6 h-6 bg-gray-300 rounded-full opacity-50 animate-pulse"></div>
          </div>
          
          {/* Window (exterior) */}
          <div className="absolute top-6 left-8 w-16 h-20 bg-[#87CEEB] border-4 border-[#4b2d3a]">
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-[#4b2d3a]"></div>
            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-[#4b2d3a]"></div>
            {/* Window shine */}
            <div className="absolute top-1 left-1 w-4 h-4 bg-white opacity-40"></div>
          </div>
          
          {/* Sign */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#6b4423] border-4 border-[#4b2d3a] px-3 py-1 z-20">
            <p className="text-xl text-yellow-200 font-bold text-shadow">🧀 CHEESE SHOP</p>
          </div>
          
          {/* Interior Floor with pattern */}
          <div className="w-full h-full bg-[#a07b56] relative overflow-hidden">
            {/* Floor tiles */}
            {[...Array(40)].map((_, i) => (
              <div 
                key={i}
                className={`absolute border border-[#8b6a46] ${(Math.floor(i / 10) + (i % 10)) % 2 === 0 ? 'bg-[#a07b56]' : 'bg-[#9a7550]'}`}
                style={{
                  left: `${(i % 10) * 40}px`,
                  top: `${Math.floor(i / 10) * 62.5}px`,
                  width: '40px',
                  height: '62.5px'
                }}
              ></div>
            ))}
            
            {/* Back Wall with depth */}
            <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-[#b89968] to-[#c2a26e] border-b-4 border-[#4b2d3a]">
                {/* Wall paneling */}
                <div className="absolute top-8 left-0 right-0 h-0.5 bg-[#4b2d3a] opacity-30"></div>
                <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-[#4b2d3a] opacity-30"></div>
                
                {/* Enhanced Left Shelf */}
                <div className="absolute top-4 left-4 w-20 h-36 bg-[#6b442c] border-2 border-black shadow-md">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#5a3320]"></div>
                  <div className="absolute top-10 left-0 right-0 h-1 bg-[#5a3320]"></div>
                  <div className="absolute top-20 left-0 right-0 h-1 bg-[#5a3320]"></div>
                  <div className="absolute top-30 left-0 right-0 h-1 bg-[#5a3320]"></div>
                  
                  {/* Cheese wheels on shelf with images */}
                  <div 
                    className="absolute top-2 left-2 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Cheddar.jpg)', backgroundSize: 'cover' }}
                  ></div>
                  <div 
                    className="absolute top-2 left-10 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Gouda.jpg)', backgroundSize: 'cover' }}
                  ></div>
                  <div 
                    className="absolute top-12 left-2 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Brie.jpg)', backgroundSize: 'cover' }}
                  ></div>
                  <div 
                    className="absolute top-12 left-10 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Cheddar.jpg)', backgroundSize: 'cover' }}
                  ></div>
                  <div 
                    className="absolute top-22 left-6 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Gouda.jpg)', backgroundSize: 'cover' }}
                  ></div>
                </div>
                
                {/* Enhanced Right Shelf */}
                <div className="absolute top-4 right-4 w-20 h-36 bg-[#6b442c] border-2 border-black shadow-md">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#5a3320]"></div>
                  <div className="absolute top-10 left-0 right-0 h-1 bg-[#5a3320]"></div>
                  <div className="absolute top-20 left-0 right-0 h-1 bg-[#5a3320]"></div>
                  
                  {/* Cheese wheels with images */}
                  <div 
                    className="absolute top-2 left-2 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Cheddar.jpg)', backgroundSize: 'cover' }}
                  ></div>
                  <div 
                    className="absolute top-2 left-10 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Brie.jpg)', backgroundSize: 'cover' }}
                  ></div>
                  <div 
                    className="absolute top-12 left-6 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Gouda.jpg)', backgroundSize: 'cover' }}
                  ></div>
                  <div 
                    className="absolute top-22 left-2 w-6 h-5 rounded-full border border-black shadow-sm overflow-hidden"
                    style={{ backgroundImage: 'url(./img/Cheddar.jpg)', backgroundSize: 'cover' }}
                  ></div>
                </div>
                
                {/* Clock on wall */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-[#8b6914] border-2 border-black rounded-full shadow-md">
                  <div className="absolute inset-1 bg-white rounded-full border border-gray-300">
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-4 bg-black origin-bottom -translate-x-1/2 -translate-y-full rotate-90"></div>
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-black origin-bottom -translate-x-1/2 -translate-y-full"></div>
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
            </div>
          </div>

          {/* Enhanced Counter with depth */}
          <div className="absolute bottom-[60px] left-0 right-0 h-12 bg-gradient-to-b from-[#8c5a3c] to-[#7a4a2c] border-y-4 border-[#6b442c] shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-5 bg-[#6b442c]"></div>
              {/* Wood grain */}
              <div className="absolute top-1 left-0 right-0 h-0.5 bg-[#5a3320] opacity-40"></div>
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-[#5a3320] opacity-30"></div>
              
              {/* Cheese samples on counter with images */}
              <div 
                className="absolute top-[-20px] left-10 w-14 h-7 rounded-md border-2 border-black shadow-md transform -rotate-6 overflow-hidden"
                style={{ backgroundImage: 'url(./img/Cheddar.jpg)', backgroundSize: 'cover' }}
              ></div>
              <div 
                className="absolute top-[-18px] left-28 w-10 h-6 rounded-md border-2 border-black shadow-md transform rotate-12 overflow-hidden"
                style={{ backgroundImage: 'url(./img/Gouda.jpg)', backgroundSize: 'cover' }}
              ></div>
              
              {/* Knife */}
              <div className="absolute top-[-16px] right-20 w-16 h-1 bg-gray-300 border border-black transform rotate-45">
                <div className="absolute -right-2 -top-1 w-3 h-3 bg-[#6b4423] border border-black"></div>
              </div>
              
              {/* Enhanced Cutting Board - THE INTERACTION POINT */}
              <div 
                className="absolute w-28 h-20 bg-[#d2a679] border-4 border-[#a07b56] rounded-md shadow-2xl"
                style={{ left: INTERACTION_POS.x - 200 - 56, top: -16 }}
              >
                {/* Wood grain on cutting board */}
                <div className="absolute top-2 left-2 right-2 h-0.5 bg-[#b89660] opacity-50"></div>
                <div className="absolute top-4 left-2 right-2 h-0.5 bg-[#b89660] opacity-40"></div>
                <div className="absolute top-6 left-2 right-2 h-0.5 bg-[#b89660] opacity-50"></div>
                <div className="absolute top-8 left-2 right-2 h-0.5 bg-[#b89660] opacity-40"></div>
                
                {/* Cut marks */}
                <div className="absolute top-3 left-4 w-12 h-0.5 bg-[#8b6a46] opacity-60 transform rotate-12"></div>
                <div className="absolute top-6 left-8 w-10 h-0.5 bg-[#8b6a46] opacity-60 transform -rotate-6"></div>
              </div>
          </div>
      </div>
      
      {/* Grass tufts */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-3 h-4 bg-[#4a7c32]"
          style={{
            left: `${20 + i * 50}px`,
            top: `${165 + (i % 3) * 5}px`,
            clipPath: 'polygon(50% 0%, 20% 100%, 80% 100%)'
          }}
        ></div>
      ))}
      
      {/* Render NPCs on the path */}
      {npcs.map((npc, index) => (
        <Npc key={npc.id} data={npc} isActive={index === 0} />
      ))}
      
      {/* Render Player inside the shop */}
      <Player position={playerPos} setPosition={setPlayerPos} />

      {/* Interaction Prompt */}
      {canServe && !isServing && (
          <div className="absolute text-white bg-black px-3 py-1 rounded-md border-2 border-white text-2xl animate-bounce z-20 text-shadow" style={{ left: INTERACTION_POS.x - 28, top: INTERACTION_POS.y - 60 }}>
              {t('interaction.pressE')}
          </div>
      )}
    </div>
  );
};

export default GameScene;