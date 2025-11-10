// FIX: Import React to resolve namespace errors for React types.
import React, { useEffect, useRef, useCallback } from 'react';
import { GameState, Npc } from '../types';
import {
  MAX_QUEUE_LENGTH,
  PATIENCE_DECAY_RATE,
  PATIENCE_DECAY_INCREASE_PER_MINUTE,
  NPC_QUEUE_SPACING,
  SHOP_WINDOW_POS,
  CHEESE_TYPES,
  INITIAL_NPC_SPAWN_RATE_MS,
  MIN_SPAWN_RATE_MS,
  SPAWN_RATE_DECREASE_PER_MINUTE,
  CUT_SHAPES,
} from '../constants';

interface UseGameLoopProps {
  gameState: GameState;
  npcs: Npc[];
  setNpcs: React.Dispatch<React.SetStateAction<Npc[]>>;
  updateReputation: (change: number) => void;
}

interface UseGameLoopReturn {
  resetGameLoop: () => void;
  gameTimeSeconds: number;
}

export const useGameLoop = ({ gameState, npcs, setNpcs, updateReputation }: UseGameLoopProps): UseGameLoopReturn => {
  const lastNpcSpawnTime = useRef(Date.now());
  const gameStartTime = useRef(Date.now());
  const animationFrameId = useRef<number | null>(null);
  const [gameTimeSeconds, setGameTimeSeconds] = React.useState(0);

  const resetGameLoop = useCallback(() => {
    lastNpcSpawnTime.current = Date.now();
    gameStartTime.current = Date.now();
  }, []);

  const gameLoop = useCallback(() => {
    const isGameActive = gameState === GameState.Playing || gameState === GameState.Cutting;

    if (isGameActive) {
      // --- Difficulty Scaling ---
      const elapsedSeconds = (Date.now() - gameStartTime.current) / 1000;
      setGameTimeSeconds(elapsedSeconds);
      const minutesPassed = elapsedSeconds / 60;
      const spawnRateDecrease = Math.floor(minutesPassed) * SPAWN_RATE_DECREASE_PER_MINUTE;
      const currentSpawnRate = Math.max(MIN_SPAWN_RATE_MS, INITIAL_NPC_SPAWN_RATE_MS - spawnRateDecrease);
      
      // Dynamic patience decay - gets worse over time
      const currentPatienceDecay = PATIENCE_DECAY_RATE + (minutesPassed * PATIENCE_DECAY_INCREASE_PER_MINUTE);

      // --- NPC Spawning ---
      if (Date.now() - lastNpcSpawnTime.current > currentSpawnRate && npcs.length < MAX_QUEUE_LENGTH) {
        lastNpcSpawnTime.current = Date.now();
        const cheeseTypeKeys = Object.keys(CHEESE_TYPES) as (keyof typeof CHEESE_TYPES)[];
        const randomCheeseType = cheeseTypeKeys[Math.floor(Math.random() * cheeseTypeKeys.length)];

        // Select cut shape based on difficulty progression
        const availableShapes = CUT_SHAPES.filter(shape => shape.unlockTime <= elapsedSeconds);
        const selectedShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];

        const newNpc: Npc = {
          id: Date.now() + Math.random(),
          position: { x: 850, y: SHOP_WINDOW_POS.y }, // Start off-screen
          patience: 100,
          isWaiting: false,
          sprite: Math.floor(Math.random() * 4),
          order: {
              type: randomCheeseType,
              weight: 50 + Math.floor(Math.random() * 10) * 10, // 50g to 140g
              basePricePer100g: CHEESE_TYPES[randomCheeseType].basePricePer100g,
          }
        };
        setNpcs(prev => [...prev, newNpc]);
      }

      // --- NPC Updates ---
      setNpcs(currentNpcs => {
        const updatedNpcs = currentNpcs.map((npc, index) => {
          let newPatience = npc.patience;
          let newPosition = { ...npc.position };
          let isWaiting = npc.isWaiting;

          const targetX = SHOP_WINDOW_POS.x + (index * NPC_QUEUE_SPACING);
          
          if (Math.abs(newPosition.x - targetX) > 2) {
               newPosition.x -= 2;
          } else {
               newPosition.x = targetX;
               if (index === 0) {
                   isWaiting = true;
               }
          }
          
          newPatience -= currentPatienceDecay; // Use dynamic decay rate

          return { ...npc, patience: newPatience, position: newPosition, isWaiting };
        });

        const impatientNpcs = updatedNpcs.filter(npc => npc.patience <= 0);
        if (impatientNpcs.length > 0) {
          updateReputation(-5 * impatientNpcs.length);
          return updatedNpcs.filter(npc => npc.patience > 0);
        }
        
        return updatedNpcs;
      });
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameState, npcs.length, setNpcs, updateReputation]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);

  return { resetGameLoop, gameTimeSeconds };
};