/**
 * The one way into this folder from outside it: two ways to start a plan
 * from something, both opened from Okul and from Ayarlar. "Taslaktan başla"
 * (`DraftStart.tsx`) and the question that loads the sample school
 * (`useSample.ts`). Their own package because both of those tabs use them, and
 * putting them in either would make the other import it back.
 */
export { default as DraftStart } from './DraftStart';
export { useLoadSample, type LoadSample } from './useSample';
