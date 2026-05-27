'use client';

import { useState, useEffect, useRef } from 'react';
import { Story, StoryConfig, CustomModel } from '@/types';
import { getSettings, hasApiKey, getApiKey, getModelSettings } from '@/lib/settings';
import StoryDisplay from '@/components/StoryDisplay';
import SettingsModal from '@/components/SettingsModal';
import HistoryPanel, { HistoryItem } from '@/components/HistoryPanel';

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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-16 animate-spring-slide-down">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative w-14 h-14 glass-card rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500" style={{ transitionTimingFunction: 'var(--spring-bounce)' }}>
                <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Detective Story Generator</h1>
              <p className="text-xs text-gray-500 mt-1 tracking-wider uppercase">GTarcade Community Tool</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all duration-400 ${
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
                <span className="px-2 py-0.5 text-xs bg-purple-500/30 text-purple-200 rounded-full font-medium animate-spring-pop">
                  {history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2.5 px-5 py-3 btn-secondary text-gray-300 rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">设置</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {/* History Panel */}
          {showHistory && (
            <div className="mb-10 animate-spring-in">
              <HistoryPanel
                history={history}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
              />
            </div>
          )}

          {/* Generator Card */}
          <div className="relative group animate-spring-in">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative glass rounded-3xl p-10 overflow-hidden">
              {/* Inner shimmer */}
              <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-3xl" />

              {/* Top accent line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

              {/* Title */}
              <div className="text-center mb-12 relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 glass-light rounded-full mb-6 animate-bounce-subtle">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  <span className="text-xs text-purple-300 font-medium tracking-wider">AI POWERED</span>
                </div>
                <h2 className="text-5xl font-bold gradient-text mb-4 leading-tight">
                  【谁是凶手】<br />故事生成器
                </h2>
                <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
                  一键生成中英双语侦探推理故事 + AI生图提示词
                </p>
              </div>

              {/* Model Selection */}
              <div className="mb-10">
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-300 mb-5">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  选择模型
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {mounted && customModels.map((m, index) => {
                    const isConfigured = !!m.apiKey;
                    const isSelected = model === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setModel(m.id)}
                        disabled={!isConfigured}
                        className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-400 animate-spring-slide-up stagger-${index + 1} ${
                          isSelected
                            ? 'glass-button text-white scale-105'
                            : isConfigured
                            ? 'glass-card text-gray-400 hover:text-white'
                            : 'glass-light text-gray-600 cursor-not-allowed opacity-50'
                        }`}
                        style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                      >
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-400 ${isSelected ? 'scale-110' : ''}`}>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg ${
                            isSelected
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-purple-500/30'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          }`}>
                            {m.name[0]}
                          </div>
                        </div>
                        <span className="text-sm font-medium">{m.name}</span>
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 animate-spring-pop">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {!isConfigured && (
                          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" title="未配置" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {mounted && configuredModels.length === 0 && (
                  <button
                    onClick={() => setShowSettings(true)}
                    className="mt-5 w-full py-4 text-sm text-purple-400 hover:text-purple-300 glass-card rounded-xl transition-all duration-400 hover:scale-[1.02]"
                    style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                  >
                    尚未配置任何模型，点击这里配置 →
                  </button>
                )}
              </div>

              {/* Theme */}
              <div className="mb-12">
                <label className="flex items-center gap-2.5 text-sm font-medium text-gray-300 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  主题偏好
                  <span className="text-gray-600 text-xs">(可选)</span>
                </label>
                <div className="relative group/input">
                  <input
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="例如：密室杀人、毒杀、不在场证明..."
                    className="w-full px-5 py-4 glass-input rounded-xl text-white placeholder-gray-600"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover/input:text-purple-400 transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !mounted || configuredModels.length === 0}
                className="relative w-full py-5 btn-primary text-white font-semibold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-4">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="animate-fade-in">{generatingText}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    一键生成故事
                  </span>
                )}
              </button>

              {/* Error */}
              {error && (
                <div className="mt-5 p-4 glass-card rounded-xl border-red-500/20 animate-spring-slide-down">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Story Display */}
          {story && !showHistory && (
            <div className="mt-10 animate-spring-in">
              <StoryDisplay story={story} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-24 pb-8 animate-spring-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 glass-light rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
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
