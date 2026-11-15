/**
 * What a file Mozaik did not write is told: what it is not, which file to pick
 * instead, and where an Excel list goes. The top bar's "Dosyadan aç" and
 * Ayarlar's "Tümünü dosyadan aç" say the same thing, so it is written once.
 *
 * It used to be "Mozaik'in kaydettiği bir .json plan dosyası seçin", and an
 * .xlsx picked by mistake got it too: a file extension is not something he
 * knows his file by, the button he saved it with is.
 */
export const WRONG_FILE = [
  "Bu, Mozaik'in kaydettiği bir dosya değil. 'Dosyaya kaydet' ile kaydettiğiniz dosyayı seçin.",
  "Excel'deki bir listeyi almak için Okul'daki listelerde Excel'den yapıştır düğmesini kullanın.",
] as const;
