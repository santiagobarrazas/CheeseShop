import React from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from './UiElements';
import { LOW_STOCK_THRESHOLD } from '../constants';

interface HudProps {
  money: number;
  totalEarnings: number;
  reputation: number;
  provisions: number;
}

const Hud: React.FC<HudProps> = ({ money, totalEarnings, reputation, provisions }) => {
  const { t } = useTranslation();
  const repColor = reputation > 60 ? 'bg-green-500' : reputation > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const isLowStock = provisions < LOW_STOCK_THRESHOLD;

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10 text-shadow text-2xl text-white">
        <Panel className="flex flex-col items-start">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-300 text-3xl">$</span>
            <span className="text-3xl">{Math.floor(money)}</span>
          </div>
          <div className="text-sm text-green-400 -mt-1">
            {t('hud.score')}: ${Math.floor(totalEarnings)}
          </div>
        </Panel>

        <Panel className={`flex flex-col items-end ${isLowStock ? 'animate-pulse bg-red-400' : ''}`}>
           <span className={`text-3xl ${isLowStock ? 'text-red-900' : ''}`}>
             {provisions.toFixed(0)}g
           </span>
           <span className={`text-xl -mt-1 ${isLowStock ? 'text-red-900' : ''}`}>
             {t('hud.cheeseStock')}
           </span>
        </Panel>
      </div>
      
      {/* Reputation bar - bottom left */}
      <div className="absolute bottom-4 left-4 z-10">
        <Panel className="flex flex-col items-center w-48">
          <span className="text-2xl">{t('hud.reputation')}</span>
          <div className="w-full h-5 bg-black bg-opacity-40 border-2 border-black mt-1 p-0.5">
            <div className={`h-full ${repColor} transition-all duration-300`} style={{ width: `${reputation}%` }}></div>
          </div>
          <span className="text-xl mt-1">{Math.floor(reputation)}%</span>
        </Panel>
      </div>
      
      {isLowStock && (
        <div className="absolute top-24 right-4 z-20">
          <Panel className="bg-red-600 border-red-900 animate-pulse">
            <p className="text-3xl text-white font-bold text-shadow">
              ⚠️ {t('hud.lowStockWarning')}
            </p>
          </Panel>
        </div>
      )}
    </>
  );
};

export default Hud;