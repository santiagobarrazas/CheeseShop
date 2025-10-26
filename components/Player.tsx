import React, { useEffect, useCallback, useRef } from 'react';
import { Position } from '../types';
import { PLAYER_SPEED, PLAYER_SIZE, SHOP_BOUNDS } from '../constants';

interface PlayerProps {
  position: Position;
  setPosition: React.Dispatch<React.SetStateAction<Position>>;
}

const usePlayerMovement = (setPosition: React.Dispatch<React.SetStateAction<Position>>) => {
  const keys = useRef<Record<string, boolean>>({});
  const facing = useRef<'left' | 'right'>('right');
  const isMoving = useRef(false);
  // FIX: Initialize useRef with null to fix "Expected 1 arguments, but got 0" error.
  // Using useRef<number>() can be ambiguous and lead to type errors in some toolchains.
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const movePlayer = useCallback(() => {
    let dx = 0;
    let dy = 0;

    if (keys.current['w'] || keys.current['arrowup']) dy -= PLAYER_SPEED;
    if (keys.current['s'] || keys.current['arrowdown']) dy += PLAYER_SPEED;
    if (keys.current['a'] || keys.current['arrowleft']) {
      dx -= PLAYER_SPEED;
      facing.current = 'left';
    }
    if (keys.current['d'] || keys.current['arrowright']) {
      dx += PLAYER_SPEED;
      facing.current = 'right';
    }

    isMoving.current = dx !== 0 || dy !== 0;

    if (isMoving.current) {
      setPosition(prev => {
        let { x, y } = prev;
        x += dx;
        y += dy;

        // Boundary checks
        const bounds = SHOP_BOUNDS;
        x = Math.max(bounds.left, Math.min(x, bounds.right - PLAYER_SIZE.width));
        y = Math.max(bounds.top, Math.min(y, bounds.bottom - PLAYER_SIZE.height));
        
        return { x, y };
      });
    }
  }, [setPosition]);

  useEffect(() => {
    // FIX: Refactored animation loop to be self-contained and prevent memory leaks.
    const loop = () => {
      movePlayer();
      animationFrameId.current = requestAnimationFrame(loop);
    };
    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if(animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [movePlayer]);

  return { facing: facing.current, isMoving: isMoving.current };
};

const Player: React.FC<PlayerProps> = ({ position, setPosition }) => {
  const { facing, isMoving } = usePlayerMovement(setPosition);

  const animationClass = isMoving ? 'animate-walk' : 'animate-idle';

  return (
    <div
      className="absolute z-10"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${PLAYER_SIZE.width}px`,
        height: `${PLAYER_SIZE.height}px`,
      }}
    >
        <div 
          className={`absolute w-full h-full ${animationClass}`}
          style={{ transform: `scaleX(${facing === 'left' ? -1 : 1})`}}
        >
            {/* Player Sprite Details - Enhanced */}
            {/* Head with better shading */}
            <div className="absolute top-[2px] left-[8px] w-[16px] h-[14px] bg-[#fccb9a] border border-black">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#f5c28f]"></div>
            </div>
            {/* Hair with better detail */}
            <div className="absolute top-0 left-[6px] w-[20px] h-[8px] bg-[#4b2d3a] border-t border-x border-black rounded-t-sm">
              <div className="absolute top-1 left-1 w-2 h-1 bg-[#3a1d2a]"></div>
              <div className="absolute top-1 right-1 w-2 h-1 bg-[#3a1d2a]"></div>
            </div>
            {/* Eyes with better detail */}
            <div className="absolute top-[8px] left-[12px] w-[2px] h-[2px] bg-black rounded-full"></div>
            <div className="absolute top-[8px] left-[18px] w-[2px] h-[2px] bg-black rounded-full"></div>
            {/* Smile */}
            <div className="absolute top-[12px] left-[13px] w-[6px] h-[1px] bg-[#d4a077]"></div>
            
            {/* Shirt (Overalls) with better shading */}
            <div className="absolute top-[16px] left-[6px] w-[20px] h-[16px] bg-[#6b8c42] border-x border-black">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#7a9b51]"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[#5a7c32]"></div>
            </div>
            
            {/* Straps with detail */}
            <div className="absolute top-[16px] left-[8px] w-[4px] h-[10px] bg-[#3a596b] border-x border-black">
              <div className="absolute top-2 left-0 right-0 h-0.5 bg-[#2a4959]"></div>
            </div>
            <div className="absolute top-[16px] left-[20px] w-[4px] h-[10px] bg-[#3a596b] border-x border-black">
              <div className="absolute top-2 left-0 right-0 h-0.5 bg-[#2a4959]"></div>
            </div>
            
            {/* Buttons */}
            <div className="absolute top-[18px] left-[15px] w-[2px] h-[2px] bg-yellow-600 rounded-full border border-black"></div>
            <div className="absolute top-[22px] left-[15px] w-[2px] h-[2px] bg-yellow-600 rounded-full border border-black"></div>
            
            {/* Pants with better shading */}
            <div className="absolute top-[32px] left-[8px] w-[16px] h-[16px] bg-[#3a596b] border border-black">
              <div className="absolute top-0 left-0 w-full h-2 bg-[#4a697b]"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-[#2a4959]"></div>
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-[#2a4959]"></div>
            </div>
            
            {/* Shoes */}
            <div className="absolute top-[46px] left-[8px] w-[6px] h-[2px] bg-[#4b2d3a] border border-black"></div>
            <div className="absolute top-[46px] left-[18px] w-[6px] h-[2px] bg-[#4b2d3a] border border-black"></div>
        </div>
    </div>
  );
};

export default Player;