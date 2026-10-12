import { Fragment, type ReactNode } from 'react';

/** Rend une mise en forme légère : **gras**, *italique*, `code`. */
export function RichText({ text }: { text: string }) {
  return <>{parse(text)}</>;
}

function parse(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={i++}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith('**')) out.push(<strong key={i++} className="font-semibold text-slate-50">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={i++} className="rounded bg-slate-800 px-1 text-amber-300">{tok.slice(1, -1)}</code>);
    else out.push(<em key={i++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(<Fragment key={i++}>{text.slice(last)}</Fragment>);
  return out;
}
