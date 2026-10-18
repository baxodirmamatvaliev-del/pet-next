# Kakao va email autentifikatsiyasi — 1/4 audit

Sana: 2026-10-18. Holat: kod auditi tugadi; provayderlar hali ulanmagan.

## Tekshirilgan loyihalar

- Frontend: `/Users/user/Desktop/pet-next` (Next.js Pages Router, Apollo).
- Backend: `/Users/user/Desktop/pet-nest/apps/pat-nest-api` (NestJS, GraphQL, Mongoose).
- Audit davomida backend, baza va xizmat sozlamalari o‘zgartirilmadi, maxfiy kalitlar o‘qilmadi.
- Yuqori darajadagi AGENTS.md tilga olgan `petoria/docs/ai` katalogi va backenddagi `docs/ai` mavjud emas. Ushbu loyiha bo‘yicha natija shu hujjatda saqlanadi.

## Mavjud ishlaydigan ulash nuqtalari

| Qism | Fayl / metod | Natija |
| --- | --- | --- |
| Login UI | `pages/account/join.tsx` | Login/signup va ichki sahifaga qaytish mavjud |
| Frontend autentifikatsiya | `libs/auth/index.ts` | Login/signup cache tozalab `setJwtToken` chaqiradi |
| Sessiya | `libs/auth/session.ts` | Xotiradagi JWT, cookie orqali refresh, logout, tablar sinxronizatsiyasi |
| Backend login/signup | `components/member/member.resolver.ts` | Origin tekshiruvi va `AuthService.startSession` |
| Token va cookie | `components/auth/auth.service.ts` | `createToken`, `startSession`, refresh rotation, faol member tekshiruvi |
| Foydalanuvchi | `schemas/Member.model.ts` | Telefon, nickname va parol majburiy; telefon/nickname unique |
| API input | `libs/dto/member/member.input.ts` | Oddiy signup telefon/parol talab qiladi |

Backend fayl yo‘llari yuqoridagi backend `src/` katalogiga nisbatan berilgan.

## Aniqlangan o‘zgarish talablari

1. `MemberAuthType` ikkala loyihada `EMAIL` va `TELEGRAM`ni e’lon qiladi, lekin tegishli login oqimlari yo‘q; `KAKAO` yo‘q. Enum qiymati mavjudligi kirish ishlashini anglatmaydi.
2. Member modelida email, tasdiqlangan email va Kakao ID mavjud emas. Email yuborish/OTP/Kakao integratsiyasi tekshirilgan backend manbalarida topilmadi.
3. Social/email akkaunti uchun telefonsiz/parolsiz member yarata olish zarur. Eski nickname/parol signup validatsiyasi saqlanadi; social yaratish alohida backend oqimidan o‘tadi. Soxta telefon yoki tasodifiy parol saqlanmaydi.
4. `Member.memberPhone` GraphQL output’da non-null, frontend `Member` tipida majburiy string. Telefonsiz akkauntni qo‘llashda ikkala kontrakt va telefon ishlatadigan UI tekshiriladi.
5. Parol bilan login parolsiz member uchun bcrypt chaqirishdan avval bir xil credential xatosini qaytarishi kerak.
6. Cookie `HttpOnly`, `SameSite=Lax`, production’da `Secure`, path `/graphql`. CORS credentials bilan ishlaydi. Callback brauzerni frontendga qaytaradi; sessiya frontend yuborgan GraphQL POST orqali yaratiladi. Callback GET’iga Origin tekshiruvini ko‘r-ko‘rona qo‘llash mumkin emas.

## Minimal yechim — keyingi implementatsiya uchun taklif

Mavjud Member va RefreshSession qoladi. Alohida autentifikatsiya frameworki yoki JWT tizimi qo‘shilmaydi.

- Member’ga optional `kakaoId` (unique partial index), normallashtirilgan `memberEmail` (unique partial index), `emailVerifiedAt` qo‘shiladi. Telefon/parol modelda optional bo‘ladi, lekin mavjud signup input’da majburiy qoladi. Unique indexlar mavjud baza bilan tekshiriladi; qiymat yo‘qligida bo‘sh string yozilmaydi.
- Kakao a’zoni email bo‘yicha emas, provayderning tekshirilgan ID qiymati bo‘yicha topadi. Nickname band bo‘lsa backend unique variant yaratadi; yangi member roli USER bo‘ladi.
- Mavjud akkauntga email yoki Kakao ulash faqat sessiyada kirilgan, qayta tasdiqlangan alohida amal orqali qilinadi. Bu bosqichda avtomatik akkaunt birlashtirish yo‘q. Band email uchun oddiy xabar, bloklangan/o‘chirilgan member uchun kirishni rad etish kerak.
- Email kodi uchun bitta kichik challenge modeli: email, kodning maxfiy kalit bilan HMAC qiymati, amal qilish muddati, urinishlar, ishlatilganlik holati. Kod qisqa muddatli va bir martalik; qayta yuborish eski kodni bekor qiladi. Expiry so‘rovda ham tekshiriladi, TTL tozalashning o‘zi yetarli emas. Tasdiqlash atomik bajariladi; yuborish va tekshirish cheklanadi. Kodlar/loglarda provider tokenlari chiqarilmaydi.

### Taklif etilgan GraphQL kontrakti (hali mavjud emas)

| Amal | Kirish | Javob |
| --- | --- | --- |
| `beginKakaoLogin` | yo‘q | `authorizationUrl` |
| `loginWithKakao` | `code`, `state` | mavjud `AuthPayload` |
| `requestEmailLoginCode` | `email` | umumiy tasdiq va qayta yuborishgacha kutish muddati |
| `loginWithEmailCode` | `email`, `code` | mavjud `AuthPayload` |

Kakao boshlanishida server bir martalik state yaratib qisqa muddatli HttpOnly cookie bilan brauzerga bog‘laydi. Frontend `/account/kakao/callback` code/state’ni GraphQL orqali backendga yuboradi. Backend state’ni tekshirib bekor qiladi, authorization code’ni Kakao’da almashtirib, foydalanuvchi ID’sini tekshiradi. Maxfiy kalit va provider tokenlari frontendga berilmaydi. JWT URL’ga yozilmaydi.

Ikkala kirishning yakuni: faol member → `createToken` + `startSession` → `AuthPayload` → frontend cache tozalash + `setJwtToken` → xavfsiz ichki referrerga qaytish. Refresh/logout o‘zgarmaydi.

## 2/4 uchun kerakli sozlamalar

- Kakao Developers ilovasi, Kakao Login yoqilishi, REST API key va client secret, aniq ro‘yxatga olingan callback URI. Taklif: dev `http://localhost:3000/account/kakao/callback`; production URI haqiqiy domen bilan belgilanadi.
- Email xizmati, tasdiqlangan yuboruvchi domen/manzil, xizmat kaliti va kod HMAC uchun alohida server siri.
- Frontend/API production domenlari va mavjud `CLIENT_URLS` bilan cookie mosligi.
- Maxfiy qiymatlar backend environment’da; `NEXT_PUBLIC_*` ichiga joylanmaydi.

## 4/4 qabul mezonlari

Yangi va qaytgan foydalanuvchi; nickname/unique identity to‘qnashuvi; Kakao bekor qilish va noto‘g‘ri/qayta ishlatilgan state/code; email kodi eskirishi, xato urinishlar, qayta yuborish va parallel tasdiqlash; blocked/deleted member; mavjud parol login/signup; refresh, logout va referrer.

## Manba

Kakao rasmiy REST API hujjati (2026-10-18 tekshirildi): https://developers.kakao.com/docs/en/kakaologin/rest-api

## 2/4 davom etmoqda

Backend environment shablonlari va lokal email-kod siri tayyorlandi. Foydalanuvchi ikkala tashqi hisob ham hali yo‘qligini bildirdi. Kakao/email hisoblari va domen tasdig‘i kutilmoqda. Yo‘riqnoma: [SOCIAL_AUTH_SETUP.md](SOCIAL_AUTH_SETUP.md).
