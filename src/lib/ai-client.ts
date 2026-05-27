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
  // Try to find JSON in the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    let jsonStr = jsonMatch[0];

    // Clean up common issues
    jsonStr = jsonStr
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Fix common JSON issues
    // 1. Fix unescaped newlines within strings
    jsonStr = jsonStr.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
    // 2. Fix unescaped tabs within strings
    jsonStr = jsonStr.replace(/(?<=:\s*"[^"]*)\t(?=[^"]*")/g, '\\t');

    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // If parsing fails, try more aggressive cleaning
      try {
        // Fix single-quoted property names: 'key': -> "key":
        let fixedJson = jsonStr.replace(/(?<=[\{,]\s*)'([^']+)'\s*:/g, '"$1":');
        // Fix single-quoted string values: 'value' -> "value"
        fixedJson = fixedJson.replace(/:\s*'([^']*)'/g, ': "$1"');
        // Fix trailing commas before } or ]
        fixedJson = fixedJson.replace(/,\s*([\]}])/g, '$1');
        // Fix unescaped control characters
        fixedJson = fixedJson
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/[\x00-\x1f\x7f]/g, (match) => {
            return '\\u' + match.charCodeAt(0).toString(16).padStart(4, '0');
          });
        return JSON.parse(fixedJson);
      } catch (e2) {
        // Last resort: try to fix truncated JSON
        try {
          // Find the outermost braces
          const start = jsonStr.indexOf('{');
          if (start !== -1) {
            let extracted = jsonStr.substring(start);
            // Fix single-quoted property names
            extracted = extracted.replace(/(?<=[\{,]\s*)'([^']+)'\s*:/g, '"$1":');
            // Fix single-quoted string values
            extracted = extracted.replace(/:\s*'([^']*)'/g, ': "$1"');
            // Fix trailing commas
            extracted = extracted.replace(/,\s*([\]}])/g, '$1');
            // Fix control characters
            extracted = extracted.replace(/[\x00-\x1f\x7f]/g, (match) => {
              if (match === '\n') return '\\n';
              if (match === '\r') return '\\r';
              if (match === '\t') return '\\t';
              return '\\u' + match.charCodeAt(0).toString(16).padStart(4, '0');
            });

            // Try to fix truncated JSON by closing open brackets
            const openBraces = (extracted.match(/{/g) || []).length;
            const closeBraces = (extracted.match(/}/g) || []).length;
            const openBrackets = (extracted.match(/\[/g) || []).length;
            const closeBrackets = (extracted.match(/]/g) || []).length;

            // If we have unclosed brackets, try to close them
            if (openBraces > closeBraces || openBrackets > closeBrackets) {
              // Remove any incomplete string at the end
              const lastQuoteIndex = extracted.lastIndexOf('"');
              const lastBraceIndex = extracted.lastIndexOf('}');
              const lastBracketIndex = extracted.lastIndexOf(']');

              // If the last quote is after the last closing brace/bracket, we have an incomplete string
              if (lastQuoteIndex > Math.max(lastBraceIndex, lastBracketIndex)) {
                // Find the start of this incomplete string
                const prevQuoteIndex = extracted.lastIndexOf('"', lastQuoteIndex - 1);
                if (prevQuoteIndex !== -1) {
                  extracted = extracted.substring(0, prevQuoteIndex);
                }
              }

              // Close any unclosed arrays
              for (let i = 0; i < openBrackets - closeBrackets; i++) {
                extracted += ']';
              }
              // Close any unclosed objects
              for (let i = 0; i < openBraces - closeBraces; i++) {
                extracted += '}';
              }

              return JSON.parse(extracted);
            }
          }
        } catch (e3) {
          // Give up
        }
        throw new Error(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  }
  throw new Error('No valid JSON found in response');
}
