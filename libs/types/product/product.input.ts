import { Direction } from '../../enums/common.enum';
import { ProductCategory, ProductType } from '../../enums/product.enum';

export interface ProductVariantInput {
	sku: string;
	color?: string;
	size?: string;
	price: number;
	stock: number;
}

export interface ProductInput {
	productCategory: ProductCategory;
	productType: ProductType;
	productName: string;
	productDesc?: string;
	productImages: string[];
	productVariants: ProductVariantInput[];
}

export interface ProductUpdateInput extends ProductInput {
	_id: string;
}

interface ProductSearch {
	categoryList?: ProductCategory[];
	typeList?: ProductType[];
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ProductSearch;
}
