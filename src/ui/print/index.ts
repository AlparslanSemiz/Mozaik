/**
 * The one way into this folder from outside it: the Çıktı screen and the
 * shape of what it leaves out, and the person page's Yazdır (`PrintOne`) and
 * Gönder (`SendTeacher`). The page itself (`Sheet.tsx`) is not here.
 */
export { default as Print, NOTHING_EXCLUDED, type Excluded } from './Print';
export { PrintOne, usePrintNow } from './PrintOne';
export { SendTeacher } from './MailPanel';
