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
import { desktopMail, desktopWhatsapp, isDesktop } from '../../platform/exe';
import { readPrintOptions } from '../../platform/prefs';
import { activePlanName, downloadFile } from '../../platform/storage';
import { blockSpans, buildIndex } from '../../pure/constraints';
import { classSheet, paperName, sheetHead, sheetPdf, teacherSheet } from '../../pure/paper';
import type { useT } from '../common';

type Translate = ReturnType<typeof useT>;

/** A PDF file not yet saved: its name in İndirilenler and its text. */
export interface PdfFile {
  name: string;
  pdf: string;
}

/**
 * One teacher's or class's sheet as "Mozaik – 510 – 2026-11-16.pdf", with the
 * same switches the printer uses; null when there is no such person any more.
 */
export function sheetFile(
  state: State,
  kind: 'teacher' | 'class',
  id: string,
  colored: boolean,
  t: Translate,
): PdfFile | null {
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
  return { name, pdf };
}

/**
 * THE REUSABLE HALF (İkame's list is the next caller): saves `file` in
 * İndirilenler, then opens the WhatsApp chat or the mail program it is to be
 * attached in, or nothing. Answers whether that opened; in a browser a page
 * cannot know, and says yes. Called inside the click: nothing is awaited
 * before `window.open`, so no pop-up blocker stands in the way. The exe opens
 * the default browser (`whatsapp_ac`), and its own window never turns into
 * WhatsApp's site.
 */
export function sendPdf(
  file: PdfFile,
  to?: { whatsapp: string } | { mailto: string },
): Promise<boolean> {
  downloadFile(file.name, file.pdf, 'application/pdf');
  if (to === undefined) return Promise.resolve(true);
  if ('whatsapp' in to) {
    if (isDesktop()) return desktopWhatsapp(to.whatsapp);
    window.open(to.whatsapp, '_blank', 'noopener');
  } else {
    if (isDesktop()) return desktopMail(to.mailto).then((r) => r === 'acildi');
    window.location.href = to.mailto;
  }
  return Promise.resolve(true);
}

/** The teacher's WhatsApp chat with one line typed in, or null without a usable number. */
export function whatsappLink(teacher: Teacher, t: Translate): string | null {
  const number = whatsappNumber(teacher.phone);
  return number === null
    ? null
    : whatsappUrl(number, t('{ad} · Haftalık ders programı', { ad: teacher.name }));
}
