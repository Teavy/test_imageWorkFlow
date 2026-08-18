import React, { useState } from 'react';
import { Sparkles, AlignLeft, Plus, Mic, ArrowUp, ChevronDown, Check, RefreshCw, Cpu, Layers } from 'lucide-react';
import { NodeType } from '../types';

interface FloatingAICommandBarProps {
  activeNodeType: NodeType;
  activeNodeId: string;
  onSelectNodeType: (type: NodeType) => void;
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  aspectRatio: string;
  onSelectAspectRatio: (ratio: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'nano-banana-video', name: 'Nano Banana Video (Gemini Nano)', desc: '轻量端云协同神经视频合成模型' },
  { id: 'seedream-5.0', name: 'Seedream 5.0 Lite', desc: '极速写实渲染模型' },
  { id: 'gemini-flash-image', name: 'Gemini 3.1 Flash Image', desc: 'Google 旗舰级多模态图像' },
  { id: 'veo-lite', name: 'Veo 3.1 Motion Synth', desc: '电影级运镜与视频生成' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash Pro', desc: '深度思考与提示词扩展' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 · 2K (方形头像/主体)' },
  { id: '16:9', label: '16:9 · 4K (电影宽屏/横屏)' },
  { id: '9:16', label: '9:16 · 1080P (短视频/竖屏)' },
  { id: '4:3', label: '4:3 · 2K (经典复古画幅)' },
];

export const FloatingAICommandBar: React.FC<FloatingAICommandBarProps> = ({
  activeNodeType,
  activeNodeId,
  onSelectNodeType,
  onSubmit,
  isLoading = false,
  selectedModel,
  onSelectModel,
  aspectRatio,
  onSelectAspectRatio,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isRatioDropdownOpen, setIsRatioDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [multiplier, setMultiplier] = useState('1x');

  const handleSend = () => {
    if (!promptText.trim() && !isLoading && activeNodeType === 'text') return;
    onSubmit(promptText);
    // Keep promptText intact so user can iterate without losing their prompt
  };

  const handleClearPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPromptText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setPromptText('赛博朋克雨夜街道，极具未来感的光影与虚幻引擎渲染');
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPromptText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
      }
    } catch (e) {
      setIsListening(false);
    }
  };

  const nodeNameMap: Record<NodeType, { name: string; color: string }> = {
    text: { name: '01. Text Input', color: 'text-indigo-400' },
    image: { name: '02. Image Synthesis', color: 'text-purple-400' },
    video: { name: '03. Motion Vector', color: 'text-blue-400' },
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pointer-events-auto">
      {/* Floating Panel Container matching Immersive UI */}
      <div className="bg-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 transition-all">
        {/* Top Control Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Text Mode Pill */}
            <button
              onClick={() => onSelectNodeType('text')}
              className={`p-2 rounded-xl border transition-all ${
                activeNodeType === 'text'
                  ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/40 shadow-inner'
                  : 'bg-white/5 text-slate-400 border-transparent hover:text-slate-200'
              }`}
              title="文本生成控制"
            >
              <AlignLeft className="w-4 h-4" />
            </button>

            {/* Image Mode Pill */}
            <button
              onClick={() => onSelectNodeType('image')}
              className={`p-2 rounded-xl border transition-all ${
                activeNodeType === 'image'
                  ? 'bg-purple-600/30 text-purple-400 border-purple-500/40 shadow-inner'
                  : 'bg-white/5 text-slate-400 border-transparent hover:text-slate-200'
              }`}
              title="图像生成控制"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Video Mode Pill */}
            <button
              onClick={() => onSelectNodeType('video')}
              className={`p-2 rounded-xl border transition-all ${
                activeNodeType === 'video'
                  ? 'bg-blue-600/30 text-blue-400 border-blue-500/40 shadow-inner'
                  : 'bg-white/5 text-slate-400 border-transparent hover:text-slate-200'
              }`}
              title="视频生成控制"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Target Node Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="font-mono text-slate-400 text-[11px]">Target:</span>
            <span className={`font-semibold ${nodeNameMap[activeNodeType].color}`}>
              {nodeNameMap[activeNodeType].name}
            </span>
          </div>
        </div>

        {/* Textarea Input Area */}
        <div className="relative flex items-center">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="描述任何你想要生成或微调的内容（如：女孩坐在草地上、赛博雨夜、风车旋转）..."
            rows={2}
            className="w-full bg-transparent text-slate-100 text-sm placeholder:text-slate-500 resize-none focus:outline-none custom-scrollbar leading-relaxed font-normal pr-7"
          />
          {promptText && (
            <button
              onClick={handleClearPrompt}
              className="absolute right-1 top-1.5 p-1 text-slate-500 hover:text-slate-300 rounded-full hover:bg-white/10 transition-colors"
              title="清空输入"
            >
              <span className="text-xs font-bold leading-none">✕</span>
            </button>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          {/* Left: Model & Resolution Selectors */}
          <div className="flex items-center gap-2">
            {/* Model Selector Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsModelDropdownOpen(!isModelDropdownOpen);
                  setIsRatioDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">{selectedModel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Model Dropdown */}
              {isModelDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#0f0f1a] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1 backdrop-blur-xl">
                  <div className="text-[10px] text-slate-400 px-2 py-1 font-mono uppercase tracking-wider">选择 AI 模型</div>
                  {AVAILABLE_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onSelectModel(m.name);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        selectedModel === m.name
                          ? 'bg-indigo-600/30 text-white font-medium border border-indigo-500/40'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div>
                        <div>{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.desc}</div>
                      </div>
                      {selectedModel === m.name && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Aspect Ratio Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsRatioDropdownOpen(!isRatioDropdownOpen);
                  setIsModelDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>{aspectRatio} · 2K</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Ratio Dropdown */}
              {isRatioDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-56 bg-[#0f0f1a] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1 backdrop-blur-xl">
                  <div className="text-[10px] text-slate-400 px-2 py-1 font-mono uppercase tracking-wider">生成比例与分辨率</div>
                  {ASPECT_RATIOS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectAspectRatio(r.id);
                        setIsRatioDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        aspectRatio === r.id
                          ? 'bg-indigo-600/30 text-white font-medium border border-indigo-500/40'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <span>{r.label}</span>
                      {aspectRatio === r.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Voice Mic, Multiplier, Cost Badge, and Run Button */}
          <div className="flex items-center gap-2">
            {/* Mic */}
            <button
              onClick={handleToggleVoice}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10'
              }`}
              title="语音转文字提示词"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Multiplier pill */}
            <button
              onClick={() => setMultiplier((prev) => (prev === '1x' ? '2x' : prev === '2x' ? '4x' : '1x'))}
              className="px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[11px] border border-white/10"
              title="批量生成数量"
            >
              {multiplier}
            </button>

            {/* Cost Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[11px] font-medium">
              <span>💎</span>
              <span className="font-mono">5</span>
            </div>

            {/* Run Up Arrow Button */}
            <button
              onClick={handleSend}
              disabled={isLoading || (!promptText.trim() && activeNodeType === 'text')}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg ${
                promptText.trim() || activeNodeType !== 'text'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40 active:scale-95'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              title="生成 / 执行当前节点"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
