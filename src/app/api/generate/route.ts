import { NextRequest, NextResponse } from 'next/server';
import { StoryConfig, GenerateResponse } from '@/types';
import { callAI, extractJSONFromResponse } from '@/lib/ai-client';
import { STORY_GENERATION_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    const config: StoryConfig = await request.json();

    // Get API key, base URL, model ID from request headers (from frontend localStorage)
    const headerApiKey = request.headers.get('x-api-key');
    const headerModel = request.headers.get('x-model');
    const headerBaseUrl = request.headers.get('x-base-url');
    const headerModelId = request.headers.get('x-model-id');

    const model = headerModel || config.model;
    const apiKey = headerApiKey;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: `未配置 ${model} 的 API Key，请在设置中配置`,
        },
        { status: 400 }
      );
    }

    // Get custom base URL and model ID from headers or use defaults
    const baseUrl = headerBaseUrl || undefined;
    const modelId = headerModelId || undefined;

    // Generate story
    const messages = [
      {
        role: 'user' as const,
        content: STORY_GENERATION_PROMPT,
      },
    ];

    const response = await callAI(model, messages, apiKey, baseUrl, modelId);

    // Parse the response
    try {
      const story = extractJSONFromResponse(response.content);
      return NextResponse.json({
        success: true,
        story,
      });
    } catch (parseError) {
      console.error('JSON parsing failed. Raw response:', response.content.substring(0, 2000));
      throw parseError;
    }
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成失败，请重试',
      },
      { status: 500 }
    );
  }
}
