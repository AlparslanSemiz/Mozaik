/**
 * The one way into this folder from outside it: a timetable on paper as data
 * (`sheet.ts`: a class's or a teacher's page, and the header they share). Where
 * a printed row is cut into cells (`cut.ts`) stays inside: only the sheets ask.
 * And the same teacher's page as the plain text of an e-mail (`mail.ts`).
 */
export { MAILTO_SINIRI, teacherMail, type MailForm, type TeacherMail } from './mail';
export {
  classSheet,
  sheetHead,
  teacherSheet,
  type Sheet,
  type SheetCell,
  type SheetDay,
  type SheetHour,
  type SheetOptions,
} from './sheet';
