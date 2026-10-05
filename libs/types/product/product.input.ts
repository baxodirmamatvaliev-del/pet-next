import { Direction } from '../../enums/common.enum';
import { ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';

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

export interface ProductUpdateInput extends Partial<ProductInput> {
	_id: string;
	productStatus?: ProductStatus;
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

export interface MyProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { productStatus?: ProductStatus };
}
