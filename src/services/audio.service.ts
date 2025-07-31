// src/services/audio.service.ts

class AudioService {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer | null } = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async loadSound(name: string, path: string): Promise<void> {
    if (!this.audioContext) {
      console.warn('AudioContext not available. Cannot load sound.');
      return;
    }
    if (this.sounds[name]) {
      return; // Sound already loaded
    }

    try {
      const response = await fetch(path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[name] = audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${name} from ${path}:`, error);
      this.sounds[name] = null; // Mark as failed to load
    }
  }

  private playSound(name: string): void {
    if (!this.audioContext || !this.sounds[name]) {
      console.warn(`AudioContext not available or sound ${name} not loaded.`);
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name];
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  public async playClickSound(): Promise<void> {
    await this.loadSound('click', '/songs/click-sound-effect.mp3');
    this.playSound('click');
  }

  public async playProcessingCompletedSound(): Promise<void> {
    await this.loadSound('processingCompleted', '/songs/processing-completed.mp3');
    this.playSound('processingCompleted');
  }

  public async playContentPathDoneSound(): Promise<void> {
    await this.loadSound('contentPathDone', '/songs/content-path-done.mp3');
    this.playSound('contentPathDone');
  }
}

export const audioService = new AudioService();