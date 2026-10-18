# Kakao va email — 2/4 sozlash

Holat: foydalanuvchi hozircha faqat UI ko‘rinishini tanladi. KakaoTalk va email tugmalari login/signup formasida bor, ammo backendga ulanmagan; bosilganda tayyorlanayotganini bildiradi. Quyidagi xizmat sozlash yo‘riqnomasi kelajak uchun saqlanadi.

## Tayyorlangan fayllar

Backend `/Users/user/Desktop/pet-nest/.env.example` va `.env` ichiga mavjud sozlamalarni almashtirmasdan quyidagi maydonlar qo‘shildi:

| Kalit | Holat |
| --- | --- |
| `KAKAO_REST_API_KEY` | Bo‘sh; Kakao’dan olinadi |
| `KAKAO_CLIENT_SECRET` | Bo‘sh; Kakao’dan olinadi |
| `KAKAO_REDIRECT_URI` | `http://localhost:3000/account/kakao/callback` |
| `RESEND_API_KEY` | Bo‘sh; Resend tanlansa to‘ldiriladi |
| `EMAIL_FROM` | Bo‘sh; tasdiqlangan yuboruvchi manzili |
| `EMAIL_CODE_SECRET` | Lokal `.env`da 32 random baytdan yaratilgan; example’da bo‘sh |

Haqiqiy kalitlarni chatga yoki `.env.example`ga yozmang. Lokal `.env` Git’dan chiqarilgan. Production muhitida shu kalitlar hosting environment orqali, alohida qiymatlar bilan sozlanadi. Bu maydonlarni auth kodi 3/4 bosqichida ishlatadi; hozir ular kirishni yoqmaydi.

## 1. Kakao ilovasini yarating

1. https://developers.kakao.com/ saytiga Kakao akkauntingiz bilan kiring.
2. Ilovalar boshqaruvida yangi ilova yarating: nomini `PetNest` deb kiriting va talab etilgan hisob ma’lumotlarini to‘ldiring.
3. Ilova ichida **Kakao Login → Enable** bo‘limida holatni **ON** qiling.
4. **App → Platform Key → REST API key → Redirect URI** bo‘limiga aynan quyidagini qo‘shing:

   `http://localhost:3000/account/kakao/callback`

5. Shu REST API key bo‘limidan kalitni backend `.env`dagi `KAKAO_REST_API_KEY`ga yozing. JavaScript key yoki Admin key ishlatmang.
6. Shu bo‘limdagi **Client secret** qiymatini `.env`dagi `KAKAO_CLIENT_SECRET`ga yozing; yoqilgan holatda saqlang.
7. Dastlab email, telefon yoki boshqa qo‘shimcha shaxsiy ma’lumotlarni majburiy so‘ramaymiz. Kakao hisobini uning ID’si bilan aniqlaymiz.

Callback route 3/4 bosqichida yaratiladi; hozir bu URL’ni qo‘lda ochganda 404 chiqishi mumkin. Provayderga ro‘yxatga olish va dasturda amalga oshirish alohida ishlar.

Rasmiy sozlash: https://developers.kakao.com/docs/en/kakaologin/prerequisite

## 2. Email hisobini tayyorlang

Taklif: **Resend**. Boshqa xizmat tanlansa, implementatsiyadan oldin shu bo‘lim yangilanadi. Ushbu bosqichda paket o‘rnatilmadi, pullik tarif yoki domen xarid qilinmadi.

1. https://resend.com/ saytida hisob oching.
2. O‘zingiz boshqaradigan domen bo‘lsa, **Domains** orqali yuboruvchi domen yoki subdomen qo‘shing. Misol: `auth.example.com` — bu o‘ringa haqiqiy domeningiz kerak.
3. Resend ko‘rsatgan DNS yozuvlarini domen provayderingizda kiriting va Resend’da domen **Verified** bo‘lishini kuting. Yozuvlarni taxminiy qiymat bilan kiritmang; dashboard bergan aniq qiymatlardan foydalaning.
4. **API Keys** orqali shu domen uchun **Sending access** ruxsatli kalit yarating; backend `.env`dagi `RESEND_API_KEY`ga yozing.
5. `EMAIL_FROM`ga shu tasdiqlangan domendagi yuboruvchi manzilini kiriting. Misol: `PetNest <login@auth.example.com>` — `.env`da bo‘shliq bo‘lgani uchun butun qiymatni qo‘shtirnoq ichida yozing.
6. `EMAIL_CODE_SECRET` allaqachon yaratilgan; uni `SECRET_TOKEN` yoki provider kaliti bilan almashtirmang.

**Domen hali bo‘lmasa:** ommaviy foydalanuvchilarga email yuborishni tayyor deb hisoblamaymiz. Domenni tanlash/DNS tasdig‘i alohida yakunlanadi; shu vaqt ichida Kakao sozlashni davom ettirish mumkin. Gmail/Outlook manzilini o‘zingizga tegishli tasdiqlangan domen deb ishlatib bo‘lmaydi.

Rasmiy domen yo‘riqnomasi: https://resend.com/docs/dashboard/domains/introduction
Kalit boshqaruvi: https://resend.com/docs/dashboard/api-keys/introduction

## 2/4 tugaganini qanday bilamiz?

- Kakao Login ON, callback ro‘yxatda; backend’da REST key va client secret to‘ldirilgan.
- Email provayder tanlangan; yuboruvchi domen tasdiqlangan va API kaliti tayyor.
- Callback origin frontend manziliga, frontend esa backenddagi ruxsat etilgan originlarga mos. Lokal frontend hozir `http://localhost:3000`; backendda bu default origin sifatida mavjud.
- Maxfiy qiymatlar faqat server muhitida. Qiymatlarni oshkor qilmasdan mavjudlik tekshiriladi.

Hozir haqiqiy Kakao login yoki email yetkazish sinovi o‘tkazilmagan. Ular kalitlar, domen va 3/4 implementatsiyadan keyin tekshiriladi.
