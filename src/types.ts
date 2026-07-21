export interface Track {
  trackNumber: number;
  title: string;
  story?: string;
  lyrics?: string;
  tempoMultiplier: number;
  visualColor: string;
  soundEffects?: string[];
  musicStyle?: string;
  audioBase64?: string;
}
