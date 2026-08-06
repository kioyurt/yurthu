// src/components/ui/TypingText.tsx
"use client";
import { useState, useEffect } from "react";

export default function TypingText({
  texts,
  speed = 100,
}: {
  texts: string[];
  speed?: number;
}) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (charIndex < current.length) {
            setCharIndex(charIndex + 1);
          } else {
            setTimeout(() => setDeleting(true), 1500);
          }
        } else {
          if (charIndex > 0) {
            setCharIndex(charIndex - 1);
          } else {
            setDeleting(false);
            setTextIndex((textIndex + 1) % texts.length);
          }
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex, texts, speed]);

  return (
    <span>
      {texts[textIndex].slice(0, charIndex)}
      <span className="cursor-blink text-indigo-500">|</span>
    </span>
  );
}