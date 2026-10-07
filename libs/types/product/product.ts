import { ProductCategory, ProductStatus, ProductType } from '../../enums/product.enum';

export interface ProductVariant {
	sku: string;
	color?: string;
	size?: string;
	price: number;
	stock: number;
}

export interface Product {
	_id: string;
	memberId: string;
	productCategory: ProductCategory;
	productType: ProductType;
	productStatus: ProductStatus;
	productName: string;
	productDesc?: string;
	productImages: string[];
	productVariants: ProductVariant[];
	productRating: number;
	productReviews: number;
	productSold: number;
	productRank: number;
	productLikes?: number;
	productViews?: number;
	meLiked?: { memberId: string; likeRefId: string; myFavorite: boolean }[];
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface TotalCounter {
	total: number;
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
