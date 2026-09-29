import type { ReactNode } from "react";

type Column = { key: string; header: ReactNode; numeric?: boolean };

type ResponsiveTableProps = {
  caption: string;
  columns: Column[];
  rows: Array<Record<string, ReactNode>>;
  /** Key of the column used as row header (th scope="row"). */
  rowHeader: string;
};

/**
 * Native HTML table (good for GEO: comparison tables readable by answer engines).
 * Scrolls horizontally inside a focusable region on narrow screens, never the page.
 */
export function ResponsiveTable({ caption, columns, rows, rowHeader }: ResponsiveTableProps) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="overflow-x-auto rounded-ui border border-line bg-sheet"
    >
      <table className="w-full min-w-[36rem] border-collapse text-left text-ui">
        <caption className="px-4 pt-4 pb-2 text-left font-semibold">{caption}</caption>
        <thead>
          <tr className="border-b-2 border-ink">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={c.numeric ? "px-4 py-2 text-right" : "px-4 py-2"}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {columns.map((c) =>
                c.key === rowHeader ? (
                  <th key={c.key} scope="row" className="px-4 py-2 font-semibold">
                    {row[c.key]}
                  </th>
                ) : (
                  <td
                    key={c.key}
                    className={c.numeric ? "px-4 py-2 text-right tabular-nums" : "px-4 py-2"}
                  >
                    {row[c.key]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
