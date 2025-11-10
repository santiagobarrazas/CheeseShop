import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import GameScene from './components/GameScene';
import Hud from './components/Hud';
import CheeseCuttingMinigame from './components/CheeseCuttingMinigameNew';
import SettingsMenu from './components/SettingsMenu';
import { Panel } from './components/UiElements';
import { sound } from './src/audio/soundManager';
import { GameState, Npc, CheeseOrder, CutResult, HighScore } from './types';
import {
  INITIAL_MONEY,
  INITIAL_REPUTATION,
  INITIAL_PROVISIONS,
  PROVISION_COST_PER_100G,
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_START_POS,
  INTERACTION_POS,
  PLAYER_SIZE,
  HIGH_SCORES_KEY,
  MAX_HIGH_SCORES,
  CUT_SHAPES,
} from './constants';
import { useGameLoop } from './hooks/useGameLoop';

const HighScoreDisplay: React.FC<{ scores: HighScore[] }> = ({ scores }) => {
  const { t } = useTranslation();
  
  return (
    <div className="w-full max-w-sm mt-4">
      <h3 className="text-3xl text-yellow-300 mb-2 text-center">{t('game.highScores')}</h3>
      <ol className="list-decimal list-inside bg-black bg-opacity-30 p-4 border-2 border-yellow-400">
        {scores.map((score, index) => (
          <li key={index} className="flex justify-between text-2xl mb-1">
            <span>{score.name}</span>
            <span>${score.score}</span>
          </li>
        ))}
        {scores.length === 0 && <p className="text-center text-xl">{t('game.noScoresYet')}</p>}
      </ol>
    </div>
  );
};

const App: React.FC = () => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState<GameState>(GameState.Start);
  const [showSettings, setShowSettings] = useState(false);
  const [money, setMoney] = useState(INITIAL_MONEY);
  const [totalEarnings, setTotalEarnings] = useState(0); // Total money earned during the game
  const [reputation, setReputation] = useState(INITIAL_REPUTATION);
  const [provisions, setProvisions] = useState(INITIAL_PROVISIONS);
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [playerPos, setPlayerPos] = useState(PLAYER_START_POS);
  const [activeOrder, setActiveOrder] = useState<CheeseOrder | null>(null);
  const [canServe, setCanServe] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const [saleFeedback, setSaleFeedback] = useState<{ id: number; amount: number } | null>(null);

  // === Música de fondo SIEMPRE ===
const bgmRef = useRef<HTMLAudioElement | null>(null);

// Usar BASE_URL de Vite para que funcione en / (local) y /CheeseShop/ (GitHub Pages)
const BASE = (import.meta as any).env?.BASE_URL ?? '/';
const BGM_SRC = `${BASE}music/cheese.mp3`; // <-- tu archivo en public/music/cheese.mp3

const startBgm = useCallback(() => {
  // Si ya existe y está en pausa, reintenta play
  if (bgmRef.current) {
    if (bgmRef.current.paused) {
      bgmRef.current.play().catch(() => {});
    }
    return;
  }

  // Crear el audio y arrancar
  const a = new Audio(BGM_SRC);
  a.loop = true;
  a.volume = 0.1; // ajusta 0.0 - 1.0 a tu gusto
  bgmRef.current = a;

  // Intento inicial
  a.play().catch(() => {
    // Si el navegador bloquea autoplay, reintenta al primer click/tecla
    const unlock = () => {
      a.play().finally(() => {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      });
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  });

  // Si por alguna razón termina (no debería por loop), vuelve a arrancar
  a.addEventListener('ended', () => {
    a.currentTime = 0;
    a.play().catch(() => {});
  });
}, []);

useEffect(() => {
  // Arranca el BGM al montar App
  startBgm();

  // También intenta otra vez tras la primera interacción (por si falló el autoplay)
  const retry = () => startBgm();
  window.addEventListener('pointerdown', retry, { once: true });
  window.addEventListener('keydown', retry, { once: true });

  // Limpieza al desmontar
  return () => {
    window.removeEventListener('pointerdown', retry);
    window.removeEventListener('keydown', retry);
    try { bgmRef.current?.pause(); } catch {}
    bgmRef.current = null;
  };
}, [startBgm]);


  useEffect(() => {
    try {
      const storedScores = localStorage.getItem(HIGH_SCORES_KEY);
      if (storedScores) {
        setHighScores(JSON.parse(storedScores));
      }
    } catch (error) {
      console.error("Failed to load high scores:", error);
      setHighScores([]);
    }
  }, []);

  const updateReputation = useCallback((change: number) => {
    setReputation(prev => Math.max(0, Math.min(100, prev + change)));
  }, []);

  const handleGameOver = useCallback((reason: string) => {
    sound.play('warning');
    setGameOverReason(reason);
    setGameState(GameState.GameOverWarning);
  }, []);

  const proceedToGameOver = useCallback(() => {
    sound.play('game_over');
    setGameState(GameState.GameOver);
    
    const lowestScore = highScores.length < MAX_HIGH_SCORES ? 0 : highScores[highScores.length - 1].score;
    if (totalEarnings > lowestScore) {
      setIsNewHighScore(true);
    }
  }, [totalEarnings, highScores]);

  const { resetGameLoop, gameTimeSeconds } = useGameLoop({
    gameState,
    npcs,
    setNpcs,
    updateReputation,
  });

  const startGame = () => {
    sound.play('click');
    setMoney(INITIAL_MONEY);
    setTotalEarnings(0); // Reset total earnings
    setReputation(INITIAL_REPUTATION);
    setProvisions(INITIAL_PROVISIONS);
    setNpcs([]);
    setPlayerPos(PLAYER_START_POS);
    setActiveOrder(null);
    setGameOverReason('');
    setIsNewHighScore(false);
    setPlayerName('');
    resetGameLoop();
    setGameState(GameState.Playing);
  };

  const startServing = useCallback(() => {
    if (!canServe) return;

    const servingNpc = npcs[0];
    if (!servingNpc) return;
    
    const { type, weight, basePricePer100g } = servingNpc.order;

    // Select cut shape based on game time
    const availableShapes = CUT_SHAPES.filter(shape => shape.unlockTime <= gameTimeSeconds);
    const selectedShape = availableShapes[Math.floor(Math.random() * availableShapes.length)];

    setActiveOrder({
      npcId: servingNpc.id,
      cheeseType: type,
      desiredWeight: weight,
      basePricePer100g: basePricePer100g,
      cutShape: selectedShape.type,
      difficulty: selectedShape.difficulty,
    });
    sound.play('start');
    setGameState(GameState.Cutting);
  }, [canServe, npcs, gameTimeSeconds]);

  useEffect(() => {
    const playerCenterX = playerPos.x + PLAYER_SIZE.width / 2;
    const playerCenterY = playerPos.y + PLAYER_SIZE.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(playerCenterX - INTERACTION_POS.x, 2) +
      Math.pow(playerCenterY - INTERACTION_POS.y, 2)
    );

    const isReady = gameState === GameState.Playing && distance < 40 && npcs.length > 0 && npcs[0].isWaiting;
    setCanServe(isReady);
  }, [playerPos, npcs, gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && canServe) {
        startServing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canServe, startServing]);

  useEffect(() => {
      if (gameState === GameState.Cutting && activeOrder) {
          const isNpcStillWaiting = npcs.some(npc => npc.id === activeOrder.npcId);
          if (!isNpcStillWaiting) {
              setGameState(GameState.Playing);
              setActiveOrder(null);
          }
      }
  }, [npcs, gameState, activeOrder]);

  const handleCutComplete = (result: CutResult) => {
    if (!activeOrder) return;
    
    const { weightSold, finalPrice, repChange } = result;

    if (provisions < weightSold) {
        handleGameOver(t('gameOverReasons.orderFailed'));
        return;
    }

    setMoney(prev => prev + finalPrice);
    setTotalEarnings(prev => prev + finalPrice); // Track total earnings
    updateReputation(repChange);
    setProvisions(prev => prev - weightSold);
    
    setSaleFeedback({ id: Date.now(), amount: finalPrice });
    sound.play('cash');
    setTimeout(() => setSaleFeedback(null), 1500);

    setNpcs(prev => prev.slice(1));
    setActiveOrder(null);
    setGameState(GameState.Playing);
  };

  const buyProvisions = (amount: number) => {
    const cost = (amount / 100) * PROVISION_COST_PER_100G;
    if (money >= cost) {
      setMoney(prev => prev - cost);
      setProvisions(prev => prev + amount);
    }
  };
  
  useEffect(() => {
    if (gameState === GameState.Playing && provisions <= 0 && npcs.length === 0 && !activeOrder) {
      handleGameOver(t('gameOverReasons.noStock'));
    }
  }, [provisions, npcs, activeOrder, gameState, handleGameOver, t]);

  useEffect(() => {
    if (reputation <= 0 && gameState === GameState.Playing) {
      handleGameOver(t('gameOverReasons.noReputation'));
    }
  }, [reputation, gameState, handleGameOver, t]);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() === '') return;

    try {
      const newScore: HighScore = { name: playerName.trim(), score: Math.floor(totalEarnings) };
      const updatedScores = [...highScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_HIGH_SCORES);
      
      setHighScores(updatedScores);
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updatedScores));
      setIsNewHighScore(false);
    } catch (error) {
      console.error("Failed to save high score:", error);
    }
  };

  return (
    <div className="bg-[#303030] flex items-center justify-center min-h-screen py-8">
      <div
        className="relative bg-[#5d9250] overflow-hidden pixelated border-8 border-[#4b2d3a]"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {gameState === GameState.Start && (
          <div className="absolute inset-0 bg-black bg-opacity-70 z-20 text-white text-shadow overflow-y-auto">
            <div className="flex flex-col items-center min-h-full pt-12 pb-8 px-8">
              <div className="flex-grow flex flex-col items-center justify-center w-full">
                <h1 className="text-6xl mb-4">{t('game.title')}</h1>
                <p className="text-2xl mb-8 text-center max-w-lg">{t('game.subtitle')}</p>
                <button onClick={startGame} className="text-4xl bg-[#e0a849] text-black px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f0b95a] transition-colors mb-4">
                  {t('game.startButton')}
                </button>
                <button 
                  onClick={() => setShowSettings(true)} 
                  className="text-3xl bg-gray-600 text-white px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-700 transition-colors"
                >
                  ⚙️ {t('game.settings')}
                </button>
                <HighScoreDisplay scores={highScores} />
              </div>
            </div>
          </div>
        )}

        {/* Game Over Warning Screen - Shows reason for losing */}
        {gameState === GameState.GameOverWarning && (
          <div className="absolute inset-0 bg-black bg-opacity-90 z-30 text-white text-shadow overflow-y-auto">
            <div className="flex flex-col items-center min-h-full pt-12 pb-8 px-8">
              <div className="flex-grow flex flex-col items-center justify-center w-full">
                <div className="text-center animate-pulse mb-8">
                  <div className="text-8xl mb-4">💔</div>
                  <h1 className="text-7xl mb-6 text-red-500 font-bold">{t('game.youLost')}</h1>
                </div>
                
                <Panel className="bg-red-900 border-red-700 mb-6">
                  <p className="text-4xl text-center px-8 py-4 text-yellow-200">
                    {gameOverReason}
                  </p>
                </Panel>
                
                <div className="text-center mb-6">
                  <p className="text-3xl text-green-400 mb-2">{t('game.totalEarnings', { amount: totalEarnings.toFixed(0) })}</p>
                  <p className="text-2xl text-gray-300">{t('game.currentMoney', { amount: money.toFixed(0) })}</p>
                </div>
                
                <button 
                  onClick={proceedToGameOver} 
                  className="text-3xl bg-[#e0a849] text-black px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f0b95a] transition-colors animate-bounce"
                >
                  {t('game.continue')}
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === GameState.GameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-70 z-20 text-white text-shadow overflow-y-auto">
            <div className="flex flex-col items-center min-h-full pt-12 pb-8 px-8">
              <div className="flex-grow flex flex-col items-center justify-center w-full">
                <h1 className="text-6xl mb-4">{t('game.gameOver')}</h1>
                {isNewHighScore ? (
                  <form onSubmit={handleSaveScore} className="flex flex-col items-center">
                    <h2 className="text-4xl text-yellow-300 mb-2">{t('game.newHighScore')}</h2>
                    <div className="text-center mb-4">
                      <p className="text-4xl text-green-400 mb-2">{t('game.totalScore')}: ${totalEarnings.toFixed(0)}</p>
                      <p className="text-2xl text-gray-300">{t('game.currentMoney', { amount: money.toFixed(0) })}</p>
                    </div>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder={t('game.enterName')}
                      maxLength={10}
                      className="text-3xl p-2 text-black text-center border-4 border-black"
                    />
                    <button type="submit" className="mt-4 text-3xl bg-green-600 hover:bg-green-700 text-white px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {t('game.saveScore')}
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="text-3xl mb-2">{gameOverReason}</p>
                    <div className="text-center mb-8">
                      <p className="text-4xl text-green-400 mb-2">{t('game.totalScore')}: ${totalEarnings.toFixed(0)}</p>
                      <p className="text-2xl text-gray-300">{t('game.currentMoney', { amount: money.toFixed(0) })}</p>
                    </div>
                    <button onClick={startGame} className="text-4xl bg-[#e0a849] text-black px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#f0b95a] transition-colors">
                      {t('game.playAgain')}
                    </button>
                    <HighScoreDisplay scores={highScores} />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {(gameState === GameState.Playing || gameState === GameState.Cutting) && (
          <>
            <Hud money={money} totalEarnings={totalEarnings} reputation={reputation} provisions={provisions} />
            <GameScene 
              npcs={npcs} 
              playerPos={playerPos} 
              setPlayerPos={setPlayerPos}
              canServe={canServe}
              isServing={gameState === GameState.Cutting}
            />
             {saleFeedback && (
              <div 
                key={saleFeedback.id} 
                className="absolute text-3xl text-yellow-300 font-bold text-shadow animate-float-up z-30 pointer-events-none"
                style={{ left: playerPos.x, top: playerPos.y - 20 }}
              >
                +${saleFeedback.amount}
              </div>
            )}
          </>
        )}
        
        {gameState === GameState.Cutting && activeOrder && (
          <CheeseCuttingMinigame 
            order={activeOrder}
            reputation={reputation}
            onCutComplete={handleCutComplete}
            onCancel={() => {
              sound.play('click');
              setGameState(GameState.Playing);
              setActiveOrder(null);
            }}
          />
        )}
        
        {gameState === GameState.Playing && (
            <div className="absolute bottom-4 right-4 z-10">
                <Panel className="flex flex-col items-center space-y-2">
                    <p className="text-lg">{t('hud.buyProvisions')}</p>
                    <p className="text-sm">{t('provisions.cost', { price: PROVISION_COST_PER_100G })}</p>
                    <div className="flex space-x-2">
                        <button 
                          onClick={() => buyProvisions(100)} 
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 border-2 border-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={money < (100 / 100) * PROVISION_COST_PER_100G}
                        >
                          {t('provisions.buy100')}
                        </button>
                        <button 
                          onClick={() => buyProvisions(500)} 
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 border-2 border-black text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={money < (500 / 100) * PROVISION_COST_PER_100G}
                        >
                          {t('provisions.buy500')}
                        </button>
                    </div>
                </Panel>
            </div>
        )}

        {/* Game Over Warning Screen */}
        {gameState === GameState.Playing && (reputation <= 10 || (provisions <= 50 && npcs.length === 0)) && (
          <div className="absolute inset-0 bg-red-900 bg-opacity-40 z-15 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-80 border-4 border-red-600 p-6 animate-pulse">
              <p className="text-4xl text-red-400 font-bold text-shadow text-center">
                {reputation <= 10 ? '⚠️ ' + t('hud.criticalReputation') : '⚠️ ' + t('hud.criticalStock')}
              </p>
            </div>
          </div>
        )}

        {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  );
};

export default App;