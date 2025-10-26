// FIX: Removed circular import of GameState.
export enum GameState {
  Start = 'START',
  Playing = 'PLAYING',
  Cutting = 'CUTTING',
  GameOverWarning = 'GAME_OVER_WARNING',
  GameOver = 'GAME_OVER',
}

export type CutShape = 'vertical' | 'horizontal' | 'circle' | 'heart' | 'pentagon' | 'zigzag' | 'diagonal';

export interface Position {
  x: number;
  y: number;
}

export interface Cheese {
    type: 'Cheddar' | 'Gouda' | 'Brie';
    weight: number;
    basePricePer100g: number;
}

export interface Npc {
  id: number;
  position: Position;
  patience: number; // 0-100
  isWaiting: boolean;
  order: Cheese;
  sprite: number;
}

export interface CheeseOrder {
  npcId: number;
  cheeseType: 'Cheddar' | 'Gouda' | 'Brie';
  desiredWeight: number;
  basePricePer100g: number;
  cutShape: CutShape;
  difficulty: number;
}

export interface CutResult {
  accuracy: number;
  weightSold: number;
  finalPrice: number;
  repChange: number;
}

export interface HighScore {
  name: string;
  score: number;
}