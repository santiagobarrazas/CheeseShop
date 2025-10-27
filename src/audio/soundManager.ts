
// src/audio/soundManager.ts
type SoundName = 'click' | 'start' | 'slice' | 'success' | 'fail' | 'cash' | 'warning' | 'game_over' | 'npc_in' | 'npc_out' | 'low_stock';

const manifest: Record<SoundName, string> = {
  click: '/sounds/click.wav',
  start: '/sounds/click.wav',
  slice: '/sounds/slice.wav',
  success: '/sounds/success.wav',
  fail: '/sounds/fail.wav',
  cash: '/sounds/cash.wav',
  warning: '/sounds/warning.wav',
  game_over: '/sounds/game_over.wav',
  npc_in: '/sounds/click.wav',
  npc_out: '/sounds/fail.wav',
  low_stock: '/sounds/warning.wav',
};

class SoundManager {
  private enabled: boolean;
  private volume: number;
  private cache: Map<SoundName, HTMLAudioElement>;

  constructor() {
    const stored = localStorage.getItem('soundEnabled');
    const vol = localStorage.getItem('soundVolume');
    this.enabled = stored ? stored === 'true' : true;
    this.volume = vol ? Math.min(1, Math.max(0, parseFloat(vol))) : 0.8;
    this.cache = new Map();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    localStorage.setItem('soundEnabled', String(on));
  }

  getEnabled() { return this.enabled; }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
    localStorage.setItem('soundVolume', String(this.volume));
    // update existing buffers
    this.cache.forEach(a => a.volume = this.volume);
  }

  getVolume() { return this.volume; }

  preload(names: SoundName[]) {
    names.forEach(n => this.getAudio(n));
  }

  private getAudio(name: SoundName): HTMLAudioElement {
    let a = this.cache.get(name);
    if (!a) {
      a = new Audio(manifest[name]);
      a.volume = this.volume;
      this.cache.set(name, a);
    }
    return a;
  }

  play(name: SoundName) {
    if (!this.enabled) return;
    const a = this.getAudio(name);
    try {
      // create a clone to allow overlapping sounds
      const clone = a.cloneNode(true) as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(() => {/* autoplay restrictions */});
    } catch (_) {}
  }
}

export const sound = new SoundManager();
export type { SoundName };
