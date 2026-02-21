'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
  glitch?: boolean;
}

const GLITCH_CHARS = '!@#$%^&*░▒▓█▀▄';

export function TypingText({ text, speed = 50, className, glitch = false }: TypingTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      setDisplayed('');
      setDone(false);
    }

    if (done) return;

    let i = displayed.length;
    if (i >= text.length) {
      setDone(true);
      return;
    }

    const timeout = setTimeout(() => {
      if (glitch && Math.random() < 0.15) {
        const glitchChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        setDisplayed(text.slice(0, i) + glitchChar);
        setTimeout(() => {
          setDisplayed(text.slice(0, i + 1));
        }, speed / 2);
      } else {
        setDisplayed(text.slice(0, i + 1));
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, displayed, done, speed, glitch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={cn('font-mono', className)}>
      {displayed}
      <span className={cn('transition-opacity', cursorVisible ? 'opacity-100' : 'opacity-0')}>
        █
      </span>
    </span>
  );
}
