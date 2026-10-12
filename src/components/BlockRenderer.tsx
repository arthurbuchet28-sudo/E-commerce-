import type { ReactNode } from 'react';
import type { Block } from '../content/types';
import { RichText } from './RichText';
import { PlayingCard, parseCard } from './PlayingCard';

const CALLOUT = {
  info: { box: 'border-sky-700/70 bg-sky-950/40', title: 'text-sky-300', icon: 'ℹ️' },
  warning: { box: 'border-amber-700/70 bg-amber-950/40', title: 'text-amber-300', icon: '⚠️' },
  success: { box: 'border-emerald-700/70 bg-emerald-950/40', title: 'text-emerald-300', icon: '✅' },
  math: { box: 'border-violet-700/70 bg-violet-950/40', title: 'text-violet-300', icon: '∑' },
};

export function BlockRenderer({ block, renderWidget }: { block: Block; renderWidget?: (id: string) => ReactNode }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="leading-relaxed text-slate-300">
          <RichText text={block.text} />
        </p>
      );
    case 'h':
      return <h4 className="pt-2 text-base font-semibold text-slate-100">{block.text}</h4>;
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag className={`space-y-1.5 pl-5 text-slate-300 ${block.ordered ? 'list-decimal' : 'list-disc'} marker:text-emerald-500`}>
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              <RichText text={it} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'table':
      return (
        <figure className="overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-sm">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="border-b border-slate-700 bg-slate-800/70 px-3 py-2 text-left font-semibold text-slate-200">
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r} className="odd:bg-slate-900/40">
                  {row.map((cell, c) => (
                    <td key={c} className="border-b border-slate-800 px-3 py-2 align-top text-slate-300">
                      <RichText text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && <figcaption className="mt-2 text-xs text-slate-400"><RichText text={block.caption} /></figcaption>}
        </figure>
      );
    case 'callout': {
      const s = CALLOUT[block.tone];
      return (
        <aside className={`rounded-xl border px-4 py-3 ${s.box}`}>
          {block.title && (
            <div className={`mb-1 font-semibold ${s.title}`}>
              <span aria-hidden className="mr-1.5">{s.icon}</span>
              {block.title}
            </div>
          )}
          <p className="text-sm leading-relaxed text-slate-200">
            <RichText text={block.text} />
          </p>
        </aside>
      );
    }
    case 'example':
      return (
        <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3">
          <div className="mb-1 text-sm font-semibold text-amber-300">📘 {block.title}</div>
          <ul className="space-y-1 text-sm text-slate-300">
            {block.lines.map((l, i) => (
              <li key={i}>
                <RichText text={l} />
              </li>
            ))}
          </ul>
        </div>
      );
    case 'cards':
      return (
        <figure className="felt rounded-xl p-3">
          <div className="flex flex-wrap justify-center gap-1.5">
            {block.cards.map((c, i) => (
              <PlayingCard key={i} card={parseCard(c)} size="sm" />
            ))}
          </div>
          {block.caption && <figcaption className="mt-2 text-center font-mono text-xs text-emerald-100">{block.caption}</figcaption>}
        </figure>
      );
    case 'widget':
      return <>{renderWidget?.(block.id) ?? null}</>;
  }
}
