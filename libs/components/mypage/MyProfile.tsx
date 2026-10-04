import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import axios from 'axios';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
	Alert,
	Avatar,
	Box,
	Button,
	CircularProgress,
	Stack,
	TextField,
	Typography,
} from '@mui/material';

import { userVar } from '../../../apollo/store';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { GET_MEMBER } from '../../../apollo/user/query';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { REACT_APP_API_GRAPHQL_URL, REACT_APP_API_URL } from '../../config';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { Member } from '../../types/member/member';
import { MemberUpdateInput } from '../../types/member/member.update';

const initialMemberUpdate: MemberUpdateInput = {
	memberFullName: '',
	memberImage: '',
	memberAddress: '',
	memberDesc: '',
};

const MyProfile = () => {
	/** STATES **/
	const [member, setMember] = useState<Member | null>(null);
	const [memberUpdate, setMemberUpdate] = useState<MemberUpdateInput>(initialMemberUpdate);
	const [imageUploaderLoading, setImageUploaderLoading] = useState(false);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [updateMember, { loading: updateMemberLoading }] = useMutation(UPDATE_MEMBER);
	const {
		loading: getMemberLoading,
		error: getMemberError,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId: user?.sub ?? '' },
		skip: !user?.sub,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getMember) {
				setMember(data.getMember);
				setMemberUpdate({
					memberFullName: data.getMember.memberFullName ?? '',
					memberImage: data.getMember.memberImage ?? '',
					memberAddress: data.getMember.memberAddress ?? '',
					memberDesc: data.getMember.memberDesc ?? '',
				});
			}
		},
	});

	/** HANDLERS **/
	const inputChangeHandler = (name: keyof MemberUpdateInput, value: string) => {
		setMemberUpdate((prev) => ({ ...prev, [name]: value }));
	};

	const uploadImageHandler = async (event: ChangeEvent<HTMLInputElement>) => {
		try {
			const image = event.target.files?.[0];
			if (!image) return;
			const token = getJwtToken();
			if (!token) throw new Error(Message.NOT_AUTHENTICATED);

			setImageUploaderLoading(true);
			const formData = new FormData();
			formData.append('operations', JSON.stringify({
				query: `mutation ImageUploader($file: Upload!, $target: String!) {
					imageUploader(file: $file, target: $target)
				}`,
				variables: {
					file: null,
					target: 'member',
				},
			}));
			formData.append('map', JSON.stringify({
				'0': ['variables.file'],
			}));
			formData.append('0', image);

			const response = await axios.post(REACT_APP_API_GRAPHQL_URL, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});
			const responseImage = response.data?.data?.imageUploader;
			if (!responseImage) {
				throw new Error(response.data?.errors?.[0]?.message ?? Message.SOMETHING_WENT_WRONG);
			}

			setMemberUpdate((prev) => ({ ...prev, memberImage: responseImage }));
			await sweetTopSmallSuccessAlert('Profile image uploaded', 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		} finally {
			setImageUploaderLoading(false);
		}
	};

	const updateMemberHandler = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			const input: MemberUpdateInput = {
				...memberUpdate,
				memberFullName: memberUpdate.memberFullName?.trim() || undefined,
			};
			const result = await updateMember({ variables: { input } });
			const data = result.data as T | null | undefined;
			if (!data?.updateMember) throw new Error(Message.SOMETHING_WENT_WRONG);

			setMember(data.updateMember);
			if (data.updateMember.accessToken) {
				updateStorage({ jwtToken: data.updateMember.accessToken });
				updateUserInfo(data.updateMember.accessToken);
			}
			await sweetTopSmallSuccessAlert('Profile updated successfully', 800);
		} catch (err) {
			const message = err instanceof Error ? err.message : Message.SOMETHING_WENT_WRONG;
			await sweetMixinErrorAlert(message);
		}
	};

	/** COMPUTED VALUES **/
	const imagePath = memberUpdate.memberImage
		? `${REACT_APP_API_URL}/${memberUpdate.memberImage}`
		: '';
	const fullNameLength = memberUpdate.memberFullName?.trim().length ?? 0;
	const isUpdateDisabled = updateMemberLoading
		|| imageUploaderLoading
		|| (fullNameLength > 0 && fullNameLength < 2);

	if (getMemberLoading && !member) {
		return (
			<Stack className="my-profile__state">
				<CircularProgress color="primary" />
			</Stack>
		);
	}

	if (getMemberError || !member) {
		return <Alert severity="error">Profile information could not be loaded.</Alert>;
	}

	/** RENDER **/
	return (
		<Box className="my-profile">
			<Box className="my-profile__heading">
				<Typography component="h1">My Profile</Typography>
				<Typography>Keep your delivery and account information up to date.</Typography>
			</Box>

			<Stack component="form" className="profile-form" onSubmit={updateMemberHandler}>
				<Stack direction="row" className="profile-photo">
					<Avatar src={imagePath} alt={member.memberNick}>
						<PetsRoundedIcon />
					</Avatar>
					<Box>
						<Typography component="strong">Profile photo</Typography>
						<Typography>JPG, JPEG or PNG image.</Typography>
						<Button
							component="label"
							variant="outlined"
							startIcon={<CloudUploadOutlinedIcon />}
							disabled={imageUploaderLoading}
						>
							{imageUploaderLoading ? 'Uploading...' : 'Upload image'}
							<Box
								component="input"
								className="profile-photo__input"
								type="file"
								accept="image/jpeg,image/png"
								onChange={uploadImageHandler}
							/>
						</Button>
					</Box>
				</Stack>

				<Box className="profile-fields">
					<TextField label="Nickname" value={member.memberNick} disabled fullWidth />
					<TextField label="Phone number" value={member.memberPhone} disabled fullWidth />
					<TextField
						label="Full name"
						value={memberUpdate.memberFullName}
						onChange={(event) => inputChangeHandler('memberFullName', event.target.value)}
						slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }}
						fullWidth
					/>
					<TextField
						label="Address"
						value={memberUpdate.memberAddress}
						onChange={(event) => inputChangeHandler('memberAddress', event.target.value)}
						fullWidth
					/>
					<TextField
						className="profile-fields__wide"
						label="About me"
						value={memberUpdate.memberDesc}
						onChange={(event) => inputChangeHandler('memberDesc', event.target.value)}
						multiline
						rows={4}
						fullWidth
					/>
				</Box>

				<Button
					type="submit"
					variant="contained"
					startIcon={<SaveOutlinedIcon />}
					disabled={isUpdateDisabled}
				>
					{updateMemberLoading ? 'Saving...' : 'Save changes'}
				</Button>
			</Stack>
		</Box>
	);
};

export default MyProfile;
