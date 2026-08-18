import React, { useState } from 'react';
import { X, Sparkles, Send, ArrowRight, Wand2, RefreshCw, Film, Image as ImageIcon, AlignLeft, Check } from 'lucide-react';
import { WorkflowNode, TextNodeData, ImageNodeData, VideoNodeData, ChatMessage } from '../types';

interface NodeDetailModalProps {
  node: WorkflowNode | null;
  upstreamNode: WorkflowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNodeData: (nodeId: string, newData: any) => void;
  onRunNode: (nodeId: string) => void;
  isGenerating?: boolean;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  upstreamNode,
  isOpen,
  onClose,
  onUpdateNodeData,
  onRunNode,
  isGenerating = false,
}) => {
  if (!isOpen || !node) return null;

  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `你好！我是当前【${node.title}】节点的 AI 助理。你可以告诉我你想如何微调、补充信息或扩展此节点的内容。`,
      timestamp: '刚刚',
    },
  ]);
  const [isAiReplying, setIsAiReplying] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAiReplying) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: '刚刚',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsAiReplying(true);

    try {
      const response = await fetch('/api/ai/node-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeType: node.type,
          message: currentInput,
          currentData: node.data,
          upstreamData: upstreamNode?.data,
        }),
      });

      const data = await response.json();
      const reply = data.reply || '已收到，我为你推荐了相关配置调整。';

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          suggestedPrompt: data.suggestedPrompt,
          timestamp: '刚刚',
        },
      ]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `针对【${node.title}】节点，已为你优化提示词与参数配置。建议强化光影与构图细节。`,
          suggestedPrompt: `${currentInput}，电影级质感，8K光追，极高细节`,
          timestamp: '刚刚',
        },
      ]);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleApplyPrompt = (text: string) => {
    if (node.type === 'text') {
      onUpdateNodeData(node.id, { ...(node.data as TextNodeData), content: text });
    } else if (node.type === 'image') {
      onUpdateNodeData(node.id, { ...(node.data as ImageNodeData), prompt: text });
    } else if (node.type === 'video') {
      onUpdateNodeData(node.id, { ...(node.data as VideoNodeData), prompt: text });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl shadow-indigo-950/30 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0a0a12]/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              {node.type === 'text' && <AlignLeft className="w-4 h-4" />}
              {node.type === 'image' && <ImageIcon className="w-4 h-4" />}
              {node.type === 'video' && <Film className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {node.title} 节点参数与 AI 控制小窗
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-indigo-300 font-mono border border-white/10">
                  {node.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                在此与专属 AI 助理对话微调参数，优化上下游参数流转
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-y-auto divide-y md:divide-y-0 md:divide-x divide-white/5">
          {/* Left Column: Node Configuration & Upstream Info (5 cols) */}
          <div className="md:col-span-5 p-5 space-y-4 bg-[#0a0a12]/40 overflow-y-auto">
            {/* Upstream Parameter Card */}
            {upstreamNode && (
              <div className="p-3.5 rounded-xl bg-black/30 border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>继承自上游 ({upstreamNode.title})</span>
                </div>
                <div className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/5 break-words leading-relaxed max-h-24 overflow-y-auto font-mono">
                  {upstreamNode.type === 'text' && (upstreamNode.data as TextNodeData).content}
                  {upstreamNode.type === 'image' && (
                    <div className="flex items-center gap-2">
                      {(upstreamNode.data as ImageNodeData).imageUrl ? (
                        <img
                          src={(upstreamNode.data as ImageNodeData).imageUrl}
                          alt="Upstream"
                          className="w-10 h-10 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-500" />
                      )}
                      <span className="text-[11px] text-slate-400">已传递渲染图作为基底</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Node Specific Controls */}
            {node.type === 'text' && (
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium flex items-center justify-between">
                  <span>当前文本内容</span>
                  <span className="text-[10px] text-slate-500">将作为下游节点提示词</span>
                </label>
                <textarea
                  value={(node.data as TextNodeData).content || ''}
                  onChange={(e) =>
                    onUpdateNodeData(node.id, {
                      ...(node.data as TextNodeData),
                      content: e.target.value,
                    })
                  }
                  rows={5}
                  className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed custom-scrollbar"
                  placeholder="在此输入初始概念..."
                />
              </div>
            )}

            {node.type === 'image' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">额外补充提示词 (Modifier)</label>
                  <textarea
                    value={(node.data as ImageNodeData).prompt || ''}
                    onChange={(e) =>
                      onUpdateNodeData(node.id, {
                        ...(node.data as ImageNodeData),
                        prompt: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
                    placeholder="可在此叠加更多光影、材质、画风补充描述..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">画面比例</label>
                    <select
                      value={(node.data as ImageNodeData).aspectRatio}
                      onChange={(e) =>
                        onUpdateNodeData(node.id, {
                          ...(node.data as ImageNodeData),
                          aspectRatio: e.target.value as any,
                        })
                      }
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="1:1">1:1 方形</option>
                      <option value="16:9">16:9 电影宽屏</option>
                      <option value="9:16">9:16 竖屏短视频</option>
                      <option value="4:3">4:3 经典画幅</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">风格滤镜</label>
                    <select
                      value={(node.data as ImageNodeData).style || 'cinematic'}
                      onChange={(e) =>
                        onUpdateNodeData(node.id, {
                          ...(node.data as ImageNodeData),
                          style: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="cinematic">电影级写实</option>
                      <option value="cyberpunk">赛博朋克光影</option>
                      <option value="anime">动漫吉卜力</option>
                      <option value="oriental_ink">国风水墨青绿</option>
                      <option value="unreal_engine">虚幻引擎5 3D</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {node.type === 'video' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">运镜与动态描述</label>
                  <input
                    type="text"
                    value={(node.data as VideoNodeData).prompt || ''}
                    onChange={(e) =>
                      onUpdateNodeData(node.id, {
                        ...(node.data as VideoNodeData),
                        prompt: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    placeholder="如：缓慢镜头推近，金色粒子漂浮..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block">运镜方式 (Camera Movement)</label>
                  <select
                    value={(node.data as VideoNodeData).cameraMovement}
                    onChange={(e) =>
                      onUpdateNodeData(node.id, {
                        ...(node.data as VideoNodeData),
                        cameraMovement: e.target.value as any,
                      })
                    }
                    className="w-full p-2 bg-black/40 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="zoom_in">缓慢推进 (Zoom In)</option>
                    <option value="pan_right">水平向右平移 (Pan Right)</option>
                    <option value="orbit">环绕运镜 (Orbit Rotate)</option>
                    <option value="tilt_up">仰视升镜 (Tilt Up)</option>
                    <option value="cinematic_drift">电影感自然漂移 (Cinematic Drift)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Run Node Button */}
            <div className="pt-2">
              <button
                onClick={() => onRunNode(node.id)}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>立即执行当前【{node.title}】节点</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive AI Copilot Chat (7 cols) */}
          <div className="md:col-span-7 p-5 flex flex-col justify-between space-y-4 bg-[#0f0f1a] min-h-[350px]">
            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wand2 className="w-3 h-3 text-indigo-400" />
                <span>AI 灵感预设指令:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '帮我增加电影级光影与微距细节',
                  '改造成梦幻唯美赛博风格',
                  '增强画面张力与运镜推进感',
                  '精简为最关键的核心英文提示词',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(chip)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Conversation Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px] custom-scrollbar">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[90%] text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white/5 text-slate-200 rounded-bl-none border border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Apply Suggested Prompt Button */}
                    {msg.suggestedPrompt && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 font-mono truncate">
                          建议提示词已生成
                        </span>
                        <button
                          onClick={() => handleApplyPrompt(msg.suggestedPrompt!)}
                          className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[10px] border border-indigo-400/30 flex items-center gap-1 font-medium transition-colors"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>一键填入节点</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isAiReplying && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 text-slate-400 text-xs w-fit border border-white/10">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Gemini 正在思考并提供建议...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="relative flex items-center gap-2 pt-2 border-t border-white/5">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="给本节点 AI 补充信息或提问..."
                className="flex-1 bg-black/40 border border-white/10 focus:border-indigo-500 rounded-full px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isAiReplying}
                className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-indigo-900/40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
