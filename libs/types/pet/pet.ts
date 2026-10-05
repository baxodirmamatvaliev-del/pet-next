import { PetGender, PetListingType, PetLocation, PetStatus, PetType } from '../../enums/pet.enum';
import { Member } from '../member/member';
import { TotalCounter } from '../product/product';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface Pet {
	_id: string;
	petType: PetType;
	petListingType: PetListingType;
	petStatus: PetStatus;
	petLocation: PetLocation;
	petTitle: string;
	petName: string;
	petBreed?: string;
	petGender: PetGender;
	petAgeMonths?: number;
	petPrice: number;
	petImages: string[];
	petDesc?: string;
	petViews: number;
	petLikes: number;
	petComments: number;
	petRank: number;
	memberId: string;
	completedAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	meLiked?: MeLiked[];
	memberData?: Member;
}

export interface Pets {
	list: Pet[];
	metaCounter: TotalCounter[];
}
