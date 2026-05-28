'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Story } from '@/types';
import StoryDisplay from './StoryDisplay';

export interface HistoryItem {
  id: string;
  timestamp: number;
  model: string;
  theme?: string;
  story: Story;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export default function HistoryPanel({ history, onDelete, onClear }: HistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP stagger animation for history items
  useEffect(() => {
    if (!containerRef.current) return;

    const items = containerRef.current.querySelectorAll('.history-item');
    if (items.length === 0) return;

    gsap.fromTo(
      items,
      {
        opacity: 0,
        x: -30,
        scale: 0.95,
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(1.5)',
      }
    );
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 text-center">
        <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center animate-bounce-subtle">
          <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-3">暂无生成历史</h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">生成的故事会自动保存在这里，方便随时查看和复制</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">生成历史</h3>
            <p className="text-xs text-gray-500 mt-0.5">{history.length} 条记录</p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2.5 text-xs text-gray-400 hover:text-red-400 glass-light hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-xl transition-all duration-300"
          style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清空历史
        </button>
      </div>

      {/* History List */}
      <div ref={containerRef} className="space-y-4">
        {history.map((item, index) => (
          <div
            key={item.id}
            className="glass-card rounded-2xl overflow-hidden history-item"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-white/[0.02] transition-all duration-300"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-white text-lg truncate">{item.story.title}</h4>
                  <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
                    {item.story.titleEn}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(item.timestamp).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {item.theme && (
                    <span className="tag bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {item.theme}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                  style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                  title="删除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className={`w-8 h-8 rounded-full glass-light flex items-center justify-center transition-all duration-400 ${expandedId === item.id ? 'rotate-180' : ''}`}
                  style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            <div className={`overflow-hidden transition-all duration-500 ${expandedId === item.id ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
              style={{ transitionTimingFunction: 'var(--spring-smooth)' }}
            >
              <div className="px-6 pb-6 border-t border-white/[0.06]">
                <div className="pt-4">
                  <StoryDisplay story={item.story} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
