'use client';

import type { ReactNode } from 'react';

interface SurfaceProps {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Surface({ title, children, className = '', id }: SurfaceProps) {
  return (
    <section id={id} className={`surface p-2 ${className}`}>
      <h3 className="mb-2 text-sm font-semibold tracking-tight text-slate-800">{title}</h3>
      {children}
    </section>
  );
}
