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

## 2-bosqichni review qilish

1. `libs/theme/colors.ts` — `colors` ochiq tema, `darkColors` to‘q tema.
   Ikkalasida bir xil nomlar bor. `primary` — matn va ikonka,
   `primary-fill` — oq matnli tugma yoki banner foni.
   Shu sabab dark mode’da yashil matn yorqin, tugma foni esa to‘q qoladi.
2. `scss/MaterialTheme/index.ts` — ikkala palette MUI’ning `colorSchemes` tizimiga beriladi.
   `scss/_variables.scss` orqali mavjud SCSS ham shu ranglarni o‘qiydi.
3. `pages/_app.tsx` — `ThemeProvider` ilovaga temani beradi.
   Birinchi tashrifda qurilmaning light/dark tanloviga amal qiladi.
   Foydalanuvchi tanlovi `localStorage` ichidagi `pet-theme` kalitida saqlanadi.
   Saqlash, qayta tiklash va tablar orasida sinxronlashni MUI bajaradi.
4. `pages/_document.tsx` — `InitColorSchemeScript` sahifa ko‘rinishidan oldin
   saqlangan temani qo‘llaydi. `suppressHydrationWarning` shu script o‘zgartiradigan
   `<html>` atributi uchun qo‘yilgan.
5. `libs/components/ThemeToggle.tsx` — `useColorScheme()` dan joriy temani oladi;
   tugma bosilganda `setMode('light')` yoki `setMode('dark')` chaqiradi.
   Shu komponent desktop, mobil va admin headerida ishlatiladi.
6. `scss/_theme.scss` — tema tugmasi va SweetAlert oynalari ranglari.
   Sahifa SCSS fayllarida tugma fonlari `primary-fill` / `secondary-fill` ga ulangan;
   mobil va planshet headerida yangi tugmaga joy ajratilgan.

Yangi dependency qo‘shilmagan. MUI’ning mavjud
[dark mode tizimi](https://mui.com/material-ui/customization/dark-mode/) ishlatilgan.

### Qo‘lda tekshirish

1. Headerdagi oy/quyosh tugmasini bosing: sahifa, input, menyu va kartochkalar birga o‘zgaradi.
2. Sahifani yangilang va boshqa sahifaga o‘ting: tanlangan tema saqlanadi.
3. Saytni ikkinchi tabda oching, temani almashtiring: birinchi tab ham yangilanadi.
4. DevTools → Application → Local Storage’dan faqat `pet-theme` kalitini o‘chiring,
   sahifani yangilang: qurilma tanloviga qaytadi.

### 2-bosqich tekshiruvi

- TypeScript, ESLint va mavjud 12 ta auth testi o‘tdi.
- Production build `NEXT_PUBLIC_API_URL=https://api.koreapet.tech yarn build` bilan o‘tdi.
  Shu manzil `compose.prod.yml` ichida ham berilgan.
- Chrome’da bosh sahifa, Help Center, login, mahsulotlar va savat
  1440px, 900px, 390px va 320px kengliklarda tekshirildi.
- Tema tugmasi, saqlash, qayta yuklash, tablar sinxronligi va tizim tanlovi tekshirildi.
- MUI accordion, mobil drawer va bildirishnoma oynasi to‘q ranglarni olishi tasdiqlandi.
- 320px ekrandagi login holati sun’iy sessiya bilan tekshirildi; header overflow’i tuzatildi.
- Hydration yoki ushlanmagan JavaScript xatolari kuzatilmadi.
- Production HTML’da saqlangan dark tema ilova JavaScript’i yuklanishidan oldin qo‘llanishi tekshirildi.

Commit: `feat(theme): add persistent light and dark mode`
