import React, { useState, useRef } from 'react';
import { Video as VideoIcon, Play, Pause, RotateCcw, Download, Sparkles, MessageSquare, RefreshCw, Film } from 'lucide-react';
import { WorkflowNode, VideoNodeData } from '../types';

interface VideoNodeCardProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onOpenModal: (nodeId: string) => void;
  onGenerateVideo: () => void;
  hasUpstreamImage?: boolean;
  isGenerating?: boolean;
  progressPercent?: number;
}

export const VideoNodeCard: React.FC<VideoNodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onOpenModal,
  onGenerateVideo,
  hasUpstreamImage = false,
  isGenerating = false,
  progressPercent = 0,
}) => {
  const data = node.data as VideoNodeData;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.videoUrl) {
      const a = document.createElement('a');
      a.href = data.videoUrl;
      a.download = `flownode-video-${Date.now()}.webm`;
      a.click();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 4);
    }
  };

  return (
    <div
      onClick={() => onSelect(node.id)}
      className={`relative group transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.35)]'
          : 'hover:ring-1 hover:ring-white/20'
      }`}
      style={{
        width: `${node.width}px`,
        height: `${node.height}px`,
        borderRadius: '16px',
      }}
    >
      {/* Main Immersive Card Container */}
      <div className="w-full h-full bg-[#0f0f1a] border border-white/10 rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl shadow-blue-900/10 relative">
        {/* Node Header matching Immersive UI */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a12]/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              03. Motion Vector
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(node.id);
              }}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors ml-1"
            >
              AI 调试
            </button>
          </div>
        </div>

        {/* Card Body - Video Display Area */}
        <div className="p-4 flex-1 flex flex-col justify-between min-h-0">
          {/* Main Video Frame */}
          <div className="w-full aspect-[16/9] bg-[#1a1a2e] rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center group/video">
            {isGenerating ? (
              // Generating state with dynamic progress bar and stage feedback
              <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 w-full">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl border-2 border-yellow-400/40 border-t-yellow-400 animate-spin flex items-center justify-center" />
                  <Film className="w-4 h-4 text-yellow-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-[11px] text-yellow-300 font-medium flex items-center gap-1.5">
                  <span>🍌 Nano Banana 神经视频合成</span>
                  <span className="font-mono text-yellow-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="text-[9px] text-slate-400">
                  {progressPercent < 30 ? '正在对齐时序动态特征...' : progressPercent < 75 ? '3D 景深多层视差与微风扰动渲染...' : '正在封装 4K 60FPS 神经视频...'}
                </div>
                <div className="w-4/5 bg-white/10 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
                  <div
                    className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 h-full rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(234,179,8,0.5)]"
                    style={{ width: `${Math.max(5, progressPercent)}%` }}
                  />
                </div>
              </div>
            ) : data.videoUrl ? (
              // Generated Video Player
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={data.videoUrl}
                  loop
                  muted
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Video Controls Overlay */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 flex flex-col gap-1 opacity-90 group-hover/video:opacity-100 transition-opacity"
                >
                  <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="bg-blue-500 h-full"
                      style={{ width: `${(currentTime / (duration || 4)) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white">
                    <div className="flex items-center gap-1.5">
                      <button onClick={togglePlay} className="p-0.5 hover:bg-white/20 rounded">
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
                      </button>
                      <span className="font-mono text-slate-300">
                        {currentTime.toFixed(1)}s / {(duration || 4).toFixed(1)}s
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={handleDownload} className="p-0.5 hover:bg-white/20 rounded" title="下载视频">
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.play();
                            setIsPlaying(true);
                          }
                        }}
                        className="p-0.5 hover:bg-white/20 rounded"
                        title="从头播放"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {!isPlaying && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-xl"
                  >
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                )}
              </div>
            ) : (
              // Empty placeholder state
              <div className="flex flex-col items-center justify-center p-3 text-center text-blue-300/40 gap-1">
                <VideoIcon className="w-7 h-7" />
                <span className="text-[10px] font-medium text-slate-400">
                  {hasUpstreamImage ? '等待合成视频' : 'Awaiting Assets'}
                </span>
              </div>
            )}
          </div>

          {/* Info Rows matching Immersive UI */}
          <div className="space-y-1 my-2 bg-black/20 p-2 rounded-lg border border-white/5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Duration</span>
              <span className="text-slate-200 font-mono">04.00s</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Framerate</span>
              <span className="text-slate-200 font-mono">30fps</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Motion Scale</span>
              <span className="text-blue-400 font-mono capitalize">
                {data.cameraMovement ? data.cameraMovement.replace('_', ' ') : 'Moderate'}
              </span>
            </div>
          </div>

          {/* Card Footer */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-mono">
              {data.videoUrl ? '✓ Rendered' : hasUpstreamImage ? 'Ready' : 'Waiting Node 2'}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerateVideo();
              }}
              disabled={isGenerating || !hasUpstreamImage}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-white" />
              )}
              <span>{data.videoUrl ? '重新合成' : '合成视频'}</span>
            </button>
          </div>
        </div>

        {/* Left Input Port */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0f0f1a] border-2 border-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40 z-20"
          title="输入: 继承自图像节点素材"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        </div>
      </div>
    </div>
  );
};
