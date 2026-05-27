export interface StoryConfig {
  model: string;
  theme?: string;
}

// Use string for flexibility, but define common model IDs
export type AIModel = string;

export interface ModelConfig {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  apiKeyEnv: string;
  baseUrl: string;
  modelId: string;
  maxTokens: number;
  icon: string;
  color: string;
}

export interface CustomModel {
  id: string;
  name: string;
  baseUrl: string;
  modelId: string;
  apiKey: string;
  description?: string;
}

export interface ModelSettings {
  apiKey: string;
  baseUrl?: string;
  modelId?: string;
}

export interface AppSettings {
  models: Record<string, ModelSettings>;
  customModels: CustomModel[];
  defaultModel: string;
}

export interface Story {
  title: string;
  titleEn: string;
  story: string;
  storyEn: string;
  suspects: Suspect[];
  suspectsEn: Suspect[];
  clues: string[];
  cluesEn: string[];
  questions: string[];
  questionsEn: string[];
  answer: Answer;
  answerEn: Answer;
  imagePrompts: ImagePrompts;
}

export interface Suspect {
  name: string;
  statement: string;
}

export interface Answer {
  killer: string;
  process: string;
  explanation: string;
}

export interface ImagePrompts {
  gptImage2: {
    scene: string;
    characters: string;
    clues: string;
  };
  nanoBanana: {
    cover: string;
    scene: string;
    characters: string;
  };
}

export interface GenerateResponse {
  success: boolean;
  story?: Story;
  error?: string;
}
