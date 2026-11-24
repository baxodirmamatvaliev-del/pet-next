# PetNest integratsiyalari auditi

Sana: 2026-11-04, Asia/Seoul.

Frontend: `/Users/user/Desktop/pet-next`. Kontraktlarni solishtirish uchun backendning `/Users/user/Desktop/pet-nest/apps/pat-nest-api/src` va batchning `apps/pet-batch/src` manbalari ham o‘qildi. Quyida `backend/` shu API `src` katalogini bildiradi.

Bu kod va lokal tekshiruvlar auditi. Production serverga kirilmadi, haqiqiy akkaunt, to‘lov, upload yoki baza bilan tajriba qilinmadi. Maxfiy environment qiymatlari o‘qilmadi; frontenddagi uchta ochiq API manzili tekshirildi. Ishlaydigan kod borligi servisning jonli ishlashini tasdiqlamaydi. Ilova kodi va backend o‘zgartirilmadi; ushbu hisobot qo‘shildi.

## Asosiy natijalar

- 60 ta markaziy GraphQL hujjati va komponentlardagi 3 ta upload hujjati — jami **63/63** — hozirgi backenddan lokal yaratilgan GraphQL sxemasiga mos. Tekshiruv field, argument, selection va input type mosligini qamradi. Resolverlar bajarilmadi, DBga ulanilmadi.
- Barcha 60 ta markaziy query/mutation uchun frontendda foydalanish joyi topildi. Ortiqcha qolgan markaziy GraphQL operatsiyasi topilmadi.
- **25/25 test o‘tdi**, `yarn typecheck` va ilova manbalariga qaratilgan ESLint tekshiruvi o‘tdi.
- Shu sessiyada auditdan oldin production build muvaffaqiyatli tugagan: 108 ta lokalizatsiyalangan statik sahifa. Build backend oqimlarini to‘liq sinamaydi.
- Kakao/email login hali ulanmagan. Card/Kakao Pay haqiqiy pul yechadigan integratsiya emas: backenddagi demo payment va admin tasdig‘i mavjud.
- Birinchi tuzatish kerak bo‘lgan joy: chatdagi foydalanuvchi ma’lumotlarini umumiy broadcast qilish. Bu sun’iy ma’lumot bilan lokal qayta namoyish qilindi.

## 1. Integratsiyalar xaritasi

| Integratsiya | Transport/manba | Kirish nuqtalari | Holati |
| --- | --- | --- | --- |
| Asosiy backend | HTTPS GraphQL POST | `libs/config.ts`, `apollo/client.ts`, `apollo/user/*`, `apollo/admin/*` | Kod mavjud, sxema mos |
| Login/signup/refresh/logout | GraphQL + Bearer JWT + HttpOnly refresh cookie | `libs/auth/index.ts`, `libs/auth/session.ts`, `pages/_app.tsx` | Kod va mock testlar mavjud |
| Profil | GraphQL + rasm multipart upload | `MyProfile.tsx`, `GET_MEMBER`, `UPDATE_MEMBER` | Kod mavjud |
| Mahsulotlar | GraphQL CRUD, variant/SKU, filtr, like, tarix | `pages/product/*`, `components/product/*` | Kod mavjud |
| Hayvon e’lonlari | GraphQL CRUD, filtr, like, tarix | `pages/pet/*`, `components/pet/*` | Kod mavjud |
| Follow va izohlar | GraphQL | `MyFollows`, `PetComments`, `ProductReviews`, member detail | Kod mavjud |
| Savat | GraphQL, Apollo reactive counter | `pages/cart`, product detail, `Top.tsx`, `cartCountVar` | Kod mavjud |
| Buyurtma/to‘lov | GraphQL, MongoDB tranzaksiya, admin tasdig‘i | checkout, order detail, admin orders | Demo to‘lov oqimi |
| Rasmlar | GraphQL multipart + backend `/uploads` | Axios uploaderlar, backend `ImageUploadService` | Kod mavjud |
| Umumiy chat | Native WebSocket | `Chat.tsx`, backend `SocketGateway` | Kod mavjud, maxfiylik muammosi bor |
| Bildirishnoma | Socket.IO + GraphQL refetch/read | `NotificationBell.tsx`, backend notification service/gateway | Kod mavjud, hisoblash va qayta ulanish cheklovlari bor |
| Murojaatlar | GraphQL + Socket.IO notification | `components/cs/*`, `pages/cs`, admin inquiries | Kod mavjud, email yubormaydi |
| Admin | GraphQL + DBdan olingan rol + server guards | `LayoutAdmin.tsx`, `apollo/admin/*` | Frontend va backend tekshiruvlari mavjud |
| Video | YouTube iframe | `homepage/PetVideo.tsx` | Bitta tashqi embed |
| Til | Next.js i18n + lokal lug‘atlar + cookie | `libs/i18n/*`, `LanguageSwitcher.tsx`, `next.config.ts` | en/uz/ko/ru |
| Tema va UI | MUI/Emotion/Sass + browser storage | `_app`, `_document`, `ThemeToggle`, theme fayllari | Tashqi servis emas |
| SEO | Next Head, canonical, robots headers | `_app.tsx`, `_document.tsx`, `libs/seo.ts`, `public/robots.txt` | Kod mavjud |
| Hosting | Docker Compose + Caddy HTTPS/proxy | `Dockerfile`, `compose.prod.yml`, `deploy/Caddyfile` | Konfiguratsiya mavjud, deploy qilinmadi |
| Reyting batch | NestJS cron + MongoDB | sibling backend `apps/pet-batch/src` | Kod mavjud, frontend Compose ichida ishga tushirilmaydi |
| Kakao/email auth | Faqat UI va setup hujjatlari | `pages/account/join.tsx`, `docs/SOCIAL_AUTH_*` | Ulanmagan |

Tekshirilgan ilova manbalarida Stripe/Toss/PortOne, email delivery SDK, SMS/OTP provayderi, Google/Naver OAuth, Telegram auth oqimi, analytics yoki Sentry integratsiyasi topilmadi. Enumda `EMAIL`/`TELEGRAM` bo‘lishi integratsiya borligini anglatmaydi.

## 2. Environment va deploy

| Sozlama | Development | Lokal production / Compose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | `https://api.koreapet.tech` |
| `NEXT_PUBLIC_API_GRAPHQL_URL` | `http://localhost:3002/graphql` | `https://api.koreapet.tech/graphql` |
| `NEXT_PUBLIC_API_SOCKET_URL` | `http://localhost:3002` | `https://api.koreapet.tech` |
| Chat URL | `ws://localhost:3002/?token=...` | `wss://api.koreapet.tech/?token=...` |
| Socket.IO | API origin, default `/socket.io/` | API origin, default `/socket.io/` |

`libs/config.ts` URL oxiridagi bitta `/`ni olib tashlaydi. GraphQL va socket manzillari berilmasa asosiy URLdan olinadi. Productionda asosiy API URL yo‘qligi xato chiqaradi. Hozir URL formatini va HTTPSni qat’iy validatsiya qilmaydi.

`NEXT_PUBLIC_*` qiymatlari frontend buildga kiritiladi. Server ishga tushganidan keyin environmentni almashtirish mavjud brauzer bundle manzilini almashtirmaydi; qayta build kerak. `.env.production` gitignore ichida, boshqa mashinaga avtomatik o‘tmaydi. Docker uni `.dockerignore` orqali chiqarib tashlaydi va build argumentlardan foydalanadi. Compose argumentlari hozir to‘ldirilgan.

Backend uchun `SECRET_TOKEN`, `MONGO_DEV` yoki `MONGO_PROD`; productionda `CLIENT_URLS` talab qilinadi. `PORT_API` default 3002. Backend `ConfigModule.forRoot()` default env yuklashidan va process environmentdan foydalanadi; Compose `.env.production`ni process environmentga beradi. MongoDB URI va server kalitlari frontendga kiritilmaydi.

Caddy `koreapet.tech`ni `frontend:3000`ga, `api.koreapet.tech`ni `backend:3002`ga yo‘naltiradi. `www` asosiy domenga redirect qiladi. Uploadlar named volume, sertifikat holati Caddy volumelarida turadi. Frontend container root bo‘lmagan foydalanuvchi bilan ishlaydi va HTTP healthcheck mavjud.

Backend order/payment tranzaksiyalari uchun MongoDB tranzaksiyalarni qo‘llaydigan topologiya kerak. Compose MongoDBni o‘zi ishga tushirmaydi. Haqiqiy DB topologiyasi bu auditda tekshirilmadi.

## 3. Autentifikatsiya qanday ishlaydi

1. `_app.tsx` ilova ochilganda `restoreSession()`ni boshlaydi.
2. Refresh GraphQL POST `credentials: include` bilan yuboriladi, 15 soniyalik timeout bor.
3. Backend refresh cookie’ni va ruxsat etilgan `Origin`ni tekshiradi. Cookie `pet_refresh`, HttpOnly, SameSite=Lax, path `/graphql`; productionda Secure.
4. Access JWT frontend xotirasida saqlanadi. `localStorage`ga yozilmaydi; eski `accessToken` kaliti olib tashlanadi.
5. Backend access JWTni 10 daqiqaga beradi. Refresh sessiya 15 kunlik, rotation dastlabki muddatni uzaytirmaydi; DBda tokenning SHA-256 hashi saqlanadi.
6. `getValidAccessToken()` muddati tugashiga 30 soniyadan kam qolgan tokenni yangilaydi.
7. Apollo auth link Bearer header qo‘shadi. Unauthorized javobda refresh va bitta qayta yuborish bor. Login/signup `skipRefresh` orqali bu mexanizmdan ajratilgan.
8. Bir tabda `refreshPromise`, brauzer qo‘llasa tablar orasida `navigator.locks` parallel refreshni navbatlaydi. `sessionVersion` eski refresh javobining logoutdan keyin sessiyani tiklashini to‘sadi.
9. Logout server tasdig‘idan keyin xotira, savat counter va Apollo cache’ni tozalaydi; boshqa tabga faqat logout timestamp yuboriladi.

`jwt-decode` imzo tekshiruvi emas. Frontend u orqali claimlarni o‘qiydi; imzo va faol foydalanuvchini backend tekshiradi. Admin frontenddagi JWT roliga tayanmaydi: `GET_MEMBER` orqali rolni oladi, backend `RolesGuard` ham tekshiradi.

Frontend va API bir site ostida ishlashga moslangan. Hozirgi production domenlari shunday. Boshqa mustaqil domenlarga ko‘chirilsa cookie/CORS siyosati qayta ko‘rib chiqiladi. `CLIENT_URLS` aniq frontend originlarini qamrashi kerak; live qiymatlari o‘qilmadi.

## 4. Savdo va to‘lov oqimi

Product detail `ADD_TO_CART` chaqiradi. Savat quantity o‘zgartirish, item o‘chirish va tozalash mutatsiyalariga ulangan. Header `GET_MY_CART` orqali counter oladi.

Checkout profil ma’lumotlari bilan recipient/telefon/manzilni to‘ldiradi. So‘ng `CREATE_ORDER`, keyin `CREATE_PAYMENT` yuboradi. Frontend to‘lov summasini yubormaydi; backend narx va totalni mahsulot variantlari orqali hisoblaydi. Stok buyurtma yaratishda kamayadi, bekor qilishda tiklanadi. Order yaratish MongoDB tranzaksiyasida; bir member va savat `updatedAt`iga unique index bor.

`createPayment` mavjud order bo‘yicha PENDING yozuv yaratadi; order uchun mavjud payment bo‘lsa uni qaytaradi. Providerga HTTP chaqiruv, karta formasi, bank tasdig‘i, provider redirect yoki webhook yo‘q. Admin `CONFIRM_PAYMENT` orqali demo to‘lovni tasdiqlaydi; backend payment va orderni bitta tranzaksiyada yangilab, sotuv counterini oshiradi. UI bu demo ekanini matnlarda ko‘rsatadi.

Yetkazish holatlari admin tomonidan PAYMENT_CONFIRMED → IN_TRANSIT → DELIVERED_TO_CUSTOMER tartibida o‘zgartiriladi. Bu kuryer API integratsiyasi emas. Holat o‘zgarsa backend notification yaratadi. Foydalanuvchining `getOrder` va cancellation operatsiyalari egaga bog‘langan.

## 5. Rasmlar va fayllar

Profil `imageUploader`, mahsulot va hayvon formasi `imagesUploader` yuboradi. GraphQL multipart `operations`, `map`, fayllar shaklida tuziladi; targetlar `member`, `products`, `pet`. Axios headerda Bearer va `apollo-require-preflight` yuboradi.

Backendda auth guard, upload throttle, 10 fayl, har fayl uchun 15,000,000 bayt limit bor. JPG/JPEG va PNG uchun MIME, extension va boshlang‘ich binary signature tekshiriladi; target allowlist bor. Fayl UUID bilan vaqtinchalik yozilib, tekshiruvdan keyin rename qilinadi. Batch upload qisman yiqilsa o‘sha chaqiruvdagi yuklangan fayllarni tozalaydi.

Rasmlar backend `/uploads/...` orqali ochiq tarqatiladi. Frontend ularni API URL bilan birlashtiradi; kartalardagi `next/image` `unoptimized` bo‘lgani uchun backend rasmlari Next optimizatoridan o‘tmaydi. S3/CDN integratsiyasi topilmadi. Upload va listing mutation alohida: upload muvaffaqiyatli, listing saqlash xato bo‘lsa yetim rasm qolishi mumkin.

Axios uploaderlar Apollo auth retry linkidan o‘tmaydi. Ular yuborishdan oldin token oladi, ammo upload paytidagi 401 uchun avtomatik refresh/retry va timeout berilmagan. Product/pet formalarida count/MIME tekshiruvi bor, frontend size tekshiruvi yo‘q; backend limit qo‘llaydi. Profil uploaderida client validation yanada kam.

## 6. Chat, bildirishnoma va support

Chat native WS, notification Socket.IO. Ular ataylab ikkita turli protokol; birini o‘chirish ikkinchisini almashtirmaydi. Backend default HTTP portini bo‘lishadi va notification gateway `/socket.io/` upgrade yo‘lini chat adapteridan ajratadi.

Chat umumiy xonadir, shaxsiy mijoz–operator dialogi emas. Mehmonlar ham ulana oladi. Chiqish payloadi `{event:'message', data:'text'}`. Kirish eventlari `info`, `getMessages`, `message`. Backend oxirgi 5 xabarni process xotirasida saqlaydi; restartda yo‘qoladi. Online son noyob foydalanuvchilar emas, connectionlar soni. Frontend reconnect 1 soniyadan boshlanib 15 soniyada cheklanadi va cleanup mavjud. Home/Basic/Full layoutlarda mobil va desktopda bor; adminda yo‘q.

Socket.IO handshake’da yaroqli token olinadi. Backend tekshirgan member ID xonasiga ulaydi; notification faqat receiverga yuboriladi. Notification bazada saqlanadi, frontend event kelganda GraphQLdan oxirgi 30 tasini qayta oladi, READ mutation bilan o‘qilgan deb belgilaydi. Bu brauzer yopiq paytda ishlaydigan Web Push emas.

Support murojaati recipient agent/admin bilan DBda saqlanadi. Muallif o‘z murojaatlarini, recipient o‘z inboxini ko‘radi. Backend recipient holati/rolini va o‘ziga yubormaslikni tekshiradi. Javob faqat receiverga va OPEN murojaatga ruxsat etilgan. Inquiry/reply notification yaratadi. Inboxning o‘zi socket eventda refetch qilinmaydi: qo‘ng‘iroqcha yangilanishi ochiq inbox avtomatik yangilanishini anglatmaydi.

## 7. Aniqlangan muammolar va ustuvorlik

### P1 — chatda shaxsiy member maydonlari hammaga tarqaladi

`backend/components/auth/auth.service.ts:99–106`dagi `verifyToken()` DB memberini `.lean()` bilan oladi, public projection yo‘q. TypeScript `AuthenticatedMember` interfeysi maydonlarni runtime’da olib tashlamaydi. `backend/socket/socket.gateway.ts:52–100` shu obyektni join/leave/message va tarixda `memberData` sifatida barcha connectionlarga yuboradi. Modelda telefon va manzil bor. Password `select:false` bilan yashirilgan — parol tarqaladi degan dalil yo‘q.

Sun’iy member va mock model bilan haqiqiy AuthService/SocketGateway ishlatildi: broadcastda `memberPhone` va `memberAddress` borligi qayta tasdiqlandi. Haqiqiy foydalanuvchi ma’lumoti ishlatilmadi.

Tuzatish yo‘li: chat uchun `_id`, `memberNick`, `memberImage`dan iborat alohida public obyekt tuzish; barcha event va historyga faqat shuni berish. Raw frame maydonlarini tekshiradigan regression test qo‘shish. Faqat frontendda yashirish yetmaydi.

### P1 — ochiq member query telefon/manzilni egaga qarab ajratmaydi

`backend/components/member/member.resolver.ts:95` optional auth bilan ishlaydi. `member.service.ts:68–94` target memberni oladi va qaytaradi; egasi yoki admin ekaniga qarab private fieldlarni ajratmaydi. `apollo/user/query.ts:77`dagi `GET_MEMBER` telefon va manzilni so‘raydi. Backend DTO ham shu fieldlarni e’lon qiladi.

Shuning uchun member ID ma’lum bo‘lsa mehmon querysi orqali ham shu maydonlar so‘raladigan kod yo‘li mavjud. Kontaktni ommaga chiqarish uchun rozilik modeli ko‘rinmadi. Bu kod asosidagi xulosa; productiondan shaxsiy profil olinmadi. Public profile va own profile kontraktlarini ajratish, kontakt fieldlariga serverda owner/admin tekshiruvi kerak.

### P1 — chatda spam va payload nazorati yetarli emas

`backend/socket/socket.gateway.ts:23`da `@SkipThrottle()`. `handleMessage()` payloadni trim, type, uzunlik yoki per-connection/IP limitisiz broadcast qiladi. Gatewayda Origin allowlist tekshiruvi ham ko‘rinmadi; HTTP CORS raw WS uchun bunday tekshiruv o‘rnini bosmaydi. Frontend inputni trim qiladi, lekin mustaqil clientni cheklamaydi.

String type/uzunlik, message va connection limitlari, mos Origin siyosati va backpressure kerak. Framework/socketning umumiy payload limitlari bo‘lishi mumkin; bu audit ularni cheksiz deb da’vo qilmaydi.

### P2 — chatdagi identity faqat ulanishda tekshiriladi

`retrieveAuthMember()` connectionda ishlaydi; `handleMessage()` `clientMembers`dagi avvalgi memberni ishlatadi. Token muddati tugashi yoki member bloklanishi ochiq socketni avtomatik bekor qilmaydi. Oddiy frontend token yangilanishida qayta ulanadi, ammo server buning bajarilishiga tayanadi. Serverda expiry/revalidation va connectionni bekor qilish mexanizmi kerak. Logout barcha berilgan access JWTlarni darhol bekor qilish mexanizmi ekanini hozirgi koddan aytib bo‘lmaydi.

### P2 — to‘lanmay qolgan order stokni uzoq band qiladi

`backend/components/order/order.service.ts:122–140` order yaratishda stokni kamaytiradi. Cancellation tiklaydi. Order modelida reservation expiry yo‘q; tekshirilgan API/batch kodida PENDING orderlarni vaqt bo‘yicha bekor qiladigan job topilmadi. Oynani yopib ketgan foydalanuvchi reservationi qolishi mumkin.

Biznes muddatini belgilab, muddati tugagan orderni stokni tiklash bilan atomik bekor qilish kerak. Oddiy TTL orqali orderni o‘chirish stokni tiklamaydi.

### P2 — notification unread soni barcha tarixni bildirmaydi

`NotificationBell.tsx:21,94` faqat oxirgi 30 ta yozuvni olib sanaydi; eski WAIT yozuvlar hisobga kirmaydi. Eski yozuvlarni ochish uchun pagination ham yo‘q. Badge `max={29}` umumiy server counteri emas. Alohida unread count query/server aggregation va pagination kerak.

### P2 — notification reconnect oralig‘idagi eventlar avtomatik qayta olinmaydi

`NotificationBell.tsx:48–61` faqat `notification` eventini tinglaydi, har `connect`da refetch yo‘q. Uzilib turganda kelgan yozuvlar yangi event yoki panel ochilguncha ko‘rinmasligi mumkin. Fire-and-forget refetch promise’larida error handler ham yo‘q. Connect/reconnect reconciliation va xatoni boshqarish kerak.

### P2 — dastlabki refreshdagi vaqtinchalik xato reloadgacha mehmon holatini qoldirishi mumkin

`libs/auth/session.ts:83–91` startup promise’ni bir marta yaratib, network xatosini ham guest kabi yutadi. Birinchi urinish muvaffaqiyatsiz bo‘lsa keyingi `getValidAccessToken()` xuddi tugagan promise’ni kutib, tokensiz qaytadi. Cookie mavjud bo‘lsa ham online bo‘lganda avtomatik startup retry yo‘q. Unauthorized guest bilan vaqtinchalik network xatosini ajratish va nazoratli retry kerak.

### P2 — upload transporti va saqlash oqimi bo‘lingan

Uchta Axios uploaderda timeout va 401 retry yo‘q; ularda umumiy upload helper yo‘q. Uploaddan keyingi entity mutation xatosi yoki eski rasmlarni almashtirish uchun frontend/backend oqimida birgalikdagi orphan cleanup ko‘rinmadi. Serverdagi fayl bilan entity bog‘lanishini tekshirish/cleanup va umumiy uploader foydali bo‘ladi. Mutatsiyalarni ko‘r-ko‘rona qayta yuborishdan oldin idempotency hisobga olinadi.

### P3 — deploy va hujjatlar tafovutlari

- `compose.prod.yml`da frontend/backend/Caddy bor, batch yo‘q. Shu Compose’ning o‘zi reyting cronlarini ishga tushirmaydi; batch boshqa joyda ishlayotgan bo‘lishi mumkin, tekshirilmadi.
- `.dockerignore` `Agent-Reach/` va `.agent-reach-venv/`ni chiqarib tashlamaydi. Lokal hajmlari taxminan 5.5 MB va 61 MB; `COPY . .` build stagega ularni ham qo‘shishi mumkin.
- `docs/LIVE_CHAT.md` mobil chat yo‘q deydi, hozirgi layoutlar va test esa mobil chatni saqlaydi.
- Rootdagi umumiy ESLint Python venv ichidagi vendor JSni ham tekshiradi; ilovaga qaratilgan lint toza. Ignore chegaralarini tartibga keltirish kerak.
- `.env.production.example` hali namunaviy domen bilan; lokal `.env.production` esa haqiqiy loyiha domeni bilan. Deploymentda Compose yoki aniq environmentdan foydalanish kerak.
- Public dynamic detail ma’lumotlari client GraphQL orqali keladi. Hozirgi build statik page qobig‘ini yaratadi, `_app`dagi social meta umumiy; har mahsulot uchun alohida preview/SSR ma’lumot integratsiyasi topilmadi. `public`da sitemap ham topilmadi.

## 8. Tashqi UI va ichki kutubxonalar

YouTube iframe `exftKarulWg` videosiga ulangan, lazy loading bor, API key ishlatilmaydi. `hl=ko` qat’iy yozilgan; sahifa tili o‘zgarsa YouTube parametri o‘zgarmaydi. Player va uning tashqi so‘rovlari YouTube tomonidan boshqariladi.

Kakao va email tugmalari faqat `setSocialNotice(true)` qiladi (`pages/account/join.tsx:164–173`). Callback route, OAuth exchange va email kod oqimi frontendda yo‘q. `docs/SOCIAL_AUTH_SETUP.md` va audit hujjati mavjud ish emas, tayyorlash rejasi. U yerdagi provider sozlash topshiriqlari ushbu auditda bajarilmadi.

| Paketlar | Vazifasi | Xulosa |
| --- | --- | --- |
| `next`, `react`, `react-dom` | Pages Router va rendering | Asosiy platforma |
| `@apollo/client`, `graphql` | Query/mutation, cache, reactive state, session query print | Ishlatiladi |
| `apollo-upload-client` | Apollo HTTP/upload link transporti | Oddiy GraphQL so‘rovlari ham undan o‘tadi; olib tashlashdan oldin transport almashtiriladi |
| `axios` | Uchta multipart uploader | Ishlatiladi, Apollo bilan vazifasi qisman takrorlangan |
| `jwt-decode` | Frontendda JWT expiry va subjectni o‘qish | Ishlatiladi, server verifikatsiyasini almashtirmaydi |
| `socket.io-client` | Notification kanali | Chat native WS bo‘lsa ham kerak |
| MUI material/icons, Emotion react/styled | UI va theme styling | Ishlatiladi |
| `sass` | SCSS build | Ishlatiladi |
| `sweetalert2` | Xato, muvaffaqiyat va tasdiq dialoglari | Ishlatiladi |
| TypeScript, `@types/*`, ESLint, eslint-config-next | Type/lint/dev tooling | Build va tekshiruvlar |

`three`, `@types/three` va PetMoments avvalgi topshiriqda olib tashlangan; hozirgi integratsiya ro‘yxatiga kirmaydi. Ishlatilayotgan paketni faqat katta yoki nomi ortiqchadek ko‘ringani uchun o‘chirish tavsiya qilinmaydi.

Til lug‘atlari lokal, tarjima API yo‘q. `NEXT_LOCALE` cookie keyingi tashrif tilini saqlaydi. MUI theme `pet-theme` storage kaliti va `_document`dagi init script bilan uyg‘unlashgan. SweetAlert `title` maydoniga xabarlar qo‘yadi: kelajakda foydalanuvchi/provider matni qo‘shilsa plain-text ko‘rsatish talabini saqlash kerak; bu auditda ekspluatatsiya tasdiqlanmadi.

## 9. Tekshiruvlar va qolgan chegaralar

| Tekshiruv | Natija | Chegara |
| --- | --- | --- |
| `yarn test` | 25/25 | Auth HTTP va chat socketlar mock; live end-to-end emas |
| `yarn typecheck` | O‘tdi | Runtime kontrakt va servis holatini isbotlamaydi |
| `yarn eslint pages libs apollo scss/MaterialTheme next.config.ts` | O‘tdi | Repo tashqarisidagi vendor fayllari kiritilmadi |
| Backend schema bilan frontend hujjatlari validation | 63/63 | Nest schema factory, DBsiz; resolver natija semantikasi sinovdan o‘tmadi |
| Chat private-field broadcast namoyishi | Muammo tasdiqlandi | Haqiqiy classlar, synthetic member, mock DB/socket |
| Production build | Auditdan oldin shu sessiyada o‘tdi | 108 statik sahifa, deploy va haqiqiy provider testi emas |

Hozirgi testlar login/refresh/logout, Apollo retry, chat, responsive hook, i18n va SEOni qamraydi. Checkout/payment/inventory, notification lifecycle, multipart upload, admin role/owner va supportning haqiqiy backend bilan oqimlari uchun frontend testlar yetishmaydi.

Keyingi ishlar tartibi: chat/public-profile private fieldlarini yopish; chat limit va identity nazorati; reservation expiry; notification count/reconnect; session startup retry; upload transport/cleanup; deploy/batch hujjatlarini moslashtirish. Haqiqiy Kakao/email/payment provayderlarini ulash alohida implementatsiya va provider hisoblarini talab qiladi.

## 10. GraphQL operatsiyalarining to‘liq indeksi

Quyidagi ro‘yxat manbadan chiqarildi. Har bir operatsiya uchun uni ishlatadigan joylar ko‘rsatilgan. Uploadlar komponent ichida inline yozilgan va jadvaldan keyin keltirilgan.

| Operatsiya | Turi | Ishlatilgan fayllar |
| --- | --- | --- |
| `UPDATE_PRODUCT_BY_ADMIN` (UpdateProductByAdmin) | mutation | `libs/components/admin/products/ProductList.tsx` |
| `UPDATE_PET_BY_ADMIN` (UpdatePetByAdmin) | mutation | `libs/components/admin/pets/PetList.tsx` |
| `UPDATE_ORDER_STATUS_BY_ADMIN` (UpdateOrderStatusByAdmin) | mutation | `libs/components/admin/orders/OrderList.tsx` |
| `CONFIRM_PAYMENT` (ConfirmPayment) | mutation | `libs/components/admin/orders/OrderList.tsx` |
| `UPDATE_MEMBER_BY_ADMIN` (UpdateMemberByAdmin) | mutation | `libs/components/admin/users/MemberList.tsx` |
| `REMOVE_COMMENT_BY_ADMIN` (RemoveCommentByAdmin) | mutation | `libs/components/admin/comments/CommentList.tsx` |
| `GET_ALL_PRODUCTS_BY_ADMIN` (GetAllProductsByAdmin) | query | `libs/components/admin/products/ProductList.tsx`, `libs/components/admin/overview/Dashboard.tsx` |
| `GET_ALL_PETS_BY_ADMIN` (GetAllPetsByAdmin) | query | `libs/components/admin/pets/PetList.tsx`, `libs/components/admin/overview/Dashboard.tsx` |
| `GET_ALL_ORDERS_BY_ADMIN` (GetAllOrdersByAdmin) | query | `libs/components/admin/orders/OrderList.tsx`, `libs/components/admin/overview/Dashboard.tsx` |
| `GET_PAYMENT_BY_ORDER_BY_ADMIN` (GetPaymentByOrderByAdmin) | query | `libs/components/admin/orders/OrderList.tsx` |
| `GET_ALL_MEMBERS_BY_ADMIN` (GetAllMembersByAdmin) | query | `libs/components/admin/users/MemberList.tsx`, `libs/components/admin/overview/Dashboard.tsx` |
| `GET_ALL_COMMENTS_BY_ADMIN` (GetAllCommentsByAdmin) | query | `libs/components/admin/comments/CommentList.tsx` |
| `CREATE_INQUIRY` (CreateInquiry) | mutation | `libs/components/cs/Inquiry.tsx` |
| `ANSWER_INQUIRY` (AnswerInquiry) | mutation | `libs/components/cs/InquiryInbox.tsx` |
| `READ_NOTIFICATION` (ReadNotification) | mutation | `libs/components/NotificationBell.tsx` |
| `REFRESH_TOKEN` (RefreshToken) | mutation | `libs/auth/session.ts` |
| `LOGOUT` (Logout) | mutation | `libs/auth/session.ts` |
| `SIGN_UP` (Signup) | mutation | `libs/auth/index.ts` |
| `LOGIN` (Login) | mutation | `libs/auth/index.ts` |
| `UPDATE_MEMBER` (UpdateMember) | mutation | `libs/components/mypage/MyProfile.tsx` |
| `SUBSCRIBE` (Subscribe) | mutation | `libs/components/mypage/MyFollows.tsx`, `pages/member/detail.tsx` |
| `UNSUBSCRIBE` (Unsubscribe) | mutation | `libs/components/mypage/MyFollows.tsx`, `pages/member/detail.tsx` |
| `ADD_TO_CART` (AddToCart) | mutation | `pages/product/detail.tsx` |
| `UPDATE_CART_ITEM` (UpdateCartItem) | mutation | `pages/cart/index.tsx` |
| `REMOVE_CART_ITEM` (RemoveCartItem) | mutation | `pages/cart/index.tsx` |
| `CLEAR_CART` (ClearCart) | mutation | `pages/cart/index.tsx` |
| `CREATE_PRODUCT` (CreateProduct) | mutation | `libs/components/product/CreateProduct.tsx` |
| `UPDATE_PRODUCT` (UpdateProduct) | mutation | `libs/components/product/CreateProduct.tsx`, `libs/components/mypage/MyProducts.tsx` |
| `REMOVE_PRODUCT` (RemoveProduct) | mutation | `libs/components/mypage/MyProducts.tsx` |
| `LIKE_TARGET_PRODUCT` (LikeTargetProduct) | mutation | `libs/components/homepage/BestSellers.tsx`, `libs/components/mypage/RecentlyVisited.tsx`, `libs/components/mypage/MyFavorites.tsx`, `pages/member/detail.tsx`, `pages/product/index.tsx`, `pages/product/detail.tsx` |
| `LIKE_TARGET_PET` (LikeTargetPet) | mutation | `libs/components/mypage/MyFavorites.tsx`, `pages/pet/detail.tsx` |
| `CREATE_PET` (CreatePet) | mutation | `libs/components/pet/CreatePet.tsx` |
| `UPDATE_PET` (UpdatePet) | mutation | `libs/components/mypage/MyPets.tsx`, `libs/components/pet/CreatePet.tsx` |
| `CREATE_COMMENT` (CreateComment) | mutation | `libs/components/product/ProductReviews.tsx`, `libs/components/pet/PetComments.tsx` |
| `UPDATE_COMMENT` (UpdateComment) | mutation | `libs/components/pet/PetComments.tsx` |
| `CREATE_ORDER` (CreateOrder) | mutation | `pages/checkout/index.tsx` |
| `CANCEL_ORDER` (CancelOrder) | mutation | `libs/components/mypage/MyOrders.tsx`, `pages/order/detail.tsx` |
| `CREATE_PAYMENT` (CreatePayment) | mutation | `pages/checkout/index.tsx` |
| `GET_SUPPORT_RECIPIENTS` (GetSupportRecipients) | query | `libs/components/cs/Inquiry.tsx` |
| `GET_MY_INQUIRIES` (GetMyInquiries) | query | `libs/components/cs/MyInquiries.tsx` |
| `GET_ASSIGNED_INQUIRIES` (GetAssignedInquiries) | query | `libs/components/cs/InquiryInbox.tsx` |
| `GET_MY_NOTIFICATIONS` (GetMyNotifications) | query | `libs/components/NotificationBell.tsx` |
| `GET_AGENTS` (GetAgents) | query | `pages/agent/index.tsx` |
| `GET_MEMBER` (GetMember) | query | `libs/components/layout/LayoutAdmin.tsx`, `libs/components/product/CreateProduct.tsx`, `libs/components/mypage/MyProfile.tsx`, `libs/components/mypage/MyMenu.tsx`, `pages/cs/index.tsx`, `pages/member/detail.tsx`, `pages/product/detail.tsx`, `pages/checkout/index.tsx` |
| `GET_MEMBER_FOLLOWERS` (GetMemberFollowers) | query | `libs/components/mypage/MyFollows.tsx` |
| `GET_MEMBER_FOLLOWINGS` (GetMemberFollowings) | query | `libs/components/mypage/MyFollows.tsx` |
| `GET_PRODUCT` (GetProduct) | query | `libs/components/product/CreateProduct.tsx`, `pages/product/detail.tsx` |
| `GET_PRODUCTS` (GetProducts) | query | `libs/components/homepage/BestSellers.tsx`, `pages/member/detail.tsx`, `pages/product/index.tsx`, `pages/product/detail.tsx` |
| `GET_FAVORITE_PRODUCTS` (GetFavoriteProducts) | query | `libs/components/mypage/MyFavorites.tsx` |
| `GET_VISITED_PRODUCTS` (GetVisitedProducts) | query | `libs/components/mypage/RecentlyVisited.tsx` |
| `GET_MY_PRODUCTS` (GetMyProducts) | query | `libs/components/mypage/MyProducts.tsx` |
| `GET_PETS` (GetPets) | query | `libs/components/homepage/CommunityPets.tsx`, `pages/member/detail.tsx`, `pages/pet/index.tsx` |
| `GET_PET` (GetPet) | query | `libs/components/pet/CreatePet.tsx`, `pages/pet/detail.tsx` |
| `GET_MY_PETS` (GetMyPets) | query | `libs/components/mypage/MyPets.tsx` |
| `GET_FAVORITE_PETS` (GetFavoritePets) | query | `libs/components/mypage/MyFavorites.tsx` |
| `GET_VISITED_PETS` (GetVisitedPets) | query | `libs/components/mypage/RecentlyVisited.tsx` |
| `GET_COMMENTS` (GetComments) | query | `libs/components/product/ProductReviews.tsx`, `libs/components/pet/PetComments.tsx` |
| `GET_MY_CART` (GetMyCart) | query | `libs/components/Top.tsx`, `pages/checkout/index.tsx`, `pages/cart/index.tsx` |
| `GET_ORDER` (GetOrder) | query | `pages/order/detail.tsx` |
| `GET_MY_ORDERS` (GetMyOrders) | query | `libs/components/mypage/MyOrders.tsx` |

Inline upload hujjatlari:

- `ImageUploader` — `libs/components/mypage/MyProfile.tsx`, bitta `Upload!`, target `member`.
- `ImagesUploader` — `libs/components/pet/CreatePet.tsx`, `[Upload!]!`, target `pet`.
- `ImagesUploader` — `libs/components/product/CreateProduct.tsx`, `[Upload!]!`, target `products`.

Markaziy hujjatlar: 28 query + 32 mutation = 60. Inline upload bilan jami 63.
