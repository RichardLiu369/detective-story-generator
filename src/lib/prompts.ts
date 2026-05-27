export const STORY_GENERATION_PROMPT = `你是一个专业的侦探推理故事作家。请根据以下要求创作一个三分钟推理故事。

## 要求

1. **故事结构**：必须包含以下部分
   - 引人入胜的开头（场景描述）
   - 案发现场描述
   - 2-3个嫌疑人及其陈述
   - 3-5条关键线索
   - 推理问题（谁是凶手？请推理杀人过程）
   - 答案（凶手、杀人过程、推理依据）

2. **逻辑要求**：
   - 故事逻辑必须严密，不能有漏洞
   - 线索必须能够指向真凶
   - 嫌疑人的陈述必须有矛盾点
   - 答案必须能够解释所有线索

3. **创意要求**：
   - 场景独特，避免常见设定
   - 凶器和手法要有创意
   - 人物关系要有戏剧性
   - 要有误导性线索（红鲱鱼）

4. **语言要求**：
   - 中文版本要生动有趣
   - 英文版本要流畅自然
   - 适合社区玩家阅读

## 已有故事库（避免重复）

以下是已经使用过的场景和手法，请避免重复：
- 公园女尸（冻死、冷藏车）
- 海滩谋杀（窒息、塑料袋）
- 瀑下旅馆（溺死、浴室）
- 村庄上吊（伪造自杀）

## 输出格式

请严格按照以下JSON格式输出：

{
  "title": "故事标题（中文）",
  "titleEn": "Story Title (English)",
  "story": "故事正文（中文，包含案发现场描述）",
  "storyEn": "Story body (English)",
  "suspects": [
    {
      "name": "嫌疑人名称",
      "statement": "嫌疑人陈述（中文）"
    }
  ],
  "suspectsEn": [
    {
      "name": "Suspect Name",
      "statement": "Suspect statement (English)"
    }
  ],
  "clues": ["线索1", "线索2", "线索3"],
  "cluesEn": ["Clue 1", "Clue 2", "Clue 3"],
  "questions": ["推理问题1", "推理问题2"],
  "questionsEn": ["Question 1", "Question 2"],
  "answer": {
    "killer": "凶手名称",
    "process": "杀人过程（中文）",
    "explanation": "推理依据（中文）"
  },
  "answerEn": {
    "killer": "Killer Name",
    "process": "Murder process (English)",
    "explanation": "Reasoning (English)"
  },
  "imagePrompts": {
    "gptImage2": {
      "scene": "Scene prompt for GPT Image 2 (English, detailed, cinematic)",
      "characters": "Character prompt for GPT Image 2 (English, detailed, realistic)",
      "clues": "Clues prompt for GPT Image 2 (English, detailed, close-up)"
    },
    "nanoBanana": {
      "cover": "Cover art prompt for NanoBanana Pro (English, stylized, dramatic)",
      "scene": "Scene prompt for NanoBanana Pro (English, atmospheric, moody)",
      "characters": "Character prompt for NanoBanana Pro (English, stylized, expressive)"
    }
  }
}

## GPT Image 2 提示词要求
- 使用写实风格
- 包含场景细节、光线、氛围
- 适合生成犯罪现场、人物肖像
- 英文描述，越详细越好

## NanoBanana Pro 提示词要求
- 使用艺术风格
- 包含情绪、氛围、色彩描述
- 适合生成封面、插画
- 英文描述，强调视觉冲击力

现在请创作一个全新的侦探推理故事：`;

export const STORY_REFINEMENT_PROMPT = `请检查以下侦探故事的逻辑严密性，并进行必要的修正：

{story}

检查要点：
1. 线索是否能够唯一指向真凶
2. 嫌疑人陈述是否有逻辑漏洞
3. 答案是否能够解释所有线索
4. 是否存在其他可能的凶手

如果发现问题，请修正并返回完整的故事JSON。如果逻辑严密，请返回原样。`;
