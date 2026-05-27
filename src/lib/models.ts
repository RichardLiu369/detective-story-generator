import { AIModel, ModelConfig } from '@/types';

export interface ModelOption {
  id: string;
  name: string;
  baseUrl: string;
  modelId: string;
}

export interface ExtendedModelConfig extends ModelConfig {
  baseUrlOptions: ModelOption[];
  modelIdOptions: { id: string; name: string }[];
}

export const MODEL_CONFIGS: ExtendedModelConfig[] = [];

export function getModelConfig(model: string): ExtendedModelConfig | undefined {
  return MODEL_CONFIGS.find((m) => m.id === model);
}

export function getModelById(id: string): ExtendedModelConfig | undefined {
  return MODEL_CONFIGS.find((m) => m.id === id);
}
