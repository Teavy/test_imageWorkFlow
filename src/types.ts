export type NodeType = 'text' | 'image' | 'video';

export interface TextNodeData {
  content: string;
  placeholder?: string;
  stylePreset?: string;
  expandedPrompt?: string;
}

export interface ImageNodeData {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution: '1K' | '2K' | '4K';
  style: string;
  imageUrl?: string;
  model: string;
}

export interface VideoNodeData {
  prompt: string;
  cameraMovement: 'zoom_in' | 'pan_right' | 'orbit' | 'tilt_up' | 'cinematic_drift' | 'wind_sway' | 'dolly_3d';
  duration: number; // in seconds
  motionIntensity: number; // 1 to 10
  videoUrl?: string;
  posterUrl?: string;
  model: string;
  fps: number;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'idle' | 'generating' | 'success' | 'error';
  progress?: number;
  statusMessage?: string;
  data: TextNodeData | ImageNodeData | VideoNodeData;
  error?: string;
}

export interface WorkflowConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  sourceParam: string;
  targetParam: string;
  active?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedPrompt?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  initialPrompt: string;
  imageStyle: string;
  videoMovement: 'zoom_in' | 'pan_right' | 'orbit' | 'tilt_up' | 'cinematic_drift';
}
