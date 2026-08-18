import React, { useState } from 'react';
import { AlignLeft, Sparkles, MessageSquare, Wand2, Copy, Check, RefreshCw } from 'lucide-react';
import { WorkflowNode, TextNodeData } from '../types';

interface TextNodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onUpdateContent: (content: string) => void;
  onOpenModal: (nodeId: string) => void;
  onRefineWithAI: () => void;
  isAiLoading?: boolean;
}

export const TextNodeCard: React.FC<TextNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onUpdateContent,
  onOpenModal,
  onRefineWithAI,
  isAiLoading = false,
}) => {
  const data = node.data as TextNodeData;
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.content) {
      navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      onClick={() => onSelect(node.id)}
      className={`relative group transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-indigo-500/80 shadow-[0_0_30px_rgba(99,102,241,0.35)]'
          : 'hover:ring-1 hover:ring-white/20'
      }`}
      style={{
        width: `${node.width}px`,
        height: `${node.height}px`,
        borderRadius: '16px',
      }}
    >
      {/* Immersive Node Card Container */}
      <div className="w-full h-full bg-[#0f0f1a] border border-white/10 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl shadow-indigo-900/10 relative">
        {/* Node Header matching Immersive UI */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a12]/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              01. Text Input
            </span>
          </div>

          <div className="flex items-center gap-2">
            {node.status === 'generating' ? (
              <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50"></div>
            )}
          </div>
        </div>

        {/* Card Body with prompt */}
        <div className="p-4 flex-1 flex flex-col justify-between min-h-0">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Workflow Source Prompt</span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                title="复制文本"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(node.id);
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 transition-colors"
              >
                AI 调试
              </button>
            </div>
          </div>

          {/* Text Area Body */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex-1 flex flex-col min-h-0">
            <textarea
              value={data.content || ''}
              onChange={(e) => onUpdateContent(e.target.value)}
              placeholder="A cyberpunk merchant stall in a rainy neon-lit alleyway, hyper-realistic, volumetric lighting."
              className="w-full flex-1 bg-transparent text-slate-200 text-xs leading-relaxed placeholder:text-slate-600 resize-none focus:outline-none custom-scrollbar font-normal"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Quick Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              {data.content ? `${data.content.length} chars` : 'Empty'}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefineWithAI();
              }}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isAiLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 text-amber-300" />
              )}
              <span>AI 扩写润色</span>
            </button>
          </div>
        </div>

        {/* Right Output Connector Port */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-[#0f0f1a] border-2 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 z-20"
          title="输出: 文本提示词 (传递至图像节点)"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        </div>
      </div>
    </div>
  );
};
