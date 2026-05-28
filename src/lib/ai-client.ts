import { ModelConfig } from '@/types';
import { getModelConfig } from './models';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatResponse {
  content: string;
}

export async function callAI(
  model: string,
  messages: Message[],
  apiKey: string,
  customBaseUrl?: string,
  customModelId?: string
): Promise<ChatResponse> {
  // Get preset config or create a default one for custom models
  const presetConfig = getModelConfig(model);

  const config: ModelConfig = presetConfig || {
    id: model,
    name: model,
    nameEn: model,
    description: 'Custom model',
    apiKeyEnv: '',
    baseUrl: customBaseUrl || 'https://api.openai.com/v1',
    modelId: customModelId || 'gpt-4o',
    maxTokens: 16384,
    icon: '',
    color: '',
  };

  // Allow custom overrides
  const finalConfig = {
    ...config,
    baseUrl: customBaseUrl || config.baseUrl,
    modelId: customModelId || config.modelId,
  };

  // For custom models or OpenAI-compatible models, use OpenAI format
  // For Claude, use Anthropic format
  const isClaude = model.includes('claude') || finalConfig.baseUrl.includes('anthropic');

  if (isClaude) {
    return callClaude(finalConfig, messages, apiKey);
  }

  // Default: use OpenAI-compatible format
  return callOpenAICompatible(finalConfig, messages, apiKey);
}

async function callClaude(
  config: ModelConfig,
  messages: Message[],
  apiKey: string
): Promise<ChatResponse> {
  const response = await fetch(`${config.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.modelId,
      max_tokens: config.maxTokens,
      messages: messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.content,
      })),
      system: messages.find((m) => m.role === 'system')?.content,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  return { content: data.content[0].text };
}

async function callOpenAICompatible(
  config: ModelConfig,
  messages: Message[],
  apiKey: string
): Promise<ChatResponse> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.modelId,
      messages: messages,
      max_tokens: config.maxTokens,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${error}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

export function extractJSONFromResponse(response: string): any {
  // Step 1: Clean up markdown code blocks first
  let cleaned = response
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  // Step 2: Find the JSON object boundaries
  const start = cleaned.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON object found in response');
  }

  // Find the matching closing brace
  let braceCount = 0;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++;
    if (cleaned[i] === '}') braceCount--;
    if (braceCount === 0) {
      end = i;
      break;
    }
  }

  // If we didn't find a matching brace, the JSON is truncated
  if (end === -1) {
    // Try to find the last complete property
    end = cleaned.length - 1;
  }

  let jsonStr = cleaned.substring(start, end + 1);

  // Step 3: Fix unescaped characters within string values
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString) {
      // Escape special characters within strings
      switch (char) {
        case '\n':
          result += '\\n';
          break;
        case '\r':
          result += '\\r';
          break;
        case '\t':
          result += '\\t';
          break;
        default:
          result += char;
      }
    } else {
      result += char;
    }
  }

  jsonStr = result;

  // Step 4: Try to parse
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Step 5: If parsing fails, try to fix common issues
    try {
      // Remove trailing commas
      jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

      // Fix incomplete strings at the end
      const lastQuoteIndex = jsonStr.lastIndexOf('"');
      const lastBraceIndex = jsonStr.lastIndexOf('}');
      const lastBracketIndex = jsonStr.lastIndexOf(']');

      if (lastQuoteIndex > Math.max(lastBraceIndex, lastBracketIndex)) {
        // Find the start of this incomplete string
        const prevQuoteIndex = jsonStr.lastIndexOf('"', lastQuoteIndex - 1);
        if (prevQuoteIndex !== -1) {
          jsonStr = jsonStr.substring(0, prevQuoteIndex);
        }
      }

      // Count and fix unclosed brackets
      const openBraces = (jsonStr.match(/{/g) || []).length;
      const closeBraces = (jsonStr.match(/}/g) || []).length;
      const openBrackets = (jsonStr.match(/\[/g) || []).length;
      const closeBrackets = (jsonStr.match(/]/g) || []).length;

      // Close unclosed arrays
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        jsonStr += ']';
      }
      // Close unclosed objects
      for (let i = 0; i < openBraces - closeBraces; i++) {
        jsonStr += '}';
      }

      return JSON.parse(jsonStr);
    } catch (e2) {
      throw new Error(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  }
}
