import { ChangeEvent, FormEvent, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../../apollo/store';
import { CREATE_PET } from '../../../apollo/user/mutation';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_GRAPHQL_URL } from '../../config';
import { Message } from '../../enums/common.enum';
import { PetGender, PetListingType, PetLocation, PetType } from '../../enums/pet.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { PetInput } from '../../types/pet/pet.input';

interface PetFormData {
	petType: string;
	petListingType: string;
	petLocation: string;
	petTitle: string;
	petName: string;
	petBreed: string;
	petGender: string;
	petAgeMonths: string;
	petPrice: string;
	petDesc: string;
}

const initialPetData: PetFormData = {
	petType: PetType.DOG,
	petListingType: PetListingType.ADOPTION,
	petLocation: PetLocation.SEOUL,
	petTitle: '',
	petName: '',
	petBreed: '',
	petGender: PetGender.UNKNOWN,
	petAgeMonths: '',
	petPrice: '',
	petDesc: '',
};

const CreatePet = () => {
	const router = useRouter();

	/** STATES **/
	const [petData, setPetData] = useState<PetFormData>(initialPetData);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [uploadLoading, setUploadLoading] = useState(false);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createPet, { loading: createPetLoading }] = useMutation(CREATE_PET);

	/** HANDLERS **/
	const inputChangeHandler = (name: keyof PetFormData, value: string) => {
		setPetData((previous) => ({ ...previous, [name]: value }));
	};

	const imageChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';

		if (files.length > 10) {
			await sweetMixinErrorAlert('You can upload up to 10 images.');
			return;
		}
		if (files.some((file) => !['image/jpeg', 'image/png'].includes(file.type))) {
			await sweetMixinErrorAlert('Please choose JPG, JPEG, or PNG images.');
			return;
		}

		setSelectedFiles(files);
	};

	const uploadImagesHandler = async (token: string): Promise<string[]> => {
		const formData = new FormData();
		const files = selectedFiles.map(() => null);
		const fileMap = Object.fromEntries(selectedFiles.map((_file, index) => [
			String(index), [`variables.files.${index}`],
		]));

		formData.append('operations', JSON.stringify({
			query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
				imagesUploader(files: $files, target: $target)
			}`,
			variables: { files, target: 'pet' },
		}));
		formData.append('map', JSON.stringify(fileMap));
		selectedFiles.forEach((file, index) => formData.append(String(index), file));

		const response = await axios.post(REACT_APP_API_GRAPHQL_URL, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				'apollo-require-preflight': true,
				Authorization: `Bearer ${token}`,
			},
		});

		const uploadedImages = response.data?.data?.imagesUploader as string[] | undefined;
		if (!uploadedImages?.length) {
			throw new Error(response.data?.errors?.[0]?.message ?? Message.SOMETHING_WENT_WRONG);
		}
		return uploadedImages;
	};

	const createPetHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const token = getJwtToken();
			if (!token || !user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (!selectedFiles.length) throw new Error('Please add at least one pet image.');

			setUploadLoading(true);
			const petImages = await uploadImagesHandler(token);
			const input: PetInput = {
				petType: petData.petType as PetType,
				petListingType: petData.petListingType as PetListingType,
				petLocation: petData.petLocation as PetLocation,
				petTitle: petData.petTitle.trim(),
				petName: petData.petName.trim(),
				petBreed: petData.petBreed.trim() || undefined,
				petGender: petData.petGender as PetGender,
				petAgeMonths: petData.petAgeMonths ? Number(petData.petAgeMonths) : undefined,
				petPrice: petData.petListingType === PetListingType.ADOPTION ? 0 : Number(petData.petPrice),
				petImages,
				petDesc: petData.petDesc.trim() || undefined,
			};

			const result = await createPet({ variables: { input } });
			const data = result.data as T | null | undefined;
			if (!data?.createPet?._id) throw new Error(Message.SOMETHING_WENT_WRONG);

			await sweetTopSmallSuccessAlert('Pet listing created', 800);
			await router.push({ pathname: '/pet/detail', query: { id: data.createPet._id } });
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.errors?.[0]?.message ?? error.message
				: error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		} finally {
			setUploadLoading(false);
		}
	};

	/** COMPUTED VALUES **/
	const isSale = petData.petListingType === PetListingType.SALE;
	const isSubmitDisabled = createPetLoading || uploadLoading || !petData.petName.trim()
		|| petData.petTitle.trim().length < 3 || !selectedFiles.length
		|| (isSale && (!petData.petPrice || Number(petData.petPrice) <= 0));

	/** RENDER **/
	return (
		<Box component="main" className="pet-create-page container">
			<Stack className="pet-create-page__heading">
				<Typography>COMMUNITY</Typography>
				<Typography component="h1">Create a pet listing</Typography>
				<Typography>Share your pet with people looking to adopt or welcome a new companion.</Typography>
			</Stack>

			{!user?.sub && (
				<Alert severity="info" className="pet-create-page__auth">
					Please <Link href="/account/join?referrer=/pet/create">sign in</Link> to publish this listing.
				</Alert>
			)}

			<Stack component="form" className="pet-create-form" onSubmit={createPetHandler}>
				<Stack direction="row" className="pet-create-form__section-heading">
					<PetsRoundedIcon />
					<Typography component="h2">Pet information</Typography>
				</Stack>
				<Stack className="pet-create-form__grid">
					<TextField
						select
						label="Pet type"
						value={petData.petType}
						onChange={(event) => inputChangeHandler('petType', event.target.value)}
					>
						{Object.values(PetType).map((value) => (
							<MenuItem value={value} key={value}>{value}</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="Listing type"
						value={petData.petListingType}
						onChange={(event) => inputChangeHandler('petListingType', event.target.value)}
					>
						<MenuItem value={PetListingType.ADOPTION}>Adoption</MenuItem>
						<MenuItem value={PetListingType.SALE}>For sale</MenuItem>
					</TextField>
					<TextField
						label="Pet name"
						value={petData.petName}
						onChange={(event) => inputChangeHandler('petName', event.target.value)}
						required
						inputProps={{ maxLength: 50 }}
					/>
					<TextField
						label="Listing title"
						value={petData.petTitle}
						onChange={(event) => inputChangeHandler('petTitle', event.target.value)}
						required
						inputProps={{ minLength: 3, maxLength: 100 }}
					/>
					<TextField
						label="Breed (optional)"
						value={petData.petBreed}
						onChange={(event) => inputChangeHandler('petBreed', event.target.value)}
					/>
					<TextField
						select
						label="Gender"
						value={petData.petGender}
						onChange={(event) => inputChangeHandler('petGender', event.target.value)}
					>
						{Object.values(PetGender).map((value) => (
							<MenuItem value={value} key={value}>{value}</MenuItem>
						))}
					</TextField>
					<TextField
						select
						label="Location"
						value={petData.petLocation}
						onChange={(event) => inputChangeHandler('petLocation', event.target.value)}
					>
						{Object.values(PetLocation).map((value) => (
							<MenuItem value={value} key={value}>{value}</MenuItem>
						))}
					</TextField>
					<TextField
						label="Age in months (optional)"
						type="number"
						value={petData.petAgeMonths}
						onChange={(event) => inputChangeHandler('petAgeMonths', event.target.value)}
						inputProps={{ min: 0, step: 1 }}
					/>
					{isSale && (
						<TextField
							label="Price (₩)"
							type="number"
							value={petData.petPrice}
							onChange={(event) => inputChangeHandler('petPrice', event.target.value)}
							required
							inputProps={{ min: 1, step: 1000 }}
						/>
					)}
				</Stack>

				<TextField
					label="Description (optional)"
					value={petData.petDesc}
					onChange={(event) => inputChangeHandler('petDesc', event.target.value)}
					multiline
					minRows={5}
					className="pet-create-form__description"
				/>

				<Stack className="pet-create-form__images">
					<Typography component="strong">Pet photos</Typography>
					<Typography>Upload up to 10 JPG or PNG images. Add at least one photo.</Typography>
					<Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
						Choose images
						<input hidden type="file" accept="image/jpeg,image/png" multiple onChange={imageChangeHandler} />
					</Button>
					{selectedFiles.length > 0 && (
						<Typography className="pet-create-form__file-count">
							{selectedFiles.length} image{selectedFiles.length === 1 ? '' : 's'} selected: {selectedFiles.map((file) => file.name).join(', ')}
						</Typography>
					)}
				</Stack>

				<Stack direction="row" className="pet-create-form__actions">
					<Button component={Link} href="/pet" variant="outlined">Cancel</Button>
					<Button type="submit" variant="contained" disabled={isSubmitDisabled}>
						{uploadLoading ? 'Uploading images...' : createPetLoading ? 'Publishing...' : 'Publish listing'}
					</Button>
				</Stack>
			</Stack>
		</Box>
	);
};

export default CreatePet;
