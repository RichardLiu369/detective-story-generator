'use client';

import { useState, useEffect } from 'react';
import { AppSettings, CustomModel } from '@/types';
import { getSettings, saveSettings, addCustomModel, removeCustomModel } from '@/lib/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [activeTab, setActiveTab] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customModel, setCustomModel] = useState<CustomModel>({
    id: '',
    name: '',
    baseUrl: '',
    modelId: '',
    apiKey: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
      const models = getSettings().customModels || [];
      if (models.length > 0 && !activeTab) {
        setActiveTab(models[0].id);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(settings);
    onSave();
    onClose();
  };

  const toggleShowApiKey = (model: string) => {
    setShowApiKey((prev) => ({
      ...prev,
      [model]: !prev[model],
    }));
  };

  const handleAddCustomModel = () => {
    if (!customModel.id || !customModel.name || !customModel.baseUrl || !customModel.modelId || !customModel.apiKey) {
      alert('请填写所有必填字段');
      return;
    }

    const newModel: CustomModel = {
      ...customModel,
      id: `custom-${customModel.id}`,
    };

    addCustomModel(newModel);
    setSettings(getSettings());
    setShowCustomForm(false);
    setActiveTab(newModel.id);
    setCustomModel({
      id: '',
      name: '',
      baseUrl: '',
      modelId: '',
      apiKey: '',
      description: '',
    });
  };

  const handleRemoveCustomModel = (modelId: string) => {
    if (confirm('确定要删除这个自定义模型吗？')) {
      removeCustomModel(modelId);
      setSettings(getSettings());
      setActiveTab('');
    }
  };

  if (!isOpen) return null;

  const isCustomModel = activeTab.startsWith('custom-');
  const customModelData = settings.customModels?.find((m) => m.id === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] mx-4 glass rounded-3xl overflow-hidden animate-spring-in">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
          <div>
            <h2 className="text-2xl font-bold gradient-text">模型配置</h2>
            <p className="text-sm text-gray-400 mt-1">配置你的AI模型API密钥</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-white glass-light rounded-xl transition-all duration-300 hover:bg-white/10"
            style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(85vh-160px)]">
          {/* Sidebar - Model List */}
          <div className="w-64 border-r border-white/[0.06] overflow-y-auto p-4">
            <div className="space-y-2">
              {/* Custom Models */}
              {settings.customModels?.map((model, index) => (
                <div
                  key={model.id}
                  className="flex items-center gap-1 animate-spring-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <button
                    onClick={() => {
                      setActiveTab(model.id);
                      setShowCustomForm(false);
                    }}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === model.id
                        ? 'glass-button text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                  >
                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-sm font-bold text-white">
                      {model.name[0]}
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500 truncate">{model.modelId}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRemoveCustomModel(model.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                    style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add Custom Model Button */}
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
                style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
              >
                <div className="w-8 h-8 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center hover:border-purple-400 transition-colors duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">添加自定义模型</div>
                </div>
              </button>
            </div>
          </div>

          {/* Main Content - Model Settings */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Custom Model Form */}
            {showCustomForm && (
              <div className="space-y-6 animate-spring-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">添加自定义模型</h3>
                    <p className="text-sm text-gray-400 mt-1">配置任何兼容OpenAI接口的模型</p>
                  </div>
                </div>

                {/* Model Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    模型名称 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customModel.name}
                    onChange={(e) => setCustomModel({ ...customModel, name: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="例如：My Custom Model"
                    className="w-full px-5 py-3.5 glass-input rounded-xl text-white placeholder-gray-500"
                  />
                </div>

                {/* API Key */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    API Key <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={customModel.apiKey}
                    onChange={(e) => setCustomModel({ ...customModel, apiKey: e.target.value })}
                    placeholder="输入 API Key"
                    className="w-full px-5 py-3.5 glass-input rounded-xl text-white placeholder-gray-500"
                  />
                </div>

                {/* Base URL */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Base URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customModel.baseUrl}
                    onChange={(e) => setCustomModel({ ...customModel, baseUrl: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="w-full px-5 py-3.5 glass-input rounded-xl text-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">OpenAI兼容接口地址</p>
                </div>

                {/* Model ID */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Model ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={customModel.modelId}
                    onChange={(e) => setCustomModel({ ...customModel, modelId: e.target.value })}
                    placeholder="gpt-4o"
                    className="w-full px-5 py-3.5 glass-input rounded-xl text-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">模型标识符</p>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    描述 <span className="text-gray-600">(可选)</span>
                  </label>
                  <input
                    type="text"
                    value={customModel.description}
                    onChange={(e) => setCustomModel({ ...customModel, description: e.target.value })}
                    placeholder="模型描述"
                    className="w-full px-5 py-3.5 glass-input rounded-xl text-white placeholder-gray-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleAddCustomModel}
                    className="px-8 py-3 btn-primary text-white font-medium rounded-xl"
                  >
                    添加模型
                  </button>
                  <button
                    onClick={() => setShowCustomForm(false)}
                    className="px-6 py-3 btn-secondary text-gray-300 rounded-xl"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Custom Model Settings */}
            {!showCustomForm && isCustomModel && customModelData && (
              <div className="space-y-6 animate-spring-in">
                {/* Model Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">{customModelData.name[0]}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{customModelData.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{customModelData.description || '自定义模型'}</p>
                  </div>
                </div>

                {/* API Key */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    API Key
                  </label>
                  <div className="relative group">
                    <input
                      type={showApiKey[activeTab] ? 'text' : 'password'}
                      value={customModelData.apiKey}
                      onChange={(e) => {
                        const updatedModels = settings.customModels.map((m) =>
                          m.id === activeTab ? { ...m, apiKey: e.target.value } : m
                        );
                        setSettings({ ...settings, customModels: updatedModels });
                      }}
                      placeholder="输入 API Key"
                      className="w-full px-5 py-3.5 pr-12 glass-input rounded-xl text-white placeholder-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowApiKey(activeTab)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {showApiKey[activeTab] ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Base URL */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={customModelData.baseUrl}
                    onChange={(e) => {
                      const updatedModels = settings.customModels.map((m) =>
                        m.id === activeTab ? { ...m, baseUrl: e.target.value } : m
                      );
                      setSettings({ ...settings, customModels: updatedModels });
                    }}
                    placeholder="https://api.example.com/v1"
                    className="w-full px-5 py-3.5 glass-input rounded-xl text-white placeholder-gray-500"
                  />
                </div>

                {/* Model ID */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    Model ID
                  </label>
                  <input
                    type="text"
                    value={customModelData.modelId}
                    onChange={(e) => {
                      const updatedModels = settings.customModels.map((m) =>
                        m.id === activeTab ? { ...m, modelId: e.target.value } : m
                      );
                      setSettings({ ...settings, customModels: updatedModels });
                    }}
                    placeholder="model-id"
                    className="w-full px-5 py-3.5 glass-input rounded-xl text-white placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!showCustomForm && !isCustomModel && (
              <div className="flex flex-col items-center justify-center h-full text-center animate-spring-in">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mb-6 animate-bounce-subtle">
                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-3">还没有配置模型</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">点击左侧"添加自定义模型"开始配置</p>
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="px-6 py-3 btn-primary text-white rounded-xl"
                >
                  添加模型
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 btn-secondary text-gray-300 rounded-xl"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 btn-primary text-white font-medium rounded-xl"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
