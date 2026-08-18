import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, MessageSquare, Download, Maximize2, RefreshCw, Layers, Play } from 'lucide-react';
import { WorkflowNode, ImageNodeData } from '../types';

interface ImageNodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onOpenModal: (nodeId: string) => void;
  onGenerateImage: () => void;
  inheritedPrompt?: string;
  isGenerating?: boolean;
}

export const ImageNodeCard: React.FC<ImageNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onOpenModal,
  onGenerateImage,
  inheritedPrompt,
  isGenerating = false,
}) => {
  const data = node.data as ImageNodeData;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const effectivePrompt = inheritedPrompt || data.prompt || '';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.imageUrl) {
      const a = document.createElement('a');
      a.href = data.imageUrl;
      a.download = `flownode-image-${Date.now()}.png`;
      a.click();
    }
  };

  return (
    <>
      <div
        onClick={() => onSelect(node.id)}
        className={`relative group transition-all duration-300 cursor-pointer ${
          isSelected
            ? 'ring-2 ring-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.35)]'
            : 'hover:ring-1 hover:ring-white/20'
        }`}
        style={{
          width: `${node.width}px`,
          height: `${node.height}px`,
          borderRadius: '16px',
        }}
      >
        {/* Main Immersive Card Container */}
        <div className="w-full h-full bg-[#0f0f1a] border border-white/10 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl shadow-purple-900/10 relative">
          {/* Node Header matching Immersive UI */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a12]/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
                02. Image Synthesis
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isGenerating ? (
                <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50"></div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenModal(node.id);
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 transition-colors ml-1"
              >
                AI 调试
              </button>
            </div>
          </div>

          {/* Card Body - Image Display Area */}
          <div className="p-4 flex-1 flex flex-col justify-between min-h-0">
            {/* Main Visual Frame */}
            <div className="w-full aspect-[4/3] bg-[#1a1a2e] rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center group/preview">
              {isGenerating ? (
                <div className="text-center p-4 w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent animate-pulse" />
                  <div className="relative z-10">
                    <div className="text-[10px] uppercase text-purple-300 font-bold mb-1.5 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3 h-3 animate-spin text-purple-400" />
                      Processing Output
                    </div>
                    <div className="w-3/4 mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-2/3 animate-pulse rounded-full" />
                    </div>
                  </div>
                </div>
              ) : data.imageUrl ? (
                <>
                  <img
                    src={data.imageUrl}
                    alt={effectivePrompt || 'AI Generated Image'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/preview:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPreviewOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105"
                      title="放大预览"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all hover:scale-105"
                      title="下载原图"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-purple-300 border border-white/10">
                    {data.resolution || '2K'} · {data.aspectRatio || '1:1'}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <ImageIcon className="w-7 h-7 text-purple-400/40 mb-1.5" />
                  <span className="text-[11px] text-slate-400 font-medium">等待生成图像</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">点击下方按钮或运行流转</span>
                </div>
              )}
            </div>

            {/* Inherited Input Prompt Indicator */}
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 truncate max-w-[190px]" title={effectivePrompt}>
                <span className="text-slate-500 italic text-[10px]">Inherited:</span>
                <span className="text-slate-300 font-mono truncate text-[10px]">
                  {effectivePrompt ? `"${effectivePrompt.slice(0, 20)}..."` : '{Node_01.text}'}
                </span>
              </div>
              <span className="text-[10px] text-purple-400/80 font-mono">
                {data.style || 'cinematic'}
              </span>
            </div>

            {/* Card Footer - Generate Button */}
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                {data.imageUrl ? '✓ Ready' : 'Ready to Render'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateImage();
                }}
                disabled={isGenerating}
                className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-md shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3 fill-white" />
                )}
                <span>{data.imageUrl ? '重新渲染' : '生成图像'}</span>
              </button>
            </div>
          </div>

          {/* Left Input Port */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0f0f1a] border-2 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 z-20"
            title="输入: 接收节点 1 提示词"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </div>

          {/* Right Output Port */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-[#0f0f1a] border-2 border-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40 z-20"
            title="输出: 渲染图像 (传递至视频节点)"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          </div>
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {isPreviewOpen && data.imageUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-8"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={data.imageUrl}
              alt="Preview"
              className="max-h-[80vh] w-auto rounded-2xl border border-white/10 shadow-2xl object-contain"
            />
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-purple-900/40"
              >
                <Download className="w-4 h-4" />
                <span>下载高清原图</span>
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-sm font-medium border border-white/10 transition-all"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
