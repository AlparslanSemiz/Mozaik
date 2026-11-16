// A person's timetable as a PDF file in İndirilenler, and the WhatsApp chat
// it is sent from (TODO B3.4). Nothing leaves the machine from here: the file
// is saved like the plan file is, and the chat opens with a line of text
// typed in; the user attaches the file and presses Send.

import { printStamp } from '../../leaf/app';
import {
  paletteColor,
  type State,
  type Teacher,
  whatsappNumber,
  whatsappUrl,
} from '../../leaf/model';
import { desktopWhatsapp, isDesktop } from '../../platform/exe';
import { readPrintOptions } from '../../platform/prefs';
import { activePlanName, downloadFile } from '../../platform/storage';
import { blockSpans, buildIndex } from '../../pure/constraints';
import { classSheet, paperName, sheetHead, sheetPdf, teacherSheet } from '../../pure/paper';
import type { useT } from '../common';

type Translate = ReturnType<typeof useT>;

/**
 * Saves one teacher's or class's sheet as "Mozaik – 510 – 2026-11-16.pdf",
 * with the same switches the printer uses, and returns the file's name; null
 * when there is no such person any more.
 */
export function savePdf(
  state: State,
  kind: 'teacher' | 'class',
  id: string,
  colored: boolean,
  t: Translate,
): string | null {
  const options = readPrintOptions();
  const ix = buildIndex(state);
  const spans = blockSpans(state);
  const teacher = kind === 'teacher' ? ix.teacherById.get(id) : undefined;
  const group = kind === 'class' ? ix.classById.get(id) : undefined;
  const sheet =
    teacher !== undefined
      ? teacherSheet(state, ix, spans, teacher, options)
      : group !== undefined
        ? classSheet(state, ix, spans, group, options, t)
        : null;
  if (sheet === null) return null;
  const now = new Date();
  const name = `${paperName((teacher ?? group)!.name, now)}.pdf`;
  const page = t('Sayfa {n} / {m}', { n: 1, m: 1 });
  const pdf = sheetPdf({
    sheet,
    head: sheetHead(state, options),
    paint: colored ? paletteColor : null,
    left: activePlanName(),
    right: options.stamp ? `${printStamp(now)} · ${page}` : page,
  });
  downloadFile(name, pdf, 'application/pdf');
  return name;
}

/** The teacher's WhatsApp chat with one line typed in, or null without a usable number. */
export function whatsappLink(teacher: Teacher, t: Translate): string | null {
  const number = whatsappNumber(teacher.phone);
  return number === null
    ? null
    : whatsappUrl(number, t('{ad} · Haftalık ders programı', { ad: teacher.name }));
}

/**
 * Opens the link the way a click on it would: a new tab in a browser (inside
 * the click, so no pop-up blocker stands in the way), the default browser
 * from the exe, whose own window must not turn into WhatsApp's site.
 */
export function openWhatsapp(url: string): void {
  if (isDesktop()) void desktopWhatsapp(url);
  else window.open(url, '_blank', 'noopener');
}
