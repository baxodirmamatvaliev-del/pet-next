import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import { Alert, Box, Button, CircularProgress, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../../apollo/store';
import { CREATE_PET, UPDATE_PET } from '../../../apollo/user/mutation';
import { GET_PET } from '../../../apollo/user/query';
import { getValidAccessToken } from '../../auth';
import { REACT_APP_API_GRAPHQL_URL, REACT_APP_API_URL } from '../../config';
import { Message } from '../../enums/common.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PetGender, PetListingType, PetLocation, PetType } from '../../enums/pet.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Pet } from '../../types/pet/pet';
import { PetInput, PetUpdateInput } from '../../types/pet/pet.input';
import { useTranslation } from '../../i18n';

interface CreatePetProps {
	mode?: 'create' | 'edit';
}

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

const CreatePet = (props: CreatePetProps) => {
	const { t, label, errorText } = useTranslation();
	const { mode = 'create' } = props;
	const router = useRouter();
	const device = useDeviceDetect();
	const isEdit = mode === 'edit';
	const petId = typeof router.query.id === 'string' ? router.query.id : '';

	/** STATES **/
	const [petData, setPetData] = useState<PetFormData>(initialPetData);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [currentPet, setCurrentPet] = useState<Pet | null>(null);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [createPet, { loading: createPetLoading }] = useMutation(CREATE_PET);
	const [updatePet, { loading: updatePetLoading }] = useMutation(UPDATE_PET);
	const {
		loading: getPetLoading,
		error: getPetError,
	} = useQuery(GET_PET, {
		fetchPolicy: 'network-only',
		variables: { petId },
		skip: !isEdit || !petId,
		onCompleted: (data: T) => {
			const pet = data?.getPet;
			if (!pet) return;

			setCurrentPet(pet);
			setPetData({
				petType: pet.petType,
				petListingType: pet.petListingType,
				petLocation: pet.petLocation,
				petTitle: pet.petTitle,
				petName: pet.petName,
				petBreed: pet.petBreed ?? '',
				petGender: pet.petGender ?? PetGender.UNKNOWN,
				petAgeMonths: pet.petAgeMonths == null ? '' : String(pet.petAgeMonths),
				petPrice: pet.petPrice == null ? '' : String(pet.petPrice),
				petDesc: pet.petDesc ?? '',
			});
		},
	});

	/** LIFECYCLES **/
	useEffect(() => () => {
		imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
	}, [imagePreviews]);

	/** HANDLERS **/
	const inputChangeHandler = (name: keyof PetFormData, value: string) => {
		setPetData((previous) => ({ ...previous, [name]: value }));
	};

	const imageChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';

		if (files.length > 10) {
			await sweetMixinErrorAlert(t('ui.youCanUploadUpTo10Images'));
			return;
		}
		if (files.some((file) => !['image/jpeg', 'image/png'].includes(file.type))) {
			await sweetMixinErrorAlert(t('ui.pleaseChooseJpgJpegOrPngImages'));
			return;
		}

		setSelectedFiles(files);
		setImagePreviews(files.map((file) => URL.createObjectURL(file)));
	};

	const removeImageHandler = (index: number) => {
		const files = selectedFiles.filter((_file, fileIndex) => fileIndex !== index);
		setSelectedFiles(files);
		setImagePreviews(files.map((file) => URL.createObjectURL(file)));
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

	const submitPetHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const token = await getValidAccessToken();
			if (!token || !user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (isEdit && currentPet?.memberId !== user.sub) throw new Error(t('ui.youCanOnlyEditYourOwnListing'));
			if (!selectedFiles.length && !currentPet?.petImages.length) throw new Error(t('ui.pleaseAddAtLeastOnePetImage'));

			setUploadLoading(true);
			const petImages = selectedFiles.length
				? await uploadImagesHandler(token)
				: currentPet?.petImages ?? [];
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

			const updateInput: PetUpdateInput = { ...input, _id: petId };
			const result = isEdit
				? await updatePet({ variables: { input: updateInput } })
				: await createPet({ variables: { input } });
			const data = result.data as T | null | undefined;
			const savedPet = isEdit ? data?.updatePet : data?.createPet;
			if (!savedPet?._id) throw new Error(Message.SOMETHING_WENT_WRONG);

			await sweetTopSmallSuccessAlert(isEdit ? t('ui.petListingUpdated') : t('ui.petListingCreated'), 800);
			await router.push({ pathname: '/pet/detail', query: { id: savedPet._id } });
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.errors?.[0]?.message ?? error.message
				: error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(errorText(message));
		} finally {
			setUploadLoading(false);
		}
	};

	/** COMPUTED VALUES **/
	const isSale = petData.petListingType === PetListingType.SALE;
	const isSubmitDisabled = createPetLoading || updatePetLoading || uploadLoading || !petData.petName.trim()
		|| petData.petTitle.trim().length < 3 || (!selectedFiles.length && !currentPet?.petImages.length)
		|| (isSale && (!petData.petPrice || Number(petData.petPrice) <= 0));
	const imagePreview = imagePreviews.length > 0 && (
		<Stack className="pet-create-form__previews">
			{imagePreviews.map((preview, index) => (
				<Box className="pet-create-form__preview" key={preview}>
					<Image src={preview} alt={selectedFiles[index].name} width={150} height={150} unoptimized />
					<IconButton aria-label={t('message.removeFile', { name: selectedFiles[index].name })} onClick={() => removeImageHandler(index)}>
						<CloseRoundedIcon fontSize="small" />
					</IconButton>
					<Typography title={selectedFiles[index].name}>
						{index === 0 ? t('ui.cover') : ''}{selectedFiles[index].name}
					</Typography>
				</Box>
			))}
		</Stack>
	);
	const existingImages = isEdit && !imagePreviews.length && currentPet && (
		<Stack className="pet-create-form__previews">
			{currentPet.petImages.map((image, index) => (
				<Box className="pet-create-form__preview" key={image}>
					<Image src={`${REACT_APP_API_URL}/${image}`} alt={`${currentPet.petName} ${index + 1}`} width={150} height={150} unoptimized />
					<Typography>{index === 0 ? t('ui.coverImage') : t('message.imageNumber', { number: index + 1 })}</Typography>
				</Box>
			))}
		</Stack>
	);
	const editState = isEdit && (!petId || getPetError || !currentPet || currentPet.memberId !== user?.sub);

	if (isEdit && (getPetLoading || editState)) {
		return (
			<Box component="main" className={`pet-create-page container${device === 'mobile' ? ' pet-create-page--mobile' : ''}`}>
				{getPetLoading ? <CircularProgress color="primary" /> : (
					<Alert severity={currentPet && currentPet.memberId !== user?.sub ? 'warning' : 'error'}>
						{currentPet && currentPet.memberId !== user?.sub ? t('ui.youCanOnlyEditYourOwnListing') : t('ui.petListingCouldNotBeLoaded')}
					</Alert>
				)}
			</Box>
		);
	}

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Box component="main" className="pet-create-page pet-create-page--mobile container">
			<Stack className="pet-create-page__heading">
					<Typography>{t('nav.community')}</Typography>
					<Typography component="h1">{isEdit ? t('ui.editPetListing') : t('ui.createAPetListing')}</Typography>
					<Typography>{isEdit ? t('ui.updateYourPetListingDetailsAndPhotos') : t('ui.shareYourPetWithPeopleLookingToAdopt')}</Typography>
				</Stack>
				{!user?.sub && (
					<Alert severity="info" className="pet-create-page__auth">
						<Link href={isEdit ? `/account/join?referrer=/pet/edit?id=${petId}` : '/account/join?referrer=/pet/create'}>{t('message.signInListing')}</Link></Alert>
				)}
				<Stack component="form" className="pet-create-form pet-create-form--mobile" onSubmit={submitPetHandler}>
					<Stack direction="row" className="pet-create-form__section-heading">
						<PetsRoundedIcon />
						<Typography component="h2">{t('ui.petInformation')}</Typography>
					</Stack>
					<Stack className="pet-create-form__grid">
						<TextField select label={t('ui.petType')} value={petData.petType} onChange={(event) => inputChangeHandler('petType', event.target.value)}>
							{Object.values(PetType).map((value) => <MenuItem value={value} key={value}>{label(value)}</MenuItem>)}
						</TextField>
						<TextField select label={t('ui.listingType')} value={petData.petListingType} onChange={(event) => inputChangeHandler('petListingType', event.target.value)}>
							<MenuItem value={PetListingType.ADOPTION}>{t('ui.adoption')}</MenuItem>
							<MenuItem value={PetListingType.SALE}>{t('ui.saleListingType')}</MenuItem>
						</TextField>
						<TextField label={t('ui.petName')} value={petData.petName} onChange={(event) => inputChangeHandler('petName', event.target.value)} required inputProps={{ maxLength: 50 }} />
						<TextField label={t('ui.listingTitle')} value={petData.petTitle} onChange={(event) => inputChangeHandler('petTitle', event.target.value)} required inputProps={{ minLength: 3, maxLength: 100 }} />
						<TextField label={t('ui.breedOptional')} value={petData.petBreed} onChange={(event) => inputChangeHandler('petBreed', event.target.value)} />
						<TextField select label={t('ui.gender')} value={petData.petGender} onChange={(event) => inputChangeHandler('petGender', event.target.value)}>
							{Object.values(PetGender).map((value) => <MenuItem value={value} key={value}>{label(value)}</MenuItem>)}
						</TextField>
						<TextField select label={t('ui.location')} value={petData.petLocation} onChange={(event) => inputChangeHandler('petLocation', event.target.value)}>
							{Object.values(PetLocation).map((value) => <MenuItem value={value} key={value}>{label(value)}</MenuItem>)}
						</TextField>
						<TextField label={t('ui.ageInMonthsOptional')} type="number" value={petData.petAgeMonths} onChange={(event) => inputChangeHandler('petAgeMonths', event.target.value)} inputProps={{ min: 0, step: 1 }} />
						{isSale && <TextField label={t('ui.priceWon')} type="number" value={petData.petPrice} onChange={(event) => inputChangeHandler('petPrice', event.target.value)} required inputProps={{ min: 1, step: 1000 }} />}
					</Stack>
					<TextField label={t('ui.descriptionOptional')} value={petData.petDesc} onChange={(event) => inputChangeHandler('petDesc', event.target.value)} multiline minRows={5} className="pet-create-form__description" />
					<Stack className="pet-create-form__images">
						<Typography component="strong">{t('ui.petPhotos')}</Typography>
						<Typography>{isEdit ? t('ui.chooseNewImagesToReplaceTheCurrentPhotos') : t('ui.uploadUpTo10JpgOrPngImages')}</Typography>
						<Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
							{t('ui.chooseImages')}<input hidden type="file" accept="image/jpeg,image/png" multiple onChange={imageChangeHandler} />
						</Button>
						{imagePreview}
						{existingImages}
					</Stack>
					<Stack direction="row" className="pet-create-form__actions">
						<Button component={Link} href={isEdit ? `/pet/detail?id=${petId}` : '/pet'} variant="outlined">{t('ui.cancel')}</Button>
						<Button type="submit" variant="contained" disabled={isSubmitDisabled}>
							{uploadLoading ? t('ui.uploadingImages') : createPetLoading || updatePetLoading ? t('ui.saving') : isEdit ? t('ui.saveChanges') : t('ui.publishListing')}
						</Button>
					</Stack>
				</Stack>
			</Box>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box component="main" className="pet-create-page container">
			<Stack className="pet-create-page__heading">
					<Typography>{t('nav.community')}</Typography>
					<Typography component="h1">{isEdit ? t('ui.editPetListing') : t('ui.createAPetListing')}</Typography>
					<Typography>{isEdit ? t('ui.updateYourPetListingDetailsAndPhotos') : t('ui.shareYourPetWithPeopleLookingToAdopt')}</Typography>
				</Stack>

				{!user?.sub && (
					<Alert severity="info" className="pet-create-page__auth">
						<Link href={isEdit ? `/account/join?referrer=/pet/edit?id=${petId}` : '/account/join?referrer=/pet/create'}>{t('message.signInListing')}</Link></Alert>
				)}

				<Stack component="form" className="pet-create-form" onSubmit={submitPetHandler}>
					<Stack direction="row" className="pet-create-form__section-heading">
						<PetsRoundedIcon />
						<Typography component="h2">{t('ui.petInformation')}</Typography>
					</Stack>
					<Stack className="pet-create-form__grid">
						<TextField
							select
							label={t('ui.petType')}
							value={petData.petType}
							onChange={(event) => inputChangeHandler('petType', event.target.value)}
						>
							{Object.values(PetType).map((value) => (
								<MenuItem value={value} key={value}>{label(value)}</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label={t('ui.listingType')}
							value={petData.petListingType}
							onChange={(event) => inputChangeHandler('petListingType', event.target.value)}
						>
							<MenuItem value={PetListingType.ADOPTION}>{t('ui.adoption')}</MenuItem>
							<MenuItem value={PetListingType.SALE}>{t('ui.saleListingType')}</MenuItem>
						</TextField>
						<TextField
							label={t('ui.petName')}
							value={petData.petName}
							onChange={(event) => inputChangeHandler('petName', event.target.value)}
							required
							inputProps={{ maxLength: 50 }}
						/>
						<TextField
							label={t('ui.listingTitle')}
							value={petData.petTitle}
							onChange={(event) => inputChangeHandler('petTitle', event.target.value)}
							required
							inputProps={{ minLength: 3, maxLength: 100 }}
						/>
						<TextField
							label={t('ui.breedOptional')}
							value={petData.petBreed}
							onChange={(event) => inputChangeHandler('petBreed', event.target.value)}
						/>
						<TextField
							select
							label={t('ui.gender')}
							value={petData.petGender}
							onChange={(event) => inputChangeHandler('petGender', event.target.value)}
						>
							{Object.values(PetGender).map((value) => (
								<MenuItem value={value} key={value}>{label(value)}</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label={t('ui.location')}
							value={petData.petLocation}
							onChange={(event) => inputChangeHandler('petLocation', event.target.value)}
						>
							{Object.values(PetLocation).map((value) => (
								<MenuItem value={value} key={value}>{label(value)}</MenuItem>
							))}
						</TextField>
						<TextField
							label={t('ui.ageInMonthsOptional')}
							type="number"
							value={petData.petAgeMonths}
							onChange={(event) => inputChangeHandler('petAgeMonths', event.target.value)}
							inputProps={{ min: 0, step: 1 }}
						/>
						{isSale && (
							<TextField
								label={t('ui.priceWon')}
								type="number"
								value={petData.petPrice}
								onChange={(event) => inputChangeHandler('petPrice', event.target.value)}
								required
								inputProps={{ min: 1, step: 1000 }}
							/>
						)}
					</Stack>

					<TextField
						label={t('ui.descriptionOptional')}
						value={petData.petDesc}
						onChange={(event) => inputChangeHandler('petDesc', event.target.value)}
						multiline
						minRows={5}
						className="pet-create-form__description"
					/>

					<Stack className="pet-create-form__images">
						<Typography component="strong">{t('ui.petPhotos')}</Typography>
						<Typography>{isEdit ? t('ui.chooseNewImagesToReplaceTheCurrentPhotos') : t('ui.uploadUpTo10JpgOrPngImages')}</Typography>
						<Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
							{t('ui.chooseImages')}<input hidden type="file" accept="image/jpeg,image/png" multiple onChange={imageChangeHandler} />
						</Button>
						{imagePreview}
						{existingImages}
					</Stack>

					<Stack direction="row" className="pet-create-form__actions">
						<Button component={Link} href={isEdit ? `/pet/detail?id=${petId}` : '/pet'} variant="outlined">{t('ui.cancel')}</Button>
						<Button type="submit" variant="contained" disabled={isSubmitDisabled}>
							{uploadLoading ? t('ui.uploadingImages') : createPetLoading || updatePetLoading ? t('ui.saving') : isEdit ? t('ui.saveChanges') : t('ui.publishListing')}
						</Button>
					</Stack>
				</Stack>
			</Box>
		);
	}
};

export default CreatePet;
