// One timetable as a PDF file, written by hand: the file a teacher is sent.
//
// WHY BY HAND. The printer path already makes a PDF ("PDF olarak kaydet"),
// but only through the print window, a destination to choose and a Save
// dialog: four steps for the father, every time. A file the page writes
// itself is one click, and it lands in İndirilenler like the plan file does.
// A PDF library is 100-300 kB; one page of lines, boxes and text is this.
//
// THE FONT IS NOT EMBEDDED. Helvetica is one of the fourteen fonts every PDF
// reader carries, so the file stays a few kB. Its standard encoding has no
// ğ ş ı İ Ğ Ş, so the font is re-encoded the way ISO 8859-9 (Latin-5) does
// it: the six Turkish letters take the six Icelandic slots, under their
// standard glyph names, which every reader's Helvetica has.
//
// ASCII ONLY, in the file too: every byte over 127 is written as an octal
// escape, so the text can be handed to a Blob (or the exe) as a string with
// nothing re-encoded on the way, and the xref offsets are string lengths.
//
// Text widths are estimated, not measured (no metrics table): centring is
// off by a hair, and a word too long for its cell is set smaller until the
// estimate fits.

import type { Sheet, SheetHour } from './sheet';

/** Latin-5's six Turkish letters, and the dash Windows-1252 has at 150. */
const CODES: Record<string, number> = {
  Ğ: 208,
  İ: 221,
  Ş: 222,
  ğ: 240,
  ı: 253,
  ş: 254,
  '–': 150,
};

/** A string as a PDF literal: Latin-5 bytes, everything past ASCII in octal. */
function lit(s: string): string {
  let out = '';
  for (const c of s) {
    const n = CODES[c] ?? c.charCodeAt(0);
    out +=
      n > 255 || c.length > 1
        ? '?'
        : n > 126 || n < 32
          ? `\\${n.toString(8).padStart(3, '0')}`
          : '()\\'.includes(c)
            ? `\\${c}`
            : c;
  }
  return `(${out})`;
}

/** The width of `s` at `size`, in points: Helvetica's three rough classes. */
function width(s: string, size: number, bold: boolean): number {
  let em = 0;
  for (const c of s)
    em += /[iljtfrI.,:;'|ı ()-]/.test(c) ? 0.3 : /[A-ZĞİŞÇÖÜ0-9mw]/.test(c) ? 0.68 : 0.54;
  return em * size * (bold ? 1.06 : 1);
}

/** '#rrggbb' as PDF fill colour operands. */
function rgb(hex: string): string {
  return [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).join(' ');
}

/** What a page is drawn with: `pdfDoc` hands one to its caller. */
export interface Pen {
  /**
   * Text at (x, y) baseline; `align` 0 left, 0.5 centred, 1 right of x. Set
   * smaller until it fits `room`, but never under 7 pt (the paper's own
   * floor, styles.css `--fs-p-min`).
   */
  text(
    s: string,
    x: number,
    y: number,
    size: number,
    bold?: boolean,
    align?: number,
    room?: number,
  ): void;
  /** A box, filled with `fill` ("r g b", 0-1) when it is not null. */
  box(x: number, y: number, w: number, h: number, fill: string | null, line?: number): void;
  /** `parts` joined by " · " into lines no wider than `room` at `size`. */
  lines(parts: string[], size: number, room: number): string[];
  /** One raw content-stream operator ("0.3 g", a line). */
  op(o: string): void;
}

/** A4 landscape, in points, and the margin every page keeps. */
export const A4 = { W: 842, H: 595, M: 28 };
const { W, H, M } = A4;

/**
 * A one-page PDF file of whatever `draw` puts on it. The reusable half: a
 * timetable is `sheetPdf`, and any other list on paper (İkame's, say) is a
 * `draw` of its own.
 */
export function pdfDoc(draw: (pen: Pen) => void): string {
  const ops: string[] = [];
  const f = (n: number) => n.toFixed(1);
  draw({
    text(s, x, y, size, bold = false, align = 0, room = W) {
      let z = size;
      while (z > 7 && width(s, z, bold) > room) z -= 0.5;
      ops.push(
        `BT/${bold ? 'B' : 'R'} ${z} Tf ${f(x - width(s, z, bold) * align)} ${f(y)} Td${lit(s)}Tj ET`,
      );
    },
    box(x, y, w, h, fill, line = 0.6) {
      const r = `${f(x)} ${f(y)} ${f(w)} ${f(h)} re`;
      if (fill !== null) ops.push(`${fill} rg ${r} f 0 g`);
      ops.push(`${line} w ${r} S`);
    },
    lines(parts, size, room) {
      const out: string[] = [];
      for (const part of parts) {
        const last = out.length - 1;
        if (last >= 0 && width(`${out[last]} · ${part}`, size, false) <= room)
          out[last] += ` · ${part}`;
        else out.push(part);
      }
      return out;
    },
    op(o) {
      ops.push(o);
    },
  });

  const stream = ops.join('\n');
  const font = (name: string) => `<</Type/Font/Subtype/Type1/BaseFont/${name}/Encoding 6 0 R>>`;
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Resources<</Font<</R 4 0 R/B 5 0 R>>>>/Contents 7 0 R>>`,
    font('Helvetica'),
    font('Helvetica-Bold'),
    '<</Type/Encoding/BaseEncoding/WinAnsiEncoding/Differences[208/Gbreve 221/Idotaccent/Scedilla 240/gbreve 253/dotlessi/scedilla]>>',
    `<</Length ${stream.length}>>stream\n${stream}\nendstream`,
  ];
  let out = '%PDF-1.4\n';
  const at: number[] = [];
  objects.forEach((o, i) => {
    at.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const n of at) out += `${String(n).padStart(10, '0')} 00000 n \n`;
  return `${out}trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
}

export interface PdfPage {
  sheet: Sheet;
  head: SheetHour[];
  /** '#rrggbb' per palette index, or null to print it black on white. */
  paint: ((index: number) => string) | null;
  /** The header line: the plan on the left, date and page on the right. */
  left: string;
  right: string;
}

/** One timetable on one A4 page, the printed sheet's layout. */
export function sheetPdf({ sheet, head, paint, left, right }: PdfPage): string {
  return pdfDoc((pen) => {
    const { text, box } = pen;
    // The header line: each half keeps to its own half of the page.
    pen.op('0.3 g');
    text(left, M, H - 16, 7, false, 0, W / 2 - M - 10);
    text(right, W - M, H - 16, 7, false, 1, W / 2 - M - 10);
    pen.op('0 g');
    let y = H - 52;
    text(sheet.title, W / 2, y, 17, true, 0.5, W - 2 * M);
    if (sheet.sub !== '') text(sheet.sub, W / 2, (y -= 16), 10.5, false, 0.5, W - 2 * M);

    // The legend wraps, as it does on paper, and the table gives it the room.
    const legend = pen.lines(sheet.legend, 7, W - 2 * M);
    const bottom = M + legend.length * 9;
    const day = 74;
    const col = (W - 2 * M - day) / Math.max(1, head.length);
    // A group that names its days takes two lines: "Sal–Cum" over its times.
    const clock = head.map((h) =>
      h.clock.flatMap((g) => [...(g.days === null ? [] : [g.days]), `${g.start}–${g.end}`]),
    );
    const headH = 16 + Math.max(0, ...clock.map((c) => c.length)) * 9;
    const top = y - 12;
    const rowH = (top - headH - bottom) / Math.max(1, sheet.days.length);

    // The header row: the day column's corner, then each lesson number and its bell times.
    box(M, top - headH, day, headH, '0.933 0.933 0.933');
    head.forEach((h, s) => {
      const x = M + day + s * col;
      box(x, top - headH, col, headH, '0.933 0.933 0.933');
      text(h.label, x + col / 2, top - 12, 10, true, 0.5, col - 4);
      clock[s]!.forEach((line, i) =>
        text(line, x + col / 2, top - 21 - i * 9, 7, false, 0.5, col - 4),
      );
    });

    sheet.days.forEach((d, g) => {
      const ry = top - headH - (g + 1) * rowH;
      box(M, ry, day, rowH, null);
      text(d.label, M + 5, ry + rowH / 2 - 4, 12, true, 0, day - 8);
      let x = M + day;
      for (const cell of d.cells) {
        const w = cell.span * col;
        box(x, ry, w, rowH, paint !== null && cell.color !== null ? rgb(paint(cell.color)) : null);
        if (cell.top !== null) {
          const two = cell.bottom !== null && cell.bottom !== '';
          text(cell.top, x + w / 2, ry + rowH / 2 + (two ? 1 : -4), 12, true, 0.5, w - 4);
          if (two) text(cell.bottom!, x + w / 2, ry + rowH / 2 - 11, 9, false, 0.5, w - 4);
        }
        if (cell.breakAfter)
          pen.op(`2.2 w ${(x + w).toFixed(1)} ${ry.toFixed(1)} m 0 ${rowH.toFixed(1)} rl S`);
        x += w;
      }
    });
    pen.op('0.3 g');
    legend.forEach((line, i) => text(line, M, bottom - 7 - i * 9, 7, false, 0, W - 2 * M));
  });
}
