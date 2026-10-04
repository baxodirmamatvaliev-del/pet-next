import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => (
	<Html lang="en">
		<Head>
			<meta name="robots" content="index,follow" />
			<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
			<meta name="theme-color" content="#174f3f" />

			{/* SEO */}
			<meta
				name="keywords"
				content="PetNest Korea, pet shop Korea, dog supplies, cat supplies, pet accessories, pet food, uy hayvonlari mahsulotlari, товары для животных, 반려동물 용품"
			/>
			<meta
				name="description"
				content={
					'Shop quality products, accessories, food and daily essentials for dogs and cats across South Korea. Everything your pets love at PetNest Korea. | ' +
					'Janubiy Koreya bo‘ylab it va mushuklar uchun sifatli mahsulotlar, aksessuarlar, oziq-ovqat va kundalik ehtiyojlarni xarid qiling. Uy hayvonlaringiz sevgan barcha narsa PetNest Korea’da. | ' +
					'Покупайте качественные товары, аксессуары, корм и всё необходимое для собак и кошек по всей Южной Корее. Всё, что любят ваши питомцы, в PetNest Korea. | ' +
					'대한민국 어디서나 강아지와 고양이를 위한 좋은 품질의 용품, 액세서리, 사료와 필수품을 쇼핑하세요. 반려동물이 좋아하는 모든 것을 PetNest Korea에서 만나보세요.'
				}
			/>
		</Head>
		<body>
			<Main />
			<NextScript />
		</body>
	</Html>
);

export default Document;
