# Frontend refresh-token review

## Review tartibi

1. `libs/auth/session.ts`: token qayerda turadi, refresh va logout qanday ishlaydi.
2. `apollo/client.ts`: tokenni headerga qo‘shish va authentication xatosida bir marta qaytarish.
3. `libs/auth/index.ts`: login/signup/logout funksiyalari.
4. `pages/_app.tsx`: sahifa ochilganda tiklash va boshqa tabdagi logout.

## Asosiy oqim

```text
Login/signup -> access token xotirada, refresh token HttpOnly cookie’da
API so‘rovi -> getValidAccessToken() -> Authorization: Bearer ...
Token tugashiga 30 soniya qolsa -> refreshToken -> yangi token -> API so‘rovi
Server tokenni rad etsa -> refresh -> avvalgi so‘rovni bir marta qaytarish
Sahifa qayta ochilsa -> refresh cookie orqali login holatini tiklash
Logout -> backend sessiyani bekor qilish -> xotira va Apollo cache’ini tozalash
```

- 10 daqiqa / 15 kunlik muddatlarni backend belgilaydi. Frontend refresh muddati uzaytirmaydi.
- `credentials: 'include'` brauzerga cookie’ni qabul qilish va yuborishni buyuradi.
- Access token localStorage’ga yozilmaydi. Eski accessToken kaliti bir marta o‘chiriladi.
- `refreshPromise` bir tabdagi parallel so‘rovlarni birlashtiradi.
- `navigator.locks` tablar orasida cookie rotation va logoutni navbatga qo‘yadi.
  Bu API HTTPS/localhostda mavjud; qo‘llamaydigan brauzerda faqat bir tab ichidagi himoya qoladi.
- `sessionVersion` logoutdan oldin boshlangan refresh javobi sessiyani qayta ochishiga yo‘l qo‘ymaydi.
- Login/signup xatolari refreshni chaqirmaydi. 403 ruxsat xatosi ham refresh qilinmaydi.
- Vaqtinchalik tarmoq xatosi mavjud login holatini o‘chirmaydi. Logout bajarilmasa, foydalanuvchiga xato chiqadi.
- Rasm uploadlari yuborilishidan oldin token tekshiriladi; socket qayta ulanganda ham yaroqli token olinadi.
- Boshqa tabga token yuborilmaydi; faqat logout vaqti localStorage event orqali tarqaladi.

## Mahalliy tekshiruv

Backend ishlayotgan, `CLIENT_URLS` frontend originiga mos bo‘lishi kerak.
Frontend/API cookie uchun bir site ostida bo‘lishi kerak (localhostda turli portlar mumkin).
Productionda HTTPS va backend `NODE_ENV=production` talab qilinadi.

1. Login qiling: Network javobida Set-Cookie, Application/Cookies’da pet_refresh borligini ko‘ring.
2. Local Storage’da accessToken yo‘qligini tekshiring; refresh cookie HttpOnly bo‘lsin.
3. Sahifani qayta oching: refreshToken so‘rovi login holatini tiklasin.
4. 10 daqiqadan keyin savatni oching yoki rasm yuklang: refresh va keyingi API so‘rovi ishlasin.
5. Ikki tabda ishlating: refresh so‘rovlari navbat bilan bajarilsin; logout ikkala tabda login holatini tozalasin.
6. Logoutdan keyin reload qiling: mehmon holatida qolsin.

Avvalgi 30 kunlik tokenlar uchun refresh sessiya yo‘q; yangilangan frontendda bir marta qayta login kerak.

## Avtomatik tekshiruv

- `yarn test:auth`: Node test runner bilan session va haqiqiy Apollo link oqimlari. HTTP mock ishlatiladi.
- `yarn exec tsc --noEmit --incremental false`
- `yarn lint`

Testlar jonli backend, haqiqiy cookie siyosati yoki brauzer Web Locks ishlashining o‘rnini bosmaydi.

Apollo retry oqimi: https://www.apollographql.com/docs/react/v3/data/error-handling

## Jonli tekshiruv natijasi — 2026-10-10

Mahalliy frontend `http://localhost:3000`, backend `http://localhost:3002/graphql`,
haqiqiy Chrome va development MongoDB bilan 12 ta tekshiruv o‘tdi:

- UI signup va login; JWT ichidagi `exp - iat = 600`.
- Brauzerda 15 kunlik HttpOnly, SameSite=Lax, /graphql cookie.
- JavaScript cookie qiymatini o‘qiy olmaydi; access token localStorage’da yo‘q.
- MongoDB’da tokenning o‘zi emas, SHA-256 hashi saqlangan.
- Reload login holatini tiklaydi, refresh token almashadi, tugash sanasi uzaymaydi.
- Haqiqiy backendga imzosi to‘g‘ri, muddati tugagan JWT yuborilganda Apollo
  bitta refresh orqali savat so‘rovini muvaffaqiyatli qayta yuboradi.
- Brauzer vaqti vaqtincha oldinga surilganda token API so‘rovidan oldin yangilanadi.
- Ikki haqiqiy tab bir paytda sessiyani tiklay oladi; sessiya bekor qilinmaydi.
- Ruxsat etilmagan Origin’dan refresh rad etiladi.
- UI logout bazadagi sessiyani bekor qiladi, cookie’ni o‘chiradi va ikkala tabni chiqaradi.
- Refresh sessiyaning bazadagi muddatini test uchun eskirtirganda qayta login talab qilinadi.
- Brauzerda ushlanmagan JavaScript xatosi kuzatilmadi.

10 daqiqa/15 kunni kutish o‘rniga muddati tugagan JWT, brauzer soati va faqat
vaqtinchalik test sessiyasining expiresAt qiymati orqali muddat holatlari sinovdan o‘tkazildi.
Test akkaunti va unga tegishli refresh sessiyalar tekshiruvdan keyin bazadan o‘chirildi.
