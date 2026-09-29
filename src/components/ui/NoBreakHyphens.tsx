/** Keeps hyphenated words (« e-commerce », « print-on-demand ») on one line in titles. */
export function NoBreakHyphens({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\S*\p{L}-\p{L}\S*)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
