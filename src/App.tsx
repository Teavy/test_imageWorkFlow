import React, { useState, useEffect } from 'react';
import { WorkflowNode, WorkflowConnection, NodeType, TextNodeData, ImageNodeData, VideoNodeData, WorkflowTemplate } from './types';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { FloatingAICommandBar } from './components/FloatingAICommandBar';
import { NodeDetailModal } from './components/NodeDetailModal';
import { WORKFLOW_TEMPLATES } from './data/templates';
import { generateMotionVideoBlob } from './utils/canvasRenderer';

const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'text',
    title: 'Text',
    subtitle: '提示词生成',
    x: 80,
    y: 100,
    width: 290,
    height: 320,
    status: 'idle',
    data: {
      content: '未来赛博朋克城市雨夜，霓虹招牌在湿漉漉的地面投射出倒影，悬浮飞车穿过迷雾，虚幻引擎5真实光照与体积光。',
      placeholder: '双击开始编辑...',
      stylePreset: 'cinematic',
    } as TextNodeData,
  },
  {
    id: 'node-2',
    type: 'image',
    title: 'Image',
    subtitle: '图像渲染器',
    x: 480,
    y: 100,
    width: 290,
    height: 320,
    status: 'idle',
    data: {
      prompt: '',
      aspectRatio: '1:1',
      resolution: '2K',
      style: 'cinematic',
      model: 'Seedream 5.0 Lite',
    } as ImageNodeData,
  },
  {
    id: 'node-3',
    type: 'video',
    title: 'Video',
    subtitle: '视频运镜合成',
    x: 880,
    y: 100,
    width: 320,
    height: 320,
    status: 'idle',
    data: {
      prompt: '3D景深多层次视差推进，环境微风摇曳与生机粒子，体积丁达尔光线',
      cameraMovement: 'dolly_3d',
      duration: 4,
      motionIntensity: 7,
      model: 'Veo 3.1 Motion Synth',
      fps: 30,
    } as VideoNodeData,
  },
];

const INITIAL_CONNECTIONS: WorkflowConnection[] = [
  {
    id: 'conn-1-2',
    fromNodeId: 'node-1',
    toNodeId: 'node-2',
    sourceParam: 'content',
    targetParam: 'prompt',
  },
  {
    id: 'conn-2-3',
    fromNodeId: 'node-2',
    toNodeId: 'node-3',
    sourceParam: 'imageUrl',
    targetParam: 'inputImage',
  },
];

export default function App() {
  const [nodes, setNodes] = useState<WorkflowNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<WorkflowConnection[]>(INITIAL_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-2');
  const [modalNodeId, setModalNodeId] = useState<string | null>(null);

  // Command bar states
  const [selectedModel, setSelectedModel] = useState('Seedream 5.0 Lite');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // Execution states
  const [isTextAiLoading, setIsTextAiLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const activeNodeType: NodeType = selectedNode ? selectedNode.type : 'image';

  // Update a specific node's data
  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, data: newData } : node))
    );
  };

  // Update node coordinates
  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, x, y } : node))
    );
  };

  // Node 1: AI Polish / Text expansion
  const handleRefineTextWithAI = async (customPrompt?: string) => {
    setIsTextAiLoading(true);
    const textNode = nodes.find((n) => n.id === 'node-1');
    const currentContent = customPrompt || (textNode?.data as TextNodeData)?.content || '赛博朋克雨夜';

    try {
      const res = await fetch('/api/ai/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentContent, action: 'expand' }),
      });
      const data = await res.json();
      if (data.text) {
        updateNodeData('node-1', {
          ...(textNode?.data as TextNodeData),
          content: data.text,
        });
        showToast('✨ 节点1 文本提示词已扩写更新');
      }
    } catch (e) {
      console.error(e);
      showToast('⚠️ 文本扩写出现异常，使用备用提示词');
    } finally {
      setIsTextAiLoading(false);
    }
  };

  // Node 2: Image Generation
  const handleGenerateImage = async (customPrompt?: string) => {
    setIsImageGenerating(true);
    const textNode = nodes.find((n) => n.id === 'node-1');
    const imageNode = nodes.find((n) => n.id === 'node-2');
    const imgData = imageNode?.data as ImageNodeData;

    const textContent = (textNode?.data as TextNodeData)?.content?.trim();
    // Prioritize user's subject prompt, combined with upstream scene aesthetics
    let basePrompt = '科幻未来城市';
    if (customPrompt?.trim()) {
      const cleanCustom = customPrompt.trim();
      if (textContent && !textContent.includes(cleanCustom)) {
        basePrompt = `${cleanCustom}，${textContent}`;
      } else {
        basePrompt = cleanCustom;
      }
    } else {
      basePrompt = textContent || imgData.prompt || '科幻未来城市';
    }

    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: basePrompt,
          aspectRatio: imgData.aspectRatio || aspectRatio || '1:1',
          style: imgData.style || 'cinematic',
          previousText: textContent,
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        updateNodeData('node-2', {
          ...imgData,
          imageUrl: data.imageUrl,
          prompt: basePrompt,
        });
        showToast('🎨 节点2 图像渲染完成！已自动传至节点3');
      }
    } catch (e) {
      console.error(e);
      showToast('⚠️ 图像渲染异常');
    } finally {
      setIsImageGenerating(false);
    }
  };

  // Node 3: Video Generation
  const handleGenerateVideo = async (customPrompt?: string) => {
    const textNode = nodes.find((n) => n.id === 'node-1');
    const imageNode = nodes.find((n) => n.id === 'node-2');
    const videoNode = nodes.find((n) => n.id === 'node-3');
    const imgData = imageNode?.data as ImageNodeData;
    const vidData = videoNode?.data as VideoNodeData;

    if (!imgData?.imageUrl) {
      showToast('⚠️ 需先生成节点2的图像作为视频素材输入！');
      return;
    }

    setIsVideoGenerating(true);
    setVideoProgress(0);

    const effectivePrompt = customPrompt || (textNode?.data as TextNodeData)?.content || imgData.prompt || vidData.prompt || 'Cinematic 3D camera parallax';

    try {
      // 1. Call Nano Banana Video AI backend service
      const apiRes = await fetch('/api/ai/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: effectivePrompt,
          inputImage: imgData.imageUrl,
          cameraMovement: vidData.cameraMovement || 'dolly_3d',
          duration: vidData.duration || 4,
          motionIntensity: vidData.motionIntensity || 7,
          model: 'Nano Banana Video',
        }),
      });
      const apiData = await apiRes.json();
      const optimizedPrompt = apiData.videoPrompt || effectivePrompt;

      // 2. Synthesize High Dynamic Nano Banana Video
      const videoUrl = await generateMotionVideoBlob({
        sourceImageUrl: imgData.imageUrl,
        prompt: optimizedPrompt,
        cameraMovement: vidData.cameraMovement || 'dolly_3d',
        motionIntensity: vidData.motionIntensity || 7,
        durationSeconds: vidData.duration || 4,
        onProgress: (p) => setVideoProgress(p),
      });

      if (videoUrl) {
        updateNodeData('node-3', {
          ...vidData,
          videoUrl,
          model: 'Nano Banana Video v2.5',
        });
        showToast('🍌 Nano Banana AI 视频合成完毕，支持播放与下载！');
      }
    } catch (e) {
      console.error(e);
      showToast('⚠️ 视频合成异常');
    } finally {
      setIsVideoGenerating(false);
      setVideoProgress(100);
    }
  };

  // Run Entire Sequential Workflow: 1 -> 2 -> 3
  const handleRunEntirePipeline = async () => {
    if (isRunningPipeline) return;
    setIsRunningPipeline(true);
    showToast('🚀 开始执行全流程 1.Text ➜ 2.Image ➜ 3.Video');

    try {
      // Step 1: Text Polish
      setActiveStep(1);
      await handleRefineTextWithAI();
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Image Generation
      setActiveStep(2);
      await handleGenerateImage();
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Video Generation
      setActiveStep(3);
      await handleGenerateVideo();
      showToast('🎉 完整节点流转运行完毕！');
    } catch (e) {
      console.error('Pipeline error', e);
      showToast('⚠️ 流程执行中断');
    } finally {
      setIsRunningPipeline(false);
      setActiveStep(0);
    }
  };

  // Floating Command Bar Submit Handler
  const handleCommandBarSubmit = async (prompt: string) => {
    if (activeNodeType === 'text') {
      updateNodeData('node-1', {
        ...(nodes[0].data as TextNodeData),
        content: prompt,
      });
      await handleRefineTextWithAI(prompt);
    } else if (activeNodeType === 'image') {
      updateNodeData('node-2', {
        ...(nodes[1].data as ImageNodeData),
        prompt,
      });
      await handleGenerateImage(prompt);
    } else if (activeNodeType === 'video') {
      updateNodeData('node-3', {
        ...(nodes[2].data as VideoNodeData),
        prompt,
      });
      await handleGenerateVideo(prompt);
    }
  };

  // Apply Template
  const handleSelectTemplate = (tpl: WorkflowTemplate) => {
    setNodes([
      {
        ...nodes[0],
        data: {
          ...(nodes[0].data as TextNodeData),
          content: tpl.initialPrompt,
        },
      },
      {
        ...nodes[1],
        data: {
          ...(nodes[1].data as ImageNodeData),
          style: tpl.imageStyle,
          imageUrl: undefined,
        },
      },
      {
        ...nodes[2],
        data: {
          ...(nodes[2].data as VideoNodeData),
          cameraMovement: tpl.videoMovement,
          videoUrl: undefined,
        },
      },
    ]);
    showToast(`✨ 已载入模板: ${tpl.name}`);
  };

  const handleResetWorkflow = () => {
    setNodes(INITIAL_NODES);
    showToast('🔄 已重置画布与节点状态');
  };

  // Find upstream node for modal
  const getUpstreamNode = (nodeId: string): WorkflowNode | null => {
    if (nodeId === 'node-2') return nodes.find((n) => n.id === 'node-1') || null;
    if (nodeId === 'node-3') return nodes.find((n) => n.id === 'node-2') || null;
    return null;
  };

  const modalNode = nodes.find((n) => n.id === modalNodeId) || null;
  const upstreamNode = modalNodeId ? getUpstreamNode(modalNodeId) : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050508] text-slate-300 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        onRunEntirePipeline={handleRunEntirePipeline}
        isRunningPipeline={isRunningPipeline}
        activeStep={activeStep}
        onSelectTemplate={handleSelectTemplate}
        onResetWorkflow={handleResetWorkflow}
      />

      {/* Main Interactive Canvas */}
      <main className="flex-1 relative overflow-hidden">
        <Canvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onSelectNode={(id) => setSelectedNodeId(id)}
          onUpdateTextContent={(content) =>
            updateNodeData('node-1', {
              ...(nodes[0].data as TextNodeData),
              content,
            })
          }
          onOpenNodeModal={(id) => setModalNodeId(id)}
          onRefineTextWithAI={() => handleRefineTextWithAI()}
          onGenerateImage={() => handleGenerateImage()}
          onGenerateVideo={() => handleGenerateVideo()}
          onUpdateNodePosition={updateNodePosition}
          isTextAiLoading={isTextAiLoading}
          isImageGenerating={isImageGenerating}
          isVideoGenerating={isVideoGenerating}
          videoProgress={videoProgress}
          activeStep={activeStep}
        />

        {/* Floating AI Command Bar */}
        <div className="absolute bottom-4 inset-x-0 z-30 pointer-events-none flex justify-center">
          <FloatingAICommandBar
            activeNodeType={activeNodeType}
            activeNodeId={selectedNodeId}
            onSelectNodeType={(type) => {
              const target = nodes.find((n) => n.type === type);
              if (target) setSelectedNodeId(target.id);
            }}
            onSubmit={handleCommandBarSubmit}
            isLoading={isTextAiLoading || isImageGenerating || isVideoGenerating}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            aspectRatio={aspectRatio}
            onSelectAspectRatio={setAspectRatio}
          />
        </div>
      </main>

      {/* Immersive UI Footer Status Bar */}
      <footer className="h-12 border-t border-white/5 flex items-center px-8 bg-[#0a0a12]/50 backdrop-blur-sm z-20 text-[10px] text-slate-500 gap-8">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-slate-400 font-mono tracking-wider">AUTO-PROPAGATE ENABLED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <span className="font-mono">NODES 03/10</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="font-mono text-slate-400">LATENCY 18ms · GPU READY</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <span className="text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors">
            Interactive Node Piping
          </span>
          <span className="text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors">
            TapNow Engine v3
          </span>
        </div>
      </footer>

      {/* Dedicated Node AI Inspector Modal Popup */}
      <NodeDetailModal
        node={modalNode}
        upstreamNode={upstreamNode}
        isOpen={!!modalNodeId}
        onClose={() => setModalNodeId(null)}
        onUpdateNodeData={updateNodeData}
        onRunNode={(id) => {
          if (id === 'node-1') handleRefineTextWithAI();
          else if (id === 'node-2') handleGenerateImage();
          else if (id === 'node-3') handleGenerateVideo();
        }}
        isGenerating={
          (modalNodeId === 'node-1' && isTextAiLoading) ||
          (modalNodeId === 'node-2' && isImageGenerating) ||
          (modalNodeId === 'node-3' && isVideoGenerating)
        }
      />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0f0f1a] border border-indigo-500/40 text-slate-200 text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
