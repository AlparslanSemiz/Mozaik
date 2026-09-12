// Mutasyon koşusunun vitest yapılandırması: temel config, eksi belge kapıları.
//
// `src/docs.test.ts` kum havuzunda koşamaz ve koşmasının bir anlamı da yok.
// Koşamaz, çünkü kapılar GERÇEK deponun diskini ölçüyor (her yol, her
// tanımlayıcı, her bağlantı) ve Stryker sandbox'ı budanmış bir kopya: `dist`,
// `scratch`, `test-results` ve bütün görüntüler dışarıda. Kapı orada kırmızıya
// döndüğünde bulduğu şey bayat bir belge değil, eksik bir klasör.
// Anlamı yok, çünkü bir belge kapısı `constraints.ts`'in bir mutantını
// yakalayamaz: ölçtüğü şey kod değil, belgenin kodla aynı şeyi söyleyip
// söylemediği.
//
// Bu bir muafiyet DEĞİL. Kapılar `npm test` ve `npm run kontrol` içinde her
// koşuda çalışıyor; buradan çıkan tek şey, hiçbir mutantı öldüremeyecek bir
// testin bütün koşuyu daha başlamadan durdurma yetkisi.
import { defineConfig, mergeConfig } from 'vite';
import taban from './vite.config';

export default mergeConfig(
  taban,
  defineConfig({
    test: {
      exclude: ['**/node_modules/**', '**/dist/**', 'src/docs.test.ts'],
    },
  }),
);
