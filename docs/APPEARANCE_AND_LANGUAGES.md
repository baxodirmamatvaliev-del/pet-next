# Ranglar, dark mode va 4 til — 4 alohida commit

Har bosqich alohida review qilinadi va foydalanuvchi tomonidan commit qilinadi.

1. `refactor(theme): centralize and harmonize application colors`
   Umumiy ranglar, MUI va SCSS bir xil palette’dan foydalanishi.
2. `feat(theme): add persistent light and dark mode`
   Headerdagi tema tugmasi, mos dark ranglar, tanlovni saqlash.
3. `feat(i18n): add English Uzbek Korean and Russian support`
   Tarjima lug‘atlari, til tanlash va tanlovni saqlash.
4. `feat(i18n): translate application pages and forms`
   Sahifalar, formalar, bildirishnomalar va holat matnlarini tarjimaga ulash.

## 1-bosqichni review qilish

- `libs/theme/colors.ts` — ranglarning yagona manbasi. Har nom rangning vazifasini bildiradi:
  `canvas` — sahifa foni, `surface` — kartochka, `ink` — asosiy matn,
  `muted` — yordamchi matn, `border` — chegara, `primary` — PetNest yashil rangi.
- `pages/_document.tsx` — ranglarni CSS o‘zgaruvchilari sifatida server HTML’iga qo‘shadi.
  Shuning uchun JavaScript yuklanishidan oldin ham ranglar mavjud.
- `scss/_variables.scss` — mavjud Sass nomlari saqlangan, lekin endi CSS o‘zgaruvchilarini o‘qiydi.
- `scss/MaterialTheme/index.ts` — MUI tugmalari, inputlari, alertlari ham shu ranglardan foydalanadi.
- Sahifa SCSS fayllarida yaqin ranglar bir xil semantik ranglarga birlashtirilgan.
  Oq matn (`on-dark`) va oq kartochka (`surface`) alohida nomlangan.
- Yashil PetNest uslubi saqlangan; sahifa foni yumshoq, matn va coral accent kontrasti oshirilgan.

Dark mode va tarjimalar 1-bosqichga kirmaydi. Yangi dependency qo‘shilmagan.

### 1-bosqich tekshiruvi

- TypeScript, umumiy ESLint va production build o‘tdi.
- Chrome’da bosh sahifa, Help Center, login, mahsulotlar va savat sahifalari
  1440px hamda 390px kengliklarda tekshirildi.
- Umumiy CSS ranglari to‘g‘ri qo‘llangan, gorizontal overflow va ushlanmagan
  JavaScript xatolari kuzatilmadi.
