const BYTE_ORDER_MARK = String.fromCharCode(0xfeff);

/** Builds a CSV document. Cells that could be read as spreadsheet formulas are neutralized. */
export function toCsv(rows: (string | number)[][], separator: string): string {
  const cell = (value: string | number) => {
    let text = String(value);
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return text.includes(separator) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // The byte order mark helps spreadsheet apps detect UTF-8 accents.
  return `${BYTE_ORDER_MARK}${rows.map((row) => row.map(cell).join(separator)).join('\r\n')}`;
}
