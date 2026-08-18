import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, Layers, HelpCircle, ChevronDown } from 'lucide-react';
import { WORKFLOW_TEMPLATES } from '../data/templates';
import { WorkflowTemplate } from '../types';

interface HeaderProps {
  onRunEntirePipeline: () => void;
  isRunningPipeline: boolean;
  activeStep: number; // 0, 1, 2, 3
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onResetWorkflow: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRunEntirePipeline,
  isRunningPipeline,
  activeStep,
  onSelectTemplate,
  onResetWorkflow,
}) => {
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a12]/80 backdrop-blur-md z-20 select-none relative">
      {/* Brand & Logo matching Immersive UI */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-3.5 h-3.5 border-2 border-white rounded-full"></div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            FLOW<span className="text-indigo-400">NODE</span>
          </span>
        </div>

        {/* Workflow Breadcrumbs / Steps */}
        <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
          <div className={`flex items-center gap-1.5 ${activeStep >= 1 ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStep === 1 ? 'bg-indigo-400 animate-ping' : activeStep > 1 ? 'bg-indigo-400' : 'bg-slate-600'}`} />
            <span>01. Text Input</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-1.5 ${activeStep >= 2 ? 'text-purple-400 font-semibold' : 'text-slate-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStep === 2 ? 'bg-purple-400 animate-ping' : activeStep > 2 ? 'bg-purple-400' : 'bg-slate-600'}`} />
            <span>02. Image Synthesis</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-1.5 ${activeStep >= 3 ? 'text-blue-400 font-semibold' : 'text-slate-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeStep === 3 ? 'bg-blue-400 animate-ping' : 'bg-slate-600'}`} />
            <span>03. Motion Vector</span>
          </div>
        </div>
      </div>

      {/* Center / Right Action Buttons */}
      <div className="flex items-center gap-4">
        {/* System Status Pill from Immersive UI */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-slate-300">
          <div className={`w-2 h-2 rounded-full ${isRunningPipeline ? 'bg-indigo-400 animate-spin' : 'bg-green-500 animate-pulse'}`}></div>
          <span>{isRunningPipeline ? 'System: Generating' : 'System: Optimal'}</span>
        </div>

        {/* Template Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 text-xs border border-white/10 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>灵感模板</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isTemplateMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0f0f1a] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 space-y-1 backdrop-blur-xl">
              <div className="text-[10px] text-slate-400 px-2 py-1 font-mono uppercase tracking-wider">选择工作流模板</div>
              {WORKFLOW_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    onSelectTemplate(tpl);
                    setIsTemplateMenuOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300">{tpl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">{tpl.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{tpl.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={onResetWorkflow}
          className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
          title="重置工作流"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Help */}
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
          title="节点流转说明"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Run Workflow Button */}
        <button
          onClick={onRunEntirePipeline}
          disabled={isRunningPipeline}
          className={`flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-indigo-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait`}
        >
          {isRunningPipeline ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
          <span>{isRunningPipeline ? `Running Pipeline (${activeStep}/3)...` : 'Run Workflow'}</span>
        </button>
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 max-w-md space-y-4 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                FLOWNODE 沉浸式流转机制
              </h4>
              <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p>• <strong className="text-indigo-400">01. Text Input</strong>: 输入核心提示词，由 AI 扩写并输出至下游图像节点。</p>
              <p>• <strong className="text-purple-400">02. Image Synthesis</strong>: 自动继承文本提示词，合成高清画面素材。</p>
              <p>• <strong className="text-blue-400">03. Motion Vector</strong>: 接收上一节点渲染图，合成真实电影感动态运镜视频。</p>
              <p>• <strong>AI 浮窗微调</strong>: 每个节点配备独立浮动小窗，可随时让 AI 介入微调光影与运镜参数。</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

