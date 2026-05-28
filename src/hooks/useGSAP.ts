'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Stagger entrance animation
export function useStaggerEntrance(selector: string, delay: number = 0) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(selector);
    if (elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          delay,
          ease: 'back.out(1.7)',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [selector, delay]);

  return containerRef;
}

// Spring bounce animation
export function useSpringBounce() {
  const ref = useRef<HTMLElement>(null);

  const animate = () => {
    if (!ref.current) return;

    gsap.fromTo(
      ref.current,
      { scale: 0.9 },
      {
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      }
    );
  };

  return { ref, animate };
}

// Magnetic hover effect
export function useMagneticHover(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}

// Text reveal animation
export function useTextReveal() {
  const ref = useRef<HTMLElement>(null);

  const reveal = () => {
    if (!ref.current) return;

    const text = ref.current.textContent || '';
    ref.current.innerHTML = '';

    const chars = text.split('').map((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? ' ' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      ref.current?.appendChild(span);
      return span;
    });

    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.03,
      ease: 'back.out(1.7)',
    });
  };

  return { ref, reveal };
}

// Card tilt on hover
export function useCardTilt(maxTilt: number = 5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (y - 0.5) * maxTilt;
      const tiltY = (x - 0.5) * -maxTilt;

      gsap.to(el, {
        rotateX: tiltX,
        rotateY: tiltY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  return ref;
}

// Counter animation
export function useCounter(target: number, duration: number = 2) {
  const ref = useRef<HTMLElement>(null);

  const animate = () => {
    if (!ref.current) return;

    gsap.fromTo(
      { value: 0 },
      { value: 0 },
      {
        value: target,
        duration,
        ease: 'power2.out',
        onUpdate: function () {
          if (ref.current) {
            ref.current.textContent = Math.round(this.targets()[0].value).toString();
          }
        },
      }
    );
  };

  return { ref, animate };
}

// Scroll trigger animation
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              el,
              {
                opacity: 0,
                y: 50,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
              }
            );
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}
