"use client";

import { useT } from "@/hooks/useT";

export default function Footer() {
  const { tr } = useT();

  return (
    <footer className="py-20 text-center text-neutral-400">
      {tr("© 2026 KIOYURT")}
    </footer>
  );
}