import React, { useRef, useState, useEffect } from 'react';
import { WorkflowNode, WorkflowConnection, NodeType } from '../types';
import { TextNodeCard } from './TextNodeCard';
import { ImageNodeCard } from './ImageNodeCard';
import { VideoNodeCard } from './VideoNodeCard';
import { ConnectionLine } from './ConnectionLine';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface CanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onUpdateTextContent: (content: string) => void;
  onOpenNodeModal: (nodeId: string) => void;
  onRefineTextWithAI: () => void;
  onGenerateImage: () => void;
  onGenerateVideo: () => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  isTextAiLoading?: boolean;
  isImageGenerating?: boolean;
  isVideoGenerating?: boolean;
  videoProgress?: number;
  activeStep?: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onUpdateTextContent,
  onOpenNodeModal,
  onRefineTextWithAI,
  onGenerateImage,
  onGenerateVideo,
  onUpdateNodePosition,
  isTextAiLoading,
  isImageGenerating,
  isVideoGenerating,
  videoProgress = 0,
  activeStep = 0,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Node dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodeDragOffset, setNodeDragOffset] = useState({ x: 0, y: 0 });

  const textNode = nodes.find((n) => n.id === 'node-1') || nodes[0];
  const imageNode = nodes.find((n) => n.id === 'node-2') || nodes[1];
  const videoNode = nodes.find((n) => n.id === 'node-3') || nodes[2];

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
      setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 1.8));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (draggingNodeId) {
      const node = nodes.find((n) => n.id === draggingNodeId);
      if (node && canvasRef.current) {
        const newX = (e.clientX - pan.x - nodeDragOffset.x) / scale;
        const newY = (e.clientY - pan.y - nodeDragOffset.y) / scale;
        onUpdateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const startDraggingNode = (e: React.MouseEvent, nodeId: string) => {
    // Only start dragging if initiated from header area or drag handle
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setDraggingNodeId(nodeId);
      setNodeDragOffset({
        x: e.clientX - pan.x - node.x * scale,
        y: e.clientY - pan.y - node.y * scale,
      });
    }
  };

  // Center/Fit view
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Find inherited values
  const textContent = (textNode?.data as any)?.content || '';
  const imageUrl = (imageNode?.data as any)?.imageUrl || '';

  return (
    <div
      ref={canvasRef}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-[calc(100vh-112px)] bg-[#050508] overflow-hidden select-none cursor-default"
      style={{
        backgroundImage: `radial-gradient(#4f46e5 0.8px, transparent 0.8px)`,
        backgroundSize: `${24 * scale}px ${24 * scale}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoom / Viewport Controls Floating Pill */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-[#0a0a12]/90 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-xl">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.1, 1.8))}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="放大画布"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-1.5">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="缩小画布"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />
        <button
          onClick={handleResetView}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="重置视图居中"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Scalable & Pannable World Space */}
      <div
        className="absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {/* SVG Connection Lines Overlay */}
        <svg className="absolute inset-0 w-[4000px] h-[4000px] pointer-events-none z-10 overflow-visible">
          {/* Connection 1: Text Node -> Image Node */}
          {textNode && imageNode && (
            <ConnectionLine
              startX={textNode.x + textNode.width}
              startY={textNode.y + textNode.height / 2}
              endX={imageNode.x}
              endY={imageNode.y + imageNode.height / 2}
              isActive={activeStep === 1 || activeStep === 2 || isImageGenerating}
              sourceType="文本提示词"
              targetType="图像生成器"
              onClickPlus={() => onOpenNodeModal(imageNode.id)}
            />
          )}

          {/* Connection 2: Image Node -> Video Node */}
          {imageNode && videoNode && (
            <ConnectionLine
              startX={imageNode.x + imageNode.width}
              startY={imageNode.y + imageNode.height / 2}
              endX={videoNode.x}
              endY={videoNode.y + videoNode.height / 2}
              isActive={activeStep === 2 || activeStep === 3 || isVideoGenerating}
              sourceType="渲染图像"
              targetType="视频合成器"
              onClickPlus={() => onOpenNodeModal(videoNode.id)}
            />
          )}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Node 1: Text Node */}
          {textNode && (
            <div
              className="absolute pointer-events-auto"
              style={{
                left: `${textNode.x}px`,
                top: `${textNode.y}px`,
              }}
              onMouseDown={(e) => {
                if (e.detail === 1 && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                  startDraggingNode(e, textNode.id);
                }
              }}
            >
              <TextNodeCard
                node={textNode}
                isSelected={selectedNodeId === textNode.id}
                onSelect={onSelectNode}
                onUpdateContent={onUpdateTextContent}
                onOpenModal={onOpenNodeModal}
                onRefineWithAI={onRefineTextWithAI}
                isAiLoading={isTextAiLoading}
              />
            </div>
          )}

          {/* Node 2: Image Node */}
          {imageNode && (
            <div
              className="absolute pointer-events-auto"
              style={{
                left: `${imageNode.x}px`,
                top: `${imageNode.y}px`,
              }}
              onMouseDown={(e) => startDraggingNode(e, imageNode.id)}
            >
              <ImageNodeCard
                node={imageNode}
                isSelected={selectedNodeId === imageNode.id}
                onSelect={onSelectNode}
                onOpenModal={onOpenNodeModal}
                onGenerateImage={onGenerateImage}
                inheritedPrompt={textContent}
                isGenerating={isImageGenerating}
              />
            </div>
          )}

          {/* Node 3: Video Node */}
          {videoNode && (
            <div
              className="absolute pointer-events-auto"
              style={{
                left: `${videoNode.x}px`,
                top: `${videoNode.y}px`,
              }}
              onMouseDown={(e) => startDraggingNode(e, videoNode.id)}
            >
              <VideoNodeCard
                node={videoNode}
                isSelected={selectedNodeId === videoNode.id}
                onSelect={onSelectNode}
                onOpenModal={onOpenNodeModal}
                onGenerateVideo={onGenerateVideo}
                hasUpstreamImage={!!imageUrl}
                isGenerating={isVideoGenerating}
                progressPercent={videoProgress}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
