export const STORY_GENERATION_PROMPT = `You are a professional detective mystery story writer. Create a 3-minute detective mystery story following these requirements.

## Requirements

1. **Story Structure** must include:
   - Engaging opening (scene description)
   - Crime scene description
   - 2-3 suspects with their statements
   - 3-5 key clues
   -推理问题 (推理 questions: Who is the killer? Deduce the murder process)
   - Answer (killer, murder process, reasoning)

2. **Logic Requirements**:
   - Story logic must be airtight with no loopholes
   - Clues must point to the true killer
   - Suspect statements must have contradictions
   - The answer must explain all clues

3. **Creative Requirements**:
   - Unique scenes, avoid common settings
   - Creative murder weapons and methods
   - Dramatic character relationships
   - Include red herrings (misleading clues)

4. **Character Names - IMPORTANT**:
   - Use INTERNATIONAL/WESTERN names (English, European, etc.)
   - Examples: James, Sarah, Michael, Emma, David, Olivia, etc.
   - Do NOT use Chinese names
   - Set stories in international locations (London, New York, Paris, Tokyo, etc.)

5. **Language Requirements**:
   - Write the ORIGINAL story in English (natural, engaging English)
   - The Chinese version is a TRANSLATION of the English original
   - Both versions must be vivid and suitable for community readers

## Story Library (Avoid Repetition)

These scenes and methods have been used before, please avoid:
- Park female body (frozen, refrigerated truck)
- Beach murder (suffocation, plastic bag)
- Waterfall hotel (drowning, bathroom)
- Village hanging (fake suicide)

## Output Format

Output strictly in the following JSON format:

{
  "title": "故事标题（中文翻译）",
  "titleEn": "Story Title (English)",
  "story": "故事正文（中文翻译）",
  "storyEn": "Story body (English, the original version)",
  "suspects": [
    {
      "name": "嫌疑人名称（中文）",
      "statement": "嫌疑人陈述（中文翻译）"
    }
  ],
  "suspectsEn": [
    {
      "name": "Suspect Name (English)",
      "statement": "Suspect statement (English, original)"
    }
  ],
  "clues": ["线索1（中文）", "线索2（中文）", "线索3（中文）"],
  "cluesEn": ["Clue 1 (English)", "Clue 2 (English)", "Clue 3 (English)"],
  "questions": ["推理问题1（中文）", "推理问题2（中文）"],
  "questionsEn": ["Question 1 (English)", "Question 2 (English)"],
  "answer": {
    "killer": "凶手名称（中文）",
    "process": "杀人过程（中文翻译）",
    "explanation": "推理依据（中文翻译）"
  },
  "answerEn": {
    "killer": "Killer Name (English)",
    "process": "Murder process (English, original)",
    "explanation": "Reasoning (English, original)"
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

## GPT Image 2 Prompt Requirements
- Realistic style
- Include scene details, lighting, atmosphere
- Suitable for crime scenes, character portraits
- English description, as detailed as possible

## NanoBanana Pro Prompt Requirements
- Artistic style
- Include emotion, atmosphere, color descriptions
- Suitable for covers, illustrations
- English description, emphasize visual impact

Now create a completely new detective mystery story:`;

export const STORY_REFINEMENT_PROMPT = `Please check the logical rigor of the following detective story and make necessary corrections:

{story}

Check points:
1. Can the clues uniquely point to the true killer?
2. Are there logical loopholes in suspect statements?
3. Can the answer explain all clues?
4. Are there other possible killers?

If issues are found, please correct and return the complete story JSON. If logically sound, return as-is.`;
