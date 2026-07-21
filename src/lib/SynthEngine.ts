import { Track } from "../types";

export class SynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private trackNumber: number = 1;

  // Audio Buffers
  private audioBufferCache: Record<number, AudioBuffer> = {};
  private activeSource: AudioBufferSourceNode | null = null;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private duration: number = 15; // default WAV loop is 15 seconds

  // Loading state tracking
  private isLoading: boolean = false;

  // Callbacks
  private onStepCallback: ((step: number) => void) | null = null;
  private onLoadingCallback: ((loading: boolean) => void) | null = null;
  private animationFrameId: number | null = null;

  constructor() {}

  public init() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public setVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(val, this.ctx.currentTime + 0.05);
    }
  }

  // Set the current track, pre-fetching the audio
  public async setTrack(
    trackNumber: number, 
    onLoading?: (loading: boolean) => void
  ) {
    this.trackNumber = trackNumber;
    if (onLoading) this.onLoadingCallback = onLoading;

    // Stop current source if switching tracks
    const wasPlaying = this.isPlaying;
    if (this.isPlaying) {
      this.stop();
    }
    this.pauseOffset = 0;

    // Load and decode the track's WAV audio
    await this.loadTrackAudio(trackNumber);

    // Auto-resume if it was previously playing
    if (wasPlaying && this.onStepCallback) {
      this.start(this.onStepCallback);
    }
  }

  // Clear cache when user regenerates/customizes the album
  public clearCache() {
    this.audioBufferCache = {};
  }

  private async loadTrackAudio(trackNumber: number) {
    // If already cached, we are good to go
    if (this.audioBufferCache[trackNumber]) {
      return;
    }

    this.setIsLoading(true);
    this.init();

    try {
      const params = new URLSearchParams({
        trackNumber: trackNumber.toString(),
      });

      const response = await fetch(`/api/album/audio?${params.toString()}`);
      const data = await response.json();

      if (!data.success || !data.audioBase64) {
        throw new Error("Failed to load audio from API");
      }

      // Convert base64 to ArrayBuffer
      const binaryString = window.atob(data.audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio data using our AudioContext
      if (this.ctx) {
        const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer.slice(0));
        this.audioBufferCache[trackNumber] = audioBuffer;
        this.duration = audioBuffer.duration;
      }
    } catch (err) {
      console.error("Error fetching or decoding track audio:", err);
      // Fallback: Create an empty dummy buffer to avoid breaking the player UI
      if (this.ctx) {
        const fallbackBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
        this.audioBufferCache[trackNumber] = fallbackBuffer;
        this.duration = 2.0;
      }
    } finally {
      this.setIsLoading(false);
    }
  }

  private setIsLoading(val: boolean) {
    this.isLoading = val;
    if (this.onLoadingCallback) {
      this.onLoadingCallback(val);
    }
  }

  public async start(onStep: (step: number) => void) {
    this.init();
    if (this.isPlaying) return;

    this.onStepCallback = onStep;
    
    if (this.ctx && this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    // Ensure audio is loaded first
    if (!this.audioBufferCache[this.trackNumber]) {
      await this.loadTrackAudio(this.trackNumber);
    }

    const buffer = this.audioBufferCache[this.trackNumber];
    if (!buffer || !this.ctx) return;

    this.isPlaying = true;

    // Create new buffer source node
    this.activeSource = this.ctx.createBufferSource();
    this.activeSource.buffer = buffer;
    this.activeSource.loop = true;

    // Connect to master gain and output
    this.activeSource.connect(this.masterGain!);

    // Start playing from pause offset
    this.startTime = this.ctx.currentTime - this.pauseOffset;
    this.activeSource.start(0, this.pauseOffset % buffer.duration);

    // Start progress scheduler animation
    this.currentStep = -1;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {
        // Source might have already stopped
      }
      this.activeSource.disconnect();
      this.activeSource = null;
    }

    if (this.ctx) {
      this.pauseOffset = this.ctx.currentTime - this.startTime;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private scheduler() {
    if (!this.ctx || !this.isPlaying) return;

    const elapsed = this.ctx.currentTime - this.startTime;
    const currentSecond = elapsed % this.duration;
    const progressFraction = currentSecond / this.duration;
    
    // Smoothly divide 15-second loop into 16 steps
    const step = Math.floor(progressFraction * 16) % 16;
    
    if (this.currentStep !== step) {
      this.currentStep = step;
      if (this.onStepCallback) {
        this.onStepCallback(step);
      }
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.scheduler());
  }

  // Get current position & progress
  public getPlaybackProgress(): { elapsed: number; total: number; percentage: number } {
    if (!this.ctx) return { elapsed: 0, total: this.duration, percentage: 0 };
    
    const elapsed = this.isPlaying 
      ? (this.ctx.currentTime - this.startTime) % this.duration
      : this.pauseOffset % this.duration;

    const percentage = (elapsed / this.duration) * 100;
    
    return {
      elapsed,
      total: this.duration,
      percentage
    };
  }
}
