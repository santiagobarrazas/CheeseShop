import { Position, CutShape } from './types';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const TILE_SIZE = 32;

export const INITIAL_MONEY = 50;
export const INITIAL_REPUTATION = 50;
export const INITIAL_PROVISIONS = 1000; // in grams

export const PLAYER_SPEED = 3;
export const PLAYER_SIZE = { width: 32, height: 48 };
export const PLAYER_START_POS: Position = { x: 380, y: 250};

// Boundaries for player movement inside the shop
export const SHOP_BOUNDS = { top: 180, bottom: 350, left: 200, right: 600 };

export const NPC_SIZE = { width: 32, height: 48 };
export const MAX_QUEUE_LENGTH = 5;

// --- Difficulty Scaling ---
export const INITIAL_NPC_SPAWN_RATE_MS = 5000;
export const MIN_SPAWN_RATE_MS = 1500; // The fastest spawn rate
export const SPAWN_RATE_DECREASE_PER_MINUTE = 500; // How much faster it gets each minute

export const PATIENCE_DECAY_RATE = 0.1; // points per frame

export const SHOP_WINDOW_POS: Position = { x: 400, y: 190 }; // Where NPCs stand OUTSIDE
export const INTERACTION_POS: Position = { x: 384, y: 270 }; // Where player stands INSIDE, now centered on the cutting board
export const NPC_QUEUE_START_POS: Position = { x: 650, y: 190 };
export const NPC_QUEUE_SPACING = 60;

export const PROVISION_COST_PER_100G = 5;
export const LOW_STOCK_THRESHOLD = 200; // Warning threshold for low provisions

export const CHEESE_TYPES = {
  Cheddar: { basePricePer100g: 8, color: 'bg-yellow-400', borderColor: 'border-yellow-600' },
  Gouda: { basePricePer100g: 10, color: 'bg-orange-300', borderColor: 'border-orange-500' },
  Brie: { basePricePer100g: 12, color: 'bg-yellow-100', borderColor: 'border-yellow-300' },
};

// --- Cut Shape System ---
export interface ShapeDefinition {
  type: CutShape;
  difficulty: number;
  unlockTime: number; // seconds of gameplay
}

export const CUT_SHAPES: ShapeDefinition[] = [
  { type: 'vertical', difficulty: 1, unlockTime: 0 },
  { type: 'horizontal', difficulty: 1, unlockTime: 15 },
  { type: 'diagonal', difficulty: 2, unlockTime: 30 },
  { type: 'zigzag', difficulty: 3, unlockTime: 60 },
  { type: 'circle', difficulty: 4, unlockTime: 90 },
  { type: 'pentagon', difficulty: 5, unlockTime: 120 },
  { type: 'heart', difficulty: 6, unlockTime: 150 },
];

// --- High Score System ---
export const MAX_HIGH_SCORES = 5;
export const HIGH_SCORES_KEY = 'pixelCheeseShopHighScores';