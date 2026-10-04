import { Direction } from '../../enums/common.enum';
import { ProductCategory, ProductType } from '../../enums/product.enum';

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
