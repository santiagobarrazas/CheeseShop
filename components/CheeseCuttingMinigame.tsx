import React, { useState, useRef, MouseEvent } from 'react';
import { CheeseOrder, CutResult } from '../types';
import { CHEESE_TYPES } from '../constants';
import { Panel } from './UiElements';

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

const CheeseCuttingMinigame: React.FC<CheeseCuttingMinigameProps> = ({ order, reputation, onCutComplete, onCancel }) => {
  const [phase, setPhase] = useState<'cutting' | 'result'>('cutting');
  const [cutResult, setCutResult] = useState<CutResult | null>(null);

  const [isCutting, setIsCutting] = useState(false);
  const [cutPath, setCutPath] = useState<Point[]>([]);
  const cheeseRef = useRef<HTMLDivElement>(null);

  const cheeseInfo = CHEESE_TYPES[order.cheeseType];

  const [guidelineX] = useState(CHEESE_WHEEL_SIZE * 0.1 + Math.random() * CHEESE_WHEEL_SIZE * 0.8);

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
    setCutPath([getMousePos(e)]);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isCutting && phase === 'cutting') {
      setCutPath(prev => [...prev, getMousePos(e)]);
    }
  };

  const handleMouseUp = () => {
    if (!isCutting || cutPath.length < 2) {
      setIsCutting(false);
      setCutPath([]);
      return;
    }
    setIsCutting(false);
    
    const totalDistanceError = cutPath.reduce((sum, point) => {
        return sum + Math.abs(point.x - guidelineX);
    }, 0);
    const averageDistanceError = totalDistanceError / cutPath.length;
    const positionError = Math.min(1, averageDistanceError / 50);
    const accuracy = Math.max(0.1, 1 - positionError);
    
    const cutWeight = order.desiredWeight * (1 + (accuracy - 0.75) * 0.2);
    const weightSold = Math.max(10, cutWeight);
    const repModifier = 0.5 + (reputation / 100);
    const pricePer100g = order.basePricePer100g * repModifier * accuracy;
    const finalPrice = Math.round((weightSold / 100) * pricePer100g);

    // Calculate reputation change
    const repChange = (accuracy - 0.7) * 10;

    setCutResult({ accuracy, weightSold, finalPrice, repChange });
    setPhase('result');
  };

  const confirmCut = () => {
    if(cutResult){
        onCutComplete(cutResult);
    }
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-60 z-20 flex items-center justify-center" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex flex-col items-center">
        <div className="bg-[#c2a26e] border-4 border-[#4b2d3a] p-4 shadow-lg mb-4 text-shadow text-white">
          <h2 className="text-3xl">Cut the Cheese!</h2>
          <p className="text-xl text-center">{`Order: ${order.desiredWeight}g of ${order.cheeseType}`}</p>
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
              <div 
                  className="absolute top-0 bottom-0 border-l-4 border-dashed border-black opacity-60 pointer-events-none"
                  style={{ left: guidelineX }}
              ></div>

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
                      <h3 className="text-3xl underline">Cut Result</h3>
                      <p>Accuracy: <span className="font-bold">{(cutResult.accuracy * 100).toFixed(0)}%</span></p>
                      <p>Sale Price: <span className="font-bold">${cutResult.finalPrice}</span></p>
                      <p>Reputation: 
                        <span className={`font-bold ${cutResult.repChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {cutResult.repChange >= 0 ? '+' : ''}{cutResult.repChange.toFixed(1)}
                        </span>
                      </p>
                      <button onClick={confirmCut} className="mt-2 text-3xl bg-green-600 hover:bg-green-700 text-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Confirm</button>
                    </Panel>
                  </div>
              )}
            </div>
        </div>

        {phase === 'cutting' && <p className="mt-4 text-2xl text-shadow text-white">Draw a line along the guide.</p>}
        {phase === 'cutting' && <button onClick={onCancel} className="mt-4 text-2xl bg-red-600 hover:bg-red-700 text-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Cancel</button>}
      </div>
    </div>
  );
};

export default CheeseCuttingMinigame;