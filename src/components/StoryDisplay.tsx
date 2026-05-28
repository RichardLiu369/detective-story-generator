'use client';

import { Story } from '@/types';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StoryDisplayProps {
  story: Story;
}

export default function StoryDisplay({ story }: StoryDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['story']));
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP entrance animation
  useEffect(() => {
    if (!containerRef.current) return;

    const sections = containerRef.current.querySelectorAll('.story-section');

    gsap.fromTo(
      sections,
      {
        opacity: 0,
        y: 40,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
      }
    );
  }, [story]);

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

  // Format English content for each section
  const getEnglishContent = (section: string): string => {
    // Handle individual suspects
    if (section.startsWith('suspect-')) {
      const index = parseInt(section.split('-')[1]);
      const suspect = story.suspectsEn[index];
      return suspect ? `${suspect.name}:\n${suspect.statement}` : '';
    }

    switch (section) {
      case 'story':
        return story.storyEn;
      case 'suspects':
        return story.suspectsEn.map((s, i) => `${s.name}:\n${s.statement}`).join('\n\n');
      case 'clues':
        return story.cluesEn.map((c, i) => `${i + 1}. ${c}`).join('\n');
      case 'questions':
        return story.questionsEn.map((q, i) => `${i + 1}. ${q}`).join('\n');
      case 'answer':
        return `Killer: ${story.answerEn.killer}\n\nProcess:\n${story.answerEn.process}\n\nReasoning:\n${story.answerEn.explanation}`;
      case 'gptImage2':
        return `Scene:\n${story.imagePrompts.gptImage2.scene}\n\nCharacters:\n${story.imagePrompts.gptImage2.characters}\n\nClues:\n${story.imagePrompts.gptImage2.clues}`;
      case 'nanoBanana':
        return `Cover:\n${story.imagePrompts.nanoBanana.cover}\n\nScene:\n${story.imagePrompts.nanoBanana.scene}\n\nCharacters:\n${story.imagePrompts.nanoBanana.characters}`;
      default:
        return '';
    }
  };

  const CopyButton = ({ field, label }: { field: string; label?: string }) => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const text = getEnglishContent(field);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      copyToClipboard(text, field);

      // GSAP click animation
      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { scale: 0.85 },
          {
            scale: 1,
            duration: 0.4,
            ease: 'elastic.out(1, 0.3)',
          }
        );
      }
    };

    return (
      <button
        ref={btnRef}
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
          copiedField === field
            ? 'bg-green-500/20 border-green-500/30 text-green-300'
            : 'bg-purple-500/10 border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-500/20'
        } border`}
      >
        {copiedField === field ? (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{label || 'Copy EN'}</span>
          </>
        )}
      </button>
    );
  };

  const Section = ({
    id,
    title,
    titleEn,
    icon,
    children,
    actions,
    color = 'purple',
  }: {
    id: string;
    title: string;
    titleEn?: string;
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
      <div className="glass-card rounded-2xl overflow-hidden story-section">
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
            <div>
              <h3 className="font-semibold text-white text-lg">{title}</h3>
              {titleEn && <p className="text-xs text-gray-500 mt-0.5">{titleEn}</p>}
            </div>
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
    <div ref={containerRef} className="space-y-5">
      {/* Title Card */}
      <div className="relative glass rounded-2xl overflow-hidden story-section">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-gradient" />
        <div className="relative p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-light rounded-full mb-4">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-green-300 font-medium">生成完成</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{story.title}</h2>
              <p className="text-gray-300 text-xl">{story.titleEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Body */}
      <Section id="story" title="故事正文" titleEn="Story" icon="📖" color="blue">
        <div className="space-y-4">
          {/* English Version - Primary */}
          <div className="relative p-5 bg-blue-500/5 rounded-xl border border-blue-500/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">English</span>
              <CopyButton field="story" />
            </div>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{story.storyEn}</p>
          </div>
          {/* Chinese Version - For Review */}
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-400 transition-colors">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              中文版（审核用）
            </summary>
            <div className="mt-3 p-4 glass-light rounded-xl">
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{story.story}</p>
            </div>
          </details>
        </div>
      </Section>

      {/* Suspects */}
      <Section id="suspects" title="嫌疑人陈述" titleEn="Suspects" icon="👥" color="purple">
        <div className="space-y-4">
          {story.suspectsEn.map((suspect, index) => (
            <div
              key={index}
              className="p-5 glass-light rounded-xl hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-base font-bold text-purple-300">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold text-white text-lg">{suspect.name}</h4>
                </div>
                <CopyButton field={`suspect-${index}`} />
              </div>
              <p className="text-gray-200 leading-relaxed">{suspect.statement}</p>
              {/* Chinese for review */}
              <details className="mt-3 group">
                <summary className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-gray-400 transition-colors">
                  <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  中文版
                </summary>
                <p className="mt-2 text-sm text-gray-500 italic leading-relaxed">{story.suspects[index].statement}</p>
              </details>
            </div>
          ))}
        </div>
      </Section>

      {/* Clues */}
      <Section id="clues" title="已知线索" titleEn="Clues" icon="🔍" color="yellow">
        <div className="space-y-3">
          {story.cluesEn.map((clue, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10 hover:bg-yellow-500/10 transition-all duration-300"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-300">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-gray-200">{clue}</p>
                <p className="text-sm text-gray-500 mt-1">{story.clues[index]}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-end mt-2">
            <CopyButton field="clues" />
          </div>
        </div>
      </Section>

      {/* Questions */}
      <Section id="questions" title="推理问题" titleEn="Questions" icon="❓" color="orange">
        <div className="space-y-3">
          {story.questionsEn.map((question, index) => (
            <div
              key={index}
              className="p-5 bg-orange-500/5 rounded-xl border border-orange-500/10 hover:bg-orange-500/10 transition-all duration-300"
            >
              <p className="text-gray-200 font-medium text-lg">{question}</p>
              <p className="text-sm text-gray-500 mt-2">{story.questions[index]}</p>
            </div>
          ))}
          <div className="flex justify-end mt-2">
            <CopyButton field="questions" />
          </div>
        </div>
      </Section>

      {/* Answer */}
      <Section id="answer" title="答案" titleEn="Answer" icon="✅" color="red">
        <div className="space-y-5">
          <div className="p-5 bg-red-500/5 rounded-xl border border-red-500/10">
            <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Killer / 凶手
            </h4>
            <p className="text-red-300 text-2xl font-bold">{story.answerEn.killer}</p>
            <p className="text-gray-500 text-sm mt-1">{story.answer.killer}</p>
          </div>
          <div className="p-5 bg-orange-500/5 rounded-xl border border-orange-500/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-orange-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Process / 杀人过程
              </h4>
              <CopyButton field="answer" />
            </div>
            <p className="text-gray-200 leading-relaxed">{story.answerEn.process}</p>
            <details className="mt-3 group">
              <summary className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-gray-400 transition-colors">
                <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                中文版
              </summary>
              <p className="mt-2 text-sm text-gray-500 italic leading-relaxed">{story.answer.process}</p>
            </details>
          </div>
          <div className="p-5 bg-green-500/5 rounded-xl border border-green-500/10">
            <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Reasoning / 推理依据
            </h4>
            <p className="text-gray-200 leading-relaxed">{story.answerEn.explanation}</p>
            <details className="mt-3 group">
              <summary className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-gray-400 transition-colors">
                <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                中文版
              </summary>
              <p className="mt-2 text-sm text-gray-500 italic leading-relaxed">{story.answer.explanation}</p>
            </details>
          </div>
        </div>
      </Section>

      {/* Image Prompts */}
      <Section
        id="prompts"
        title="AI生图提示词"
        titleEn="Image Prompts"
        icon="🎨"
        color="green"
        actions={
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <a
              href="https://yoozoo.ai/images"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>一键生图</span>
            </a>
          </div>
        }
      >
        <div className="space-y-6">
          {/* GPT Image 2 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-3 text-sm font-semibold text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                GPT Image 2
              </h4>
              <CopyButton field="gptImage2" label="Copy GPT" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Scene', value: story.imagePrompts.gptImage2.scene },
                { label: 'Characters', value: story.imagePrompts.gptImage2.characters },
                { label: 'Clues', value: story.imagePrompts.gptImage2.clues },
              ].map((item, i) => (
                <div key={i} className="p-4 glass-light rounded-xl">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{item.label}</p>
                  <p className="text-gray-200 text-sm leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* NanoBanana Pro */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="flex items-center gap-3 text-sm font-semibold text-purple-400">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                NanoBanana Pro
              </h4>
              <CopyButton field="nanoBanana" label="Copy Nano" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Cover', value: story.imagePrompts.nanoBanana.cover },
                { label: 'Scene', value: story.imagePrompts.nanoBanana.scene },
                { label: 'Characters', value: story.imagePrompts.nanoBanana.characters },
              ].map((item, i) => (
                <div key={i} className="p-4 glass-light rounded-xl">
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{item.label}</p>
                  <p className="text-gray-200 text-sm leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
