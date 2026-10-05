import { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Button, CircularProgress, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';

import { UPDATE_MEMBER_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../../apollo/admin/query';
import { userVar } from '../../../../apollo/store';
import { REACT_APP_API_URL } from '../../../config';
import { Direction, Message } from '../../../enums/common.enum';
import { MemberStatus, MemberType } from '../../../enums/member.enum';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';
import { Member } from '../../../types/member/member';
import { MembersInquiry } from '../../../types/member/member.input';

const initialInquiry: MembersInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const MemberList = () => {
	/** STATES **/
	const [inquiry, setInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [total, setTotal] = useState(0);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const [updateMemberByAdmin, { loading: updateMemberLoading }] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const {
		loading: getAllMembersByAdminLoading,
		error: getAllMembersByAdminError,
		refetch: getAllMembersByAdminRefetch,
	} = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMembers(data?.getAllMembersByAdmin?.list ?? []);
			setTotal(data?.getAllMembersByAdmin?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const statusFilterHandler = (value: string) => {
		setInquiry({ ...inquiry, page: 1, search: { memberStatus: value ? value as MemberStatus : undefined } });
	};

	const updateMemberHandler = async (member: Member, changes: { memberStatus?: MemberStatus; memberType?: MemberType }) => {
		try {
			const target = changes.memberStatus ?? changes.memberType;
			if (!await sweetConfirmAlert(`Change ${member.memberNick} to ${target}?`)) return;
			await updateMemberByAdmin({ variables: { input: { _id: member._id, ...changes } } });
			await getAllMembersByAdminRefetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Member updated', 800);
		} catch (error) {
			await sweetMixinErrorAlert(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG);
		}
	};

	/** COMPUTED VALUES **/
	const totalPages = Math.ceil(total / inquiry.limit);

	return (
		<Stack className="admin-list">
			<Stack direction="row" className="admin-list__heading">
				<Stack><Typography component="h1">Members</Typography><Typography>Manage access and seller roles.</Typography></Stack>
				<TextField select size="small" label="Status" value={inquiry.search.memberStatus ?? ''} onChange={(event) => statusFilterHandler(event.target.value)}>
					<MenuItem value="">All</MenuItem>
					{Object.values(MemberStatus).map((status) => <MenuItem value={status} key={status}>{status}</MenuItem>)}
				</TextField>
			</Stack>
			{getAllMembersByAdminError ? <Alert severity="error">Members could not be loaded.</Alert> : getAllMembersByAdminLoading && !members.length ? <CircularProgress /> : members.length ? (
				<>
					<Stack className="admin-list__items">
						{members.map((member) => (
							<Stack direction="row" className="admin-list__item" key={member._id}>
								<Avatar src={member.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined} alt={member.memberNick} />
								<Stack className="admin-list__details">
									<Typography component="strong">{member.memberNick}</Typography>
									<Typography>{member.memberPhone} · {member.memberType}</Typography>
								</Stack>
								<Typography className={`admin-list__status admin-list__status--${member.memberStatus.toLowerCase()}`}>{member.memberStatus}</Typography>
								{member.memberType !== MemberType.ADMIN && member._id !== user?.sub && member.memberStatus !== MemberStatus.DELETE && (
									<Stack direction="row" className="admin-list__actions">
										{member.memberStatus === MemberStatus.ACTIVE && <Button className={`admin-action admin-action--${member.memberType === MemberType.USER ? 'purple' : 'blue'}`} disabled={updateMemberLoading} onClick={() => updateMemberHandler(member, { memberType: member.memberType === MemberType.USER ? MemberType.AGENT : MemberType.USER })}>{member.memberType === MemberType.USER ? 'Make agent' : 'Make user'}</Button>}
										<Button className={`admin-action admin-action--${member.memberStatus === MemberStatus.ACTIVE ? 'danger' : 'positive'}`} disabled={updateMemberLoading} onClick={() => updateMemberHandler(member, { memberStatus: member.memberStatus === MemberStatus.ACTIVE ? MemberStatus.BLOCK : MemberStatus.ACTIVE })}>{member.memberStatus === MemberStatus.ACTIVE ? 'Block' : 'Unblock'}</Button>
									</Stack>
								)}
							</Stack>
						))}
					</Stack>
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</>
			) : <Typography>No members found.</Typography>}
		</Stack>
	);
};

export default MemberList;
