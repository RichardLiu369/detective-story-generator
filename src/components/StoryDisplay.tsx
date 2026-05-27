'use client';

import { Story } from '@/types';
import { useState } from 'react';

interface StoryDisplayProps {
  story: Story;
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['story']));

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const formatStoryForCopy = (story: Story): string => {
    return `# 【谁是凶手】三分钟推理故事

## 故事正文 / Story

${story.story}

${story.storyEn}

## 嫌疑人陈述 / Suspect Statements

${story.suspects.map((s, i) => `### ${s.name}
${s.statement}

**English:**
${story.suspectsEn[i].statement}`).join('\n\n')}

## 已知线索 / Known Clues

${story.clues.map((c, i) => `${i + 1}. ${c} / ${story.cluesEn[i]}`).join('\n')}

## 推理问题 / Questions

${story.questions.map((q, i) => `${i + 1}. ${q} / ${story.questionsEn[i]}`).join('\n')}

## 答案 / Answer

**凶手 / Killer:** ${story.answer.killer}

**杀人过程 / Process:**
${story.answer.process}

${story.answerEn.process}

**推理依据 / Reasoning:**
${story.answer.explanation}

${story.answerEn.explanation}`;
  };

  const formatImagePromptsForCopy = (prompts: Story['imagePrompts'], type: 'gptImage2' | 'nanoBanana'): string => {
    const p = prompts[type];
    if (type === 'gptImage2') {
      return `## GPT Image 2 Prompts

### Scene / 场景
${(p as any).scene}

### Characters / 人物
${(p as any).characters}

### Clues / 线索
${(p as any).clues}`;
    } else {
      return `## NanoBanana Pro Prompts

### Cover / 封面
${(p as any).cover}

### Scene / 场景
${(p as any).scene}

### Characters / 人物
${(p as any).characters}`;
    }
  };

  const CopyButton = ({ text, field, label }: { text: string; field: string; label: string }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        copyToClipboard(text, field);
      }}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-300 ${
        copiedField === field
          ? 'bg-green-500/20 border-green-500/30 text-green-300'
          : 'glass-light text-gray-400 hover:text-white hover:bg-white/10'
      } border border-white/10`}
      style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
    >
      {copiedField === field ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>已复制</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );

  const Section = ({
    id,
    title,
    icon,
    children,
    actions,
    color = 'purple',
  }: {
    id: string;
    title: string;
    icon: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    color?: 'purple' | 'blue' | 'yellow' | 'red' | 'orange' | 'green';
  }) => {
    const isExpanded = expandedSections.has(id);
    const colorMap = {
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
      yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
      red: { bg: 'bg-red-500/20', text: 'text-red-300' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
      green: { bg: 'bg-green-500/20', text: 'text-green-300' },
    };

    return (
      <div className="glass-card rounded-2xl overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => toggleSection(id)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSection(id); } }}
          className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors duration-300 cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${colorMap[color].bg} flex items-center justify-center text-lg`}>
              {icon}
            </div>
            <h3 className="font-semibold text-white text-lg">{title}</h3>
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <div className={`w-8 h-8 rounded-full glass-light flex items-center justify-center transition-all duration-400 ${isExpanded ? 'rotate-180' : ''}`}
              style={{ transitionTimingFunction: 'var(--spring-bounce)' }}
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}
          style={{ transitionTimingFunction: 'var(--spring-smooth)' }}
        >
          <div className="px-6 pb-6 border-t border-white/[0.06]">
            <div className="pt-4">{children}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Title Card */}
      <div className="relative glass rounded-2xl overflow-hidden animate-spring-in">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient" />
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-light rounded-full mb-4 animate-spring-pop">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-green-300 font-medium">生成完成</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">{story.title}</h2>
              <p className="text-gray-400 text-lg">{story.titleEn}</p>
            </div>
            <CopyButton
              text={formatStoryForCopy(story)}
              field="full-story"
              label="复制全部"
            />
          </div>
        </div>
      </div>

      {/* Story Body */}
      <Section id="story" title="故事正文" icon="📖" color="blue">
        <div className="space-y-4">
          <div className="p-5 glass-light rounded-xl">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{story.story}</p>
          </div>
          <div className="p-5 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap italic">{story.storyEn}</p>
          </div>
        </div>
      </Section>

      {/* Suspects */}
      <Section id="suspects" title="嫌疑人陈述" icon="👥" color="purple">
        <div className="space-y-4">
          {story.suspects.map((suspect, index) => (
            <div
              key={index}
              className="p-5 glass-light rounded-xl hover:bg-white/[0.04] transition-all duration-400 card-interactive"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-base font-bold text-purple-300">
                  {index + 1}
                </div>
                <h4 className="font-semibold text-white text-lg">{suspect.name}</h4>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{suspect.statement}</p>
              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-gray-500 italic leading-relaxed">{story.suspectsEn[index].statement}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Clues */}
      <Section id="clues" title="已知线索" icon="🔍" color="yellow">
        <div className="space-y-3">
          {story.clues.map((clue, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 hover:bg-yellow-500/10 transition-all duration-300"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-300">
                {index + 1}
              </span>
              <div>
                <p className="text-gray-300">{clue}</p>
                <p className="text-gray-500 italic text-sm mt-2">{story.cluesEn[index]}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Questions */}
      <Section id="questions" title="推理问题" icon="❓" color="orange">
        <div className="space-y-3">
          {story.questions.map((question, index) => (
            <div
              key={index}
              className="p-5 bg-orange-500/5 rounded-xl border border-orange-500/10 hover:bg-orange-500/10 transition-all duration-300"
            >
              <p className="text-gray-200 font-medium text-lg">{question}</p>
              <p className="text-gray-500 italic mt-3">{story.questionsEn[index]}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Answer */}
      <Section id="answer" title="答案" icon="✅" color="red">
        <div className="space-y-5">
          <div className="p-5 bg-red-500/5 rounded-xl border border-red-500/10">
            <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              凶手 / Killer
            </h4>
            <p className="text-red-300 text-2xl font-bold">{story.answer.killer}</p>
          </div>
          <div className="p-5 bg-orange-500/5 rounded-xl border border-orange-500/10">
            <h4 className="text-sm font-medium text-orange-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              杀人过程 / Process
            </h4>
            <p className="text-gray-300 mb-3 leading-relaxed">{story.answer.process}</p>
            <p className="text-gray-500 italic leading-relaxed">{story.answerEn.process}</p>
          </div>
          <div className="p-5 bg-green-500/5 rounded-xl border border-green-500/10">
            <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              推理依据 / Reasoning
            </h4>
            <p className="text-gray-300 mb-3 leading-relaxed">{story.answer.explanation}</p>
            <p className="text-gray-500 italic leading-relaxed">{story.answerEn.explanation}</p>
          </div>
        </div>
      </Section>

      {/* Image Prompts */}
      <Section
        id="prompts"
        title="AI生图提示词"
        icon="🎨"
        color="green"
        actions={
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <CopyButton
              text={formatImagePromptsForCopy(story.imagePrompts, 'gptImage2')}
              field="gpt"
              label="GPT"
            />
            <CopyButton
              text={formatImagePromptsForCopy(story.imagePrompts, 'nanoBanana')}
              field="nano"
              label="NanoBanana"
            />
          </div>
        }
      >
        <div className="space-y-6">
          {/* GPT Image 2 */}
          <div>
            <h4 className="flex items-center gap-3 text-sm font-semibold text-green-400 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              GPT Image 2
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Scene / 场景', value: story.imagePrompts.gptImage2.scene },
                { label: 'Characters / 人物', value: story.imagePrompts.gptImage2.characters },
                { label: 'Clues / 线索', value: story.imagePrompts.gptImage2.clues },
              ].map((item, i) => (
                <div key={i} className="p-4 glass-light rounded-xl hover:bg-white/[0.04] transition-all duration-300">
                  <p className="text-xs font-medium text-gray-500 mb-2">{item.label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NanoBanana Pro */}
          <div>
            <h4 className="flex items-center gap-3 text-sm font-semibold text-purple-400 mb-4">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
              NanoBanana Pro
            </h4>
            <div className="space-y-3">
              {[
                { label: 'Cover / 封面', value: story.imagePrompts.nanoBanana.cover },
                { label: 'Scene / 场景', value: story.imagePrompts.nanoBanana.scene },
                { label: 'Characters / 人物', value: story.imagePrompts.nanoBanana.characters },
              ].map((item, i) => (
                <div key={i} className="p-4 glass-light rounded-xl hover:bg-white/[0.04] transition-all duration-300">
                  <p className="text-xs font-medium text-gray-500 mb-2">{item.label}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
