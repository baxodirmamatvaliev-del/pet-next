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

## 3-bosqichni review qilish

1. `libs/i18n/config.ts` — qo‘llab-quvvatlanadigan tillar: `en`, `uz`, `ko`, `ru`.
   `next.config.ts` shu ro‘yxatni Next.js’ning tayyor i18n routingiga beradi.
   Inglizcha sahifa `/cs`, qolgan tillar `/uz/cs`, `/ko/cs`, `/ru/cs` bo‘ladi.
2. `libs/i18n/locales/` — har tilning alohida lug‘ati.
   Inglizcha lug‘at tarjima kalitlarini belgilaydi; qolgan uchalasida kalit
   yetishmasa yoki ortiqcha kalit yozilsa, TypeScript xato beradi.
3. `libs/i18n/index.ts` — `useTranslation()` URL’dagi tilni olib, tegishli lug‘atni tanlaydi.
   Alohida React state yoki provider yo‘q: joriy tilni Next.js boshqaradi.
4. `libs/components/LanguageSwitcher.tsx` — `router.replace()` bilan faqat tilni almashtiradi.
   Sahifa, query, hash va scroll saqlanadi. Muvaffaqiyatli almashgach,
   `NEXT_LOCALE` cookie’siga tilni bir yilga yozadi.
5. Desktopda selector headerda, mobilda menyuning yuqori qismida, adminda tema tugmasi yonida.
   Header, mobil menyu, qidiruv yozuvlari va tema tugmasining tooltip’i tarjimaga ulangan.
6. `pages/_document.tsx` ichidagi doimiy `lang="en"` olib tashlandi:
   `<html lang>` atributini Next.js joriy tilga mos beradi.

Saytning `/` manziliga qaytganda Next.js avval `NEXT_LOCALE` cookie’sini,
u bo‘lmasa brauzer tilini tekshiradi. Mos til topilmasa inglizchani ochadi.
Til prefiksi bor manzilni, masalan `/ru/cs` ni ochish shu sahifani ruscha ko‘rsatadi.
Cookie faqat til tanlovi uchun, auth tokenlariga aloqasi yo‘q.

### Kodda ishlatish

```tsx
const { locale, t } = useTranslation();

<span>{t('nav.help')}</span>
<span>{t('nav.itemCount', { count: 3 })}</span>
```

`uz` tanlanganda natija `Yordam markazi` va `Mahsulotlar: 3` bo‘ladi.
Yangi matn uchun avval `en.ts` ga kalit, keyin `uz.ts`, `ko.ts`, `ru.ts` ga tarjima qo‘shiladi.
Komponentdagi matn `t('kalit')` bilan almashtiriladi. Matnlar oddiy React string sifatida chiqariladi.

Yangi dependency qo‘shilmagan. Qolgan sahifalar, formalar, bildirishnomalar va admin matnlari
4-bosqichda shu tizimga ulanadi. Foydalanuvchilar yozgan mahsulot nomi, xabar va tavsiflar
ushbu lug‘atlar orqali avtomatik tarjima qilinmaydi.

### Qo‘lda tekshirish

1. Desktop headerdan EN / UZ / KO / RU ni tanlang; navigatsiya va qidiruv yozuvlari o‘zgaradi.
2. `/cs?tab=faq` da tilni almashtiring: `tab=faq` saqlanadi.
3. Sahifani yangilang: til URL orqali saqlanadi. Saytning `/` manzilini yangi tabda oching:
   oxirgi tanlangan til cookie orqali tiklanadi.
4. Mobilda menyuni oching va yuqoridagi selector orqali tilni almashtiring.
5. Dark mode’ni yoqing va tilni almashtiring: tema saqlanadi.

### 3-bosqich tekshiruvi

- TypeScript, ESLint va production build o‘tdi; to‘rtta til uchun 108 ta statik sahifa yaratildi.
- Production standalone versiyada to‘rtta tilning headeri ilova JavaScript’i yuklanishidan
  oldin ham server HTML’ida to‘g‘ri chiqishi tekshirildi.
- Til selector’i, query/hash, lokal linklar, qayta yuklash va keyingi tashrifdagi cookie ishlashi tekshirildi.
- Brauzer tilini aniqlash, qo‘lda tanlangan tilning ustunligi va admin kirish oynasidagi selector tekshirildi.
- 1440px desktop, 900px/761px planshet va 390px/320px mobil ko‘rinishlar tekshirildi.
  Login holatidagi tekshiruvlar sun’iy sessiya bilan bajarildi; backendga ma’lumot yozilmadi.
- Dark mode saqlandi; gorizontal overflow, hydration va ushlanmagan JavaScript xatolari kuzatilmadi.

Commit: `feat(i18n): add English Uzbek Korean and Russian support`

## 4-bosqichni review qilish

Sahifalar, formalar, bo‘sh ro‘yxat va xato holatlari EN / UZ / KO / RU lug‘atlariga ulandi.
Bunga bosh sahifa, katalog, jonivorlar, agentlar, savat, checkout, profil, yordam markazi
va admin kiradi. Yangi dependency qo‘shilmadi.

1. `libs/i18n/locales/` — oddiy matnlar va to‘liq jumlalar.
   Ko‘p o‘zgarish aynan shu lug‘atlarda: har bir matnning to‘rtta nusxasi kerak.
   `ui.*` — tugma va sarlavhalar, `message.*` — o‘zgaruvchi qatnashgan jumlalar,
   `counts.*` — sonlar, `notification.*` — tizim bildirishnomalari.
2. `libs/i18n/index.ts` — mavjud `t()` ga ikkita kichik yordamchi qo‘shildi:
   `label()` enumning ekrandagi nomini, `errorText()` backend xabarini tarjima qiladi.
3. `libs/i18n/labels.ts` — enum va tarjima kaliti orasidagi oddiy jadval.
   Masalan, `<MenuItem value={status}>{label(status)}</MenuItem>` ichida
   foydalanuvchi «Faol»ni ko‘radi, backendga esa `ACTIVE` yuboriladi.
4. `libs/i18n/errors.ts` — ma’lum backend xatolari, masalan noto‘g‘ri parol yoki
   yetarli zaxira yo‘qligi. Noma’lum xatoga UZ / KO / RU da umumiy xabar chiqadi;
   inglizcha rejimda asl xabar saqlanadi.
5. `libs/i18n/notifications.ts` — backendning tayyor bildirishnoma sarlavhalarini tarjima qiladi.
   Agent ismi, yordam so‘rovi mavzusi va foydalanuvchi yozgan matn saqlanadi.
   Noma’lum bildirishnoma ham asl holicha chiqadi.
6. `libs/sweetAlert.ts` — tasdiqlash va bekor qilish tugmalari matnini chaqiruvchi komponent beradi.
   Sanalar joriy `locale` bilan, Koreya vaqt mintaqasida ko‘rsatiladi.
   `scss/MaterialTheme/index.ts` sahifalash va yulduzli baho accessibility yozuvlarini ham tarjima qiladi;
   `_app.tsx` temani til o‘zgargandagina qayta yaratadi.

Masalan, e’lon holatini o‘zgartirishda:

```tsx
const { t, label } = useTranslation();

const question = t('message.changeStatus', {
  name: pet.petName,
  status: label(petStatus),
});
```

UZ da: «Bori holatini “Band qilingan”ga o‘zgartirasizmi?».
Ism va holat alohida joylashtiriladi; boshqa til o‘z lug‘atida ularning tartibini belgilaydi.
Mahsulot nomi, tavsif, sharh va foydalanuvchi xabarlari avtomatik tarjima qilinmaydi.
Narxlar barcha tillarda Koreya vonida qoladi. Sinov to‘lovlarida haqiqiy pul yechilmasligi
haqidagi yozuvlar to‘rtta tilda ham saqlangan.

### Qo‘lda tekshirish

1. Tilni almashtirib, katalog, Help Center va login formasini oching: matn va formalar o‘zgaradi.
2. Hisobingizda sevimlilar, kuzatuvchilar, buyurtmalar va bo‘sh ro‘yxat holatlarini ko‘ring.
3. Jonivor yoki mahsulot formasida dropdown matnini almashtiring: yuboriladigan enum o‘zgarmaydi.
4. Buyurtmani bekor qilish oynasini oching: savol va ikkala tugma tanlangan tilda chiqadi.
5. Dark mode’da boshqa tilni tanlang: tema va joriy sahifa saqlanadi.

320px ekranda uzun tarjimalar sig‘ishi uchun bosh sahifa kartalari va checkout gridlari ham
moslandi (`scss/mobile/_general.scss`, `scss/mobile/_checkout.scss`).

Avtomatik lug‘at va bildirishnoma tekshiruvi: `yarn test:i18n`.

### 4-bosqich tekshiruvi

- TypeScript, ESLint va production build o‘tdi; 108 ta statik sahifa yaratildi.
- Auth testlari: 12/12. Lug‘at kalitlari, jumla parametrlari va bildirishnoma testlari: 3/3.
- Desktopda 34 ta sahifa/tab to‘rtta tilda, mobilda shu ekranlar UZ / KO / RU da
  320px va 390px o‘lchamlarda ochib tekshirildi.
- Bosh sahifa va checkoutdagi mobil kengayish tuzatildi va ikkala o‘lchamda,
  to‘rtta tilda, yorug‘ va to‘q rejimlarda qayta tekshirildi.
- Til selector’i, query/hash, server HTML’i, cookie va dark mode saqlanishi tekshirildi.
- Kirilgan hisob, admin va buyurtma holatlari test javoblari bilan tekshirildi;
  haqiqiy backendga ma’lumot yozilmadi.
- To‘rtta tilda buyurtma natijasi, to‘lovni qayta urinish xabari, admin to‘lov oynasi,
  bo‘sh sevimlilar va backendga yuboriladigan enumlar tekshirildi.
  Noto‘g‘ri parol xabari UZ login formasida ham tekshirildi.
- Hydration va ushlanmagan JavaScript xatolari kuzatilmadi.

Commit: `feat(i18n): translate application pages and forms`
