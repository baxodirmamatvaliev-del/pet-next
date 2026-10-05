import { Direction } from '../../enums/common.enum';
import { PetGender, PetListingType, PetLocation, PetStatus, PetType } from '../../enums/pet.enum';

export interface PetInput {
	petType: PetType;
	petListingType: PetListingType;
	petLocation: PetLocation;
	petTitle: string;
	petName: string;
	petBreed?: string;
	petGender?: PetGender;
	petAgeMonths?: number;
	petPrice?: number;
	petImages?: string[];
	petDesc?: string;
}

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

export interface MyPetsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: {
		petStatus?: PetStatus;
	};
}

export interface AdminPetsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: { petStatus?: PetStatus; typeList?: PetType[]; locationList?: PetLocation[] };
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}

export interface PetUpdateInput extends Partial<PetInput> {
	_id: string;
	petStatus?: PetStatus;
}
