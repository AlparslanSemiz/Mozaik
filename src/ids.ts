// Fresh ids for rooms, teachers, classes, lessons and plans.
//
// Anahtarlarda asla isim kullanılmaz, hep `id`: renaming "Şükrü" must not move
// a single placement. The alphabet leaves out characters that are read wrong
// when somebody has to compare two ids by eye.

import type { Id } from './types';

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'; // no lookalikes: l, o, 0, 1

export function newId(): Id {
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}
