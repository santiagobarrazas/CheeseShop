import React, { useState, useRef, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheeseOrder, CutResult, CutShape } from '../types';
import { CHEESE_TYPES } from '../constants';
import { Panel } from './UiElements';
import { sound } from '../src/audio/soundManager';

interface CheeseCuttingMinigameProps {
  order: CheeseOrder;
  reputation: number;
  onCutComplete: (result: CutResult) => void;
  onCancel: () => void;
}

interface Point {
  x: number;
  y: number;
}

const CHEESE_WHEEL_SIZE = 300;

// Shape path generators
const generateShapePath = (shape: CutShape, size: number): Point[] => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;

  switch (shape) {
    case 'vertical':
      return [
        { x: centerX, y: size * 0.1 },
        { x: centerX, y: size * 0.9 }
      ];
    
    case 'horizontal':
      return [
        { x: size * 0.1, y: centerY },
        { x: size * 0.9, y: centerY }
      ];
    
    case 'diagonal':
      return [
        { x: size * 0.2, y: size * 0.2 },
        { x: size * 0.8, y: size * 0.8 }
      ];
    
    case 'zigzag': {
      const points: Point[] = [];
      const segments = 4;
      const amplitude = size * 0.15;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = size * 0.2 + t * (size * 0.6);
        const y = centerY + (i % 2 === 0 ? -amplitude : amplitude);
        points.push({ x, y });
      }
      return points;
    }
    
    case 'circle': {
      const points: Point[] = [];
      const numPoints = 64;
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
      return points;
    }
    
    case 'pentagon': {
      const points: Point[] = [];
      const sides = 5;
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
        points.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        });
      }
      return points;
    }
    
    case 'heart': {
      const points: Point[] = [];
      const numPoints = 100;
      for (let i = 0; i <= numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        points.push({
          x: centerX + x * (radius / 16),
          y: centerY + y * (radius / 16)
        });
      }
      return points;
    }
    
    default:
      return [{ x: centerX, y: size * 0.1 }, { x: centerX, y: size * 0.9 }];
  }
};

const calculateAccuracy = (userPath: Point[], guidePath: Point[], shape: CutShape): number => {
  if (userPath.length < 2) return 0.1;

  // Simple shapes (lines)
  if (shape === 'vertical' || shape === 'horizontal' || shape === 'diagonal') {
    const [start, end] = guidePath;
    const totalError = userPath.reduce((sum, point) => {
      // Calculate distance from point to line
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lineLength = Math.sqrt(dx * dx + dy * dy);
      
      if (lineLength === 0) return sum;
      
      const distance = Math.abs((dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / lineLength);
      return sum + distance;
    }, 0);
    
    const averageError = totalError / userPath.length;
    const normalizedError = Math.min(1, averageError / 40);
    return Math.max(0.1, 1 - normalizedError);
  }

  // Complex shapes (circle, pentagon, heart, zigzag)
  const totalError = userPath.reduce((sum, userPoint) => {
    // Find minimum distance to guide path
    const minDistance = guidePath.reduce((min, guidePoint) => {
      const dx = userPoint.x - guidePoint.x;
      const dy = userPoint.y - guidePoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return Math.min(min, distance);
    }, Infinity);
    
    return sum + minDistance;
  }, 0);

  const averageError = totalError / userPath.length;
  const normalizedError = Math.min(1, averageError / 30);
  return Math.max(0.1, 1 - normalizedError);
};

const CheeseCuttingMinigame: React.FC<CheeseCuttingMinigameProps> = ({ order, reputation, onCutComplete, onCancel }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'cutting' | 'result'>('cutting');
  const [cutResult, setCutResult] = useState<CutResult | null>(null);

  const [isCutting, setIsCutting] = useState(false);
  const [cutPath, setCutPath] = useState<Point[]>([]);
  const cheeseRef = useRef<HTMLDivElement>(null);

  const cheeseInfo = CHEESE_TYPES[order.cheeseType];
  const guidePath = generateShapePath(order.cutShape, CHEESE_WHEEL_SIZE);

  const getMousePos = (e: MouseEvent<HTMLDivElement>): Point => {
    const rect = cheeseRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (phase !== 'cutting') return;
    setIsCutting(true);
    sound.play('slice');
    setCutPath([getMousePos(e)]);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isCutting && phase === 'cutting') {
      const newPoint = getMousePos(e);
      setCutPath(prev => {
        // Throttle points to avoid too many
        if (prev.length > 0) {
          const lastPoint = prev[prev.length - 1];
          const dx = newPoint.x - lastPoint.x;
          const dy = newPoint.y - lastPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 3) return prev; // Skip if too close
        }
        return [...prev, newPoint];
      });
    }
  };

  const handleMouseUp = () => {
    if (!isCutting || cutPath.length < 2) {
      setIsCutting(false);
      setCutPath([]);
      return;
    }
    setIsCutting(false);
    
    const accuracy = calculateAccuracy(cutPath, guidePath, order.cutShape);
    
    // Difficulty modifier based on shape
    const difficultyBonus = 1 + (order.difficulty - 1) * 0.1;
    
    const cutWeight = order.desiredWeight * (1 + (accuracy - 0.75) * 0.2);
    const weightSold = Math.max(10, cutWeight);
    const repModifier = 0.5 + (reputation / 100);
    const pricePer100g = order.basePricePer100g * repModifier * accuracy * difficultyBonus;
    const finalPrice = Math.round((weightSold / 100) * pricePer100g);

    // Calculate reputation change (harder shapes give more rep)
    const repChange = (accuracy - 0.7) * 10 * (order.difficulty / 3);

    setCutResult({ accuracy, weightSold, finalPrice, repChange });
    if (repChange >= 0) { sound.play('success'); } else { sound.play('fail'); }
    setPhase('result');
  };

  const confirmCut = () => {
    if(cutResult){
        onCutComplete(cutResult);
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-60 z-20 flex items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex flex-col items-center">
        <div className="bg-[#c2a26e] border-4 border-[#4b2d3a] p-4 shadow-lg mb-4 text-shadow text-white">
          <h2 className="text-3xl">{t('minigame.title')}</h2>
          <p className="text-xl text-center">
            {t('minigame.order', { 
              weight: order.desiredWeight, 
              type: t(`cheese.${order.cheeseType}`)
            })}
          </p>
        </div>
        
        <div 
          className="p-8 bg-[#d2a679] rounded-lg border-8 border-[#a07b56] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] flex justify-center items-center"
        >
            <div 
              ref={cheeseRef}
              className={`relative rounded-full border-4 ${cheeseInfo.borderColor} ${cheeseInfo.color} ${phase === 'cutting' ? 'cursor-crosshair' : 'cursor-default'} shadow-inner`}
              style={{ width: CHEESE_WHEEL_SIZE, height: CHEESE_WHEEL_SIZE }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Guide path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline 
                    points={guidePath.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="3"
                    strokeDasharray="8,8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                />
              </svg>

              {/* User's cut path */}
              {cutPath.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <polyline 
                      points={cutPath.map(p => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke={phase === 'result' ? '#00ff00' : '#ff3333'} 
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                  />
                  </svg>
              )}

              {phase === 'result' && cutResult && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Panel className="text-black text-shadow-none text-2xl flex flex-col items-center space-y-1">
                      <h3 className="text-3xl underline">{t('minigame.cutResult')}</h3>
                      <p>{t('minigame.accuracy', { percent: (cutResult.accuracy * 100).toFixed(0) })}</p>
                      <p>{t('minigame.salePrice', { price: cutResult.finalPrice })}</p>
                      <p>
                        {t('minigame.reputationChange', { 
                          change: `${cutResult.repChange >= 0 ? '+' : ''}${cutResult.repChange.toFixed(1)}`
                        })}
                        <span className={`font-bold ml-2 ${cutResult.repChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {cutResult.repChange >= 0 ? '▲' : '▼'}
                        </span>
                      </p>
                      <button onClick={confirmCut} className="mt-2 text-3xl bg-green-600 hover:bg-green-700 text-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        {t('minigame.confirm')}
                      </button>
                    </Panel>
                  </div>
              )}
            </div>
        </div>

        {phase === 'cutting' && (
          <p className="mt-4 text-2xl text-shadow text-white">
            {t('minigame.shapeInstruction', { shape: t(`shapes.${order.cutShape}`) })}
          </p>
        )}
        {phase === 'cutting' && (
          <button onClick={onCancel} className="mt-4 text-2xl bg-red-600 hover:bg-red-700 text-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {t('minigame.cancel')}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheeseCuttingMinigame;
