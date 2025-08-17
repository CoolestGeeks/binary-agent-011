
export interface VoiceHint {
  language: string;
  style: string;
  rate: number;
  pitch: number;
}

export type AgentAction = 'idle' | 'wave' | 'blink';

export interface Scene {
  duration_ms: number;
  agent_action: AgentAction;
  agent_position: { x: number; y: number }; // Position in % (0-100)
  symbol_art?: string;
  symbol_position?: { x: number; y: number }; // Position in % (0-100)
  caption?: string;
}

export interface ApiResponse {
  narration_ssml: string;
  voice_hint: VoiceHint;
  scenes: Scene[];
}
