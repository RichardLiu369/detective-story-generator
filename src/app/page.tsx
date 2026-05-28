'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Story, StoryConfig, CustomModel } from '@/types';
import { getSettings, hasApiKey, getApiKey, getModelSettings } from '@/lib/settings';
import StoryDisplay from '@/components/StoryDisplay';
import SettingsModal from '@/components/SettingsModal';
import HistoryPanel, { HistoryItem } from '@/components/HistoryPanel';
import { useCardTilt } from '@/hooks/useGSAP';

const HISTORY_STORAGE_KEY = 'detective-story-history';

// Animated background orbs
function BackgroundEffects() {
  const [particles] = useState(() =>
    Array.from({ length: 15 }).map((_, i) => ({
      left: `${10 + (i * 5.7 + 13) % 80}%`,
      top: `${10 + (i * 7.3 + 29) % 80}%`,
      width: `${2 + (i * 1.3) % 4}px`,
      height: `${2 + (i * 1.7) % 4}px`,
      animationDelay: `${(i * 0.6) % 8}s`,
      animationDuration: `${8 + (i * 1.1) % 12}s`,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />

      {/* Rotating rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[700px] h-[700px] rounded-full border border-white/[0.02] animate-spin-slow" />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[500px] h-[500px] rounded-full border border-white/[0.03] animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '30s' }} />
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.width,
            height: p.height,
            animationDelay: p.animationDelay,
            animationDuration: p.animationDuration,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDE1IEwgNjAgMTUgTSAxNSAwIEwgMTUgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAxNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
    </div>
  );
}

export default function Home() {
  const [model, setModel] = useState<string>('');
  const [theme, setTheme] = useState('');
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [configuredModels, setConfiguredModels] = useState<string[]>([]);
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [generatingText, setGeneratingText] = useState('');
  const generateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // GSAP refs
  const headerRef = useRef<HTMLElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const generatorCardRef = useCardTilt(3);

  // GSAP entrance animations
  useEffect(() => {
    if (!mounted) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Header entrance
    if (headerRef.current) {
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8 }
      );
    }

    // Left panel entrance
    if (leftPanelRef.current) {
      tl.fromTo(
        leftPanelRef.current,
        { opacity: 0, x: -50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
        '-=0.4'
      );
    }

    // Right panel entrance
    if (rightPanelRef.current) {
      tl.fromTo(
        rightPanelRef.current,
        { opacity: 0, x: 50, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'back.out(1.5)' },
        '-=0.6'
      );
    }

    return () => {
      tl.kill();
    };
  }, [mounted]);

  // Loading text animation
  useEffect(() => {
    if (loading) {
      const texts = ['构思故事中...', '设计嫌疑人...', '埋下线索...', '编写推理...', '生成提示词...'];
      let index = 0;
      setGeneratingText(texts[0]);
      generateIntervalRef.current = setInterval(() => {
        index = (index + 1) % texts.length;
        setGeneratingText(texts[index]);
      }, 2000);
    } else {
      if (generateIntervalRef.current) {
        clearInterval(generateIntervalRef.current);
      }
      setGeneratingText('');
    }
    return () => {
      if (generateIntervalRef.current) {
        clearInterval(generateIntervalRef.current);
      }
    };
  }, [loading]);

  // Load settings and history
  useEffect(() => {
    setMounted(true);

    const settings = getSettings();
    const customConfigured = settings.customModels
      ?.filter((m) => m.apiKey)
      .map((m) => m.id) || [];
    setConfiguredModels(customConfigured);
    setCustomModels(settings.customModels || []);

    if (customConfigured.length > 0) {
      setModel(customConfigured[0]);
    }

    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  const handleGenerate = async () => {
    if (!model) {
      setError('请先选择一个模型');
      return;
    }
    if (!hasApiKey(model)) {
      setError('请先配置该模型的 API Key');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    setStory(null);

    const config: StoryConfig = {
      model,
      theme: theme || undefined,
    };

    try {
      const apiKey = getApiKey(model);
      const modelSettings = getModelSettings(model);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-model': model,
          'x-base-url': modelSettings?.baseUrl || '',
          'x-model-id': modelSettings?.modelId || '',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success && data.story) {
        setStory(data.story);
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          model,
          theme: theme || undefined,
          story: data.story,
        };
        saveHistory([newItem, ...history]);
      } else {
        setError(data.error || '生成失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = () => {
    const settings = getSettings();
    const customConfigured = settings.customModels
      ?.filter((m) => m.apiKey)
      .map((m) => m.id) || [];
    setConfiguredModels(customConfigured);
    setCustomModels(settings.customModels || []);

    if (customConfigured.length > 0 && !customConfigured.includes(model)) {
      setModel(customConfigured[0]);
    }
  };

  const handleDeleteHistory = (id: string) => {
    saveHistory(history.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空所有生成历史吗？')) {
      saveHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header ref={headerRef} className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative w-12 h-12 glass-card rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500" style={{ transitionTimingFunction: 'var(--spring-bounce)' }}>
                <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Detective Story Generator</h1>
              <p className="text-xs text-gray-500 mt-0.5 tracking-wider uppercase">GTarcade Community Tool</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-400 ${
                showHistory
                  ? 'glass-button text-purple-200'
                  : 'btn-secondary text-gray-300'
              }`}
              style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">历史</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-purple-500/30 text-purple-200 rounded-full font-medium">
                  {history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2.5 btn-secondary text-gray-300 rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">设置</span>
            </button>
          </div>
        </header>

        {/* Main Content - Side by Side Layout */}
        <div className="flex-1 flex gap-6 px-8 pb-8 overflow-hidden">
          {/* Left Panel - Control Panel */}
          <div ref={leftPanelRef} className="w-[400px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
            {/* Generator Card */}
            <div ref={generatorCardRef} className="relative group" style={{ transformStyle: 'preserve-3d' }}>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative glass rounded-2xl p-6 overflow-hidden">
                {/* Inner shimmer */}
                <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl" />

                {/* Title */}
                <div className="text-center mb-6 relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-light rounded-full mb-4 animate-bounce-subtle">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                    <span className="text-xs text-purple-300 font-medium tracking-wider">AI POWERED</span>
                  </div>
                  <h2 className="text-2xl font-bold gradient-text mb-2">
                    【谁是凶手】故事生成器
                  </h2>
                  <p className="text-gray-400 text-sm">
                    一键生成中英双语侦探推理故事
                  </p>
                </div>

                {/* Model Selection */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <div className="w-5 h-5 rounded-md bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    选择模型
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {mounted && customModels.map((m, index) => {
                      const isConfigured = !!m.apiKey;
                      const isSelected = model === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setModel(m.id)}
                          disabled={!isConfigured}
                          className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                            isSelected
                              ? 'glass-button text-white'
                              : isConfigured
                              ? 'glass-light text-gray-400 hover:text-white hover:bg-white/[0.04]'
                              : 'glass-light text-gray-600 cursor-not-allowed opacity-50'
                          }`}
                          style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                        >
                          <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                            isSelected
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          }`}>
                            <span className="text-sm font-bold text-white">{m.name[0]}</span>
                          </div>
                          <span className="text-xs font-medium truncate">{m.name}</span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg animate-spring-pop">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          {!isConfigured && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {mounted && configuredModels.length === 0 && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="mt-3 w-full py-3 text-sm text-purple-400 hover:text-purple-300 glass-light rounded-xl transition-all duration-300"
                    >
                      尚未配置模型，点击配置 →
                    </button>
                  )}
                </div>

                {/* Theme */}
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    主题偏好
                    <span className="text-gray-600 text-xs">(可选)</span>
                  </label>
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="输入主题或点击下方标签..."
                    className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-600 text-sm mb-3"
                  />
                  {/* Theme Suggestions - Scrollable Grid */}
                  <div className="max-h-[140px] overflow-y-auto pr-1 custom-scrollbar rounded-xl glass-light p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { en: 'Locked room mystery', zh: '密室杀人' },
                        { en: 'Poison', zh: '毒杀' },
                        { en: 'Alibi contradiction', zh: '不在场证明矛盾' },
                        { en: 'Revenge', zh: '复仇' },
                        { en: 'Inheritance dispute', zh: '遗产纠纷' },
                        { en: 'Art theft', zh: '艺术品盗窃' },
                        { en: 'Crypto murder', zh: '加密货币谋杀' },
                        { en: 'Ship mystery', zh: '船舶谜案' },
                        { en: 'Hotel disappearance', zh: '酒店失踪' },
                        { en: 'Painting forgery', zh: '画作伪造' },
                        { en: 'Midnight duel', zh: '午夜决斗' },
                        { en: 'Spy thriller', zh: '间谍惊悚' },
                        { en: 'Time capsule', zh: '时间胶囊' },
                        { en: 'Virtual reality crime', zh: '虚拟现实犯罪' },
                        { en: 'Space station', zh: '空间站' },
                        { en: 'Isolated island', zh: '孤岛' },
                        { en: 'Train murder', zh: '列车谋杀' },
                        { en: 'Lighthouse keeper', zh: '灯塔守夜人' },
                        { en: 'Casino heist', zh: '赌场劫案' },
                        { en: 'Ghost ship', zh: '幽灵船' },
                        { en: 'Underground tunnel', zh: '地下隧道' },
                        { en: 'Rooftop chase', zh: '屋顶追逐' },
                        { en: 'Museum at night', zh: '深夜博物馆' },
                        { en: 'Opera house', zh: '歌剧院' },
                        { en: 'Yacht party', zh: '游艇派对' },
                        { en: 'Ski resort', zh: '滑雪胜地' },
                        { en: 'Submarine', zh: '潜艇' },
                        { en: 'Abandoned factory', zh: '废弃工厂' },
                        { en: 'Old mansion', zh: '古老庄园' },
                        { en: 'Clock tower', zh: '钟楼' },
                        { en: 'Mirror maze', zh: '镜迷宫' },
                        { en: 'Desert oasis', zh: '沙漠绿洲' },
                        { en: 'Mountain lodge', zh: '山间小屋' },
                        { en: 'Carnival', zh: '嘉年华' },
                        { en: 'Jungle expedition', zh: '丛林探险' },
                        { en: 'Arctic base', zh: '北极基地' },
                        { en: 'Winery', zh: '葡萄酒庄' },
                        { en: 'Theater backstage', zh: '剧院后台' },
                        { en: 'Zoo after dark', zh: '深夜动物园' },
                        { en: 'University campus', zh: '大学校园' },
                      ].map((t) => (
                        <button
                          key={t.en}
                          onClick={() => setTheme(t.en)}
                          className={`text-left px-3 py-2 rounded-lg transition-all duration-300 ${
                            theme === t.en
                              ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                              : 'bg-white/[0.02] text-gray-400 border border-white/[0.04] hover:text-white hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="text-xs font-medium">{t.en}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{t.zh}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="relative w-full py-4 btn-primary text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="animate-fade-in text-sm">{generatingText}</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      一键生成故事
                    </span>
                  )}
                </button>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-3 glass-card rounded-xl border-red-500/20 animate-spring-slide-down">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Content Area */}
          <div ref={rightPanelRef} className="flex-1 overflow-y-auto pr-2">
            {showHistory ? (
              <HistoryPanel
                history={history}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
              />
            ) : story ? (
              <StoryDisplay story={story} />
            ) : (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mb-6 animate-bounce-subtle">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">选择模型，开始创作</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  在左侧配置模型和主题偏好，点击生成按钮即可创作侦探推理故事
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 animate-spring-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="inline-flex items-center gap-3 px-5 py-2 glass-light rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">GTarcade Community</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">Detective Story Generator</span>
          </div>
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSettingsSave}
      />
    </div>
  );
}
