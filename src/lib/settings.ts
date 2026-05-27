import { AppSettings, CustomModel, ModelSettings } from '@/types';

const STORAGE_KEY = 'detective-story-settings';

// Generate default settings
function getDefaultSettings(): AppSettings {
  return {
    models: {},
    customModels: [],
    defaultModel: '',
  };
}

const defaultSettings = getDefaultSettings();

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all models exist
      const mergedModels: Record<string, ModelSettings> = { ...defaultSettings.models };
      Object.keys(parsed.models || {}).forEach((key) => {
        if (parsed.models[key]) {
          mergedModels[key] = parsed.models[key];
        }
      });
      return {
        ...defaultSettings,
        ...parsed,
        models: mergedModels,
        customModels: parsed.customModels || [],
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }

  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function getModelSettings(model: string): ModelSettings {
  const settings = getSettings();
  // Check if it's a custom model
  const customModel = settings.customModels.find((m) => m.id === model);
  if (customModel) {
    return {
      apiKey: customModel.apiKey,
      baseUrl: customModel.baseUrl,
      modelId: customModel.modelId,
    };
  }
  return settings.models[model] || { apiKey: '' };
}

export function updateModelSettings(model: string, modelSettings: Partial<ModelSettings>): void {
  const settings = getSettings();
  settings.models[model] = {
    ...settings.models[model],
    ...modelSettings,
  };
  saveSettings(settings);
}

export function getApiKey(model: string): string {
  const modelSettings = getModelSettings(model);
  return modelSettings.apiKey || '';
}

export function getBaseUrl(model: string): string | undefined {
  const modelSettings = getModelSettings(model);
  return modelSettings.baseUrl;
}

export function getModelId(model: string): string | undefined {
  const modelSettings = getModelSettings(model);
  return modelSettings.modelId;
}

export function hasApiKey(model: string): boolean {
  return !!getApiKey(model);
}

export function getAvailableModels(): string[] {
  const settings = getSettings();
  const presetModels = Object.entries(settings.models)
    .filter(([_, s]) => s.apiKey)
    .map(([id]) => id);
  const customModels = settings.customModels
    .filter((m) => m.apiKey)
    .map((m) => m.id);
  return [...presetModels, ...customModels];
}

// Custom model management
export function getCustomModels(): CustomModel[] {
  const settings = getSettings();
  return settings.customModels || [];
}

export function addCustomModel(model: CustomModel): void {
  const settings = getSettings();
  const existingIndex = settings.customModels.findIndex((m) => m.id === model.id);
  if (existingIndex >= 0) {
    settings.customModels[existingIndex] = model;
  } else {
    settings.customModels.push(model);
  }
  saveSettings(settings);
}

export function removeCustomModel(modelId: string): void {
  const settings = getSettings();
  settings.customModels = settings.customModels.filter((m) => m.id !== modelId);
  // Also remove from models if exists
  delete settings.models[modelId];
  saveSettings(settings);
}

export function updateCustomModel(modelId: string, updates: Partial<CustomModel>): void {
  const settings = getSettings();
  const index = settings.customModels.findIndex((m) => m.id === modelId);
  if (index >= 0) {
    settings.customModels[index] = { ...settings.customModels[index], ...updates };
    saveSettings(settings);
  }
}
