import { Direction } from '../../enums/common.enum';
import { PetListingType, PetLocation, PetType } from '../../enums/pet.enum';

interface PetPriceRange {
	start: number;
	end: number;
}

interface PetSearch {
	memberId?: string;
	typeList?: PetType[];
	locationList?: PetLocation[];
	listingTypeList?: PetListingType[];
	pricesRange?: PetPriceRange;
	text?: string;
}

export interface PetsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PetSearch;
}
