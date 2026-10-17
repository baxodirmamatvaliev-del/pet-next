import { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Alert, Avatar, Box, Button, CircularProgress, Pagination, Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { userVar } from '../../apollo/store';
import { LIKE_TARGET_PRODUCT, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_MEMBER, GET_PETS, GET_PRODUCTS } from '../../apollo/user/query';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import MyFollows from '../../libs/components/mypage/MyFollows';
import PetCard from '../../libs/components/pet/PetCard';
import ProductCard from '../../libs/components/product/ProductCard';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberType } from '../../libs/enums/member.enum';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/types/member/member';
import { Pet } from '../../libs/types/pet/pet';
import { PetsInquiry } from '../../libs/types/pet/pet.input';
import { Product } from '../../libs/types/product/product';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { CustomJwtPayload } from '../../libs/types/customJwtPayload';
import { useTranslation } from '../../libs/i18n';

const initialInquiry: PetsInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const initialProductsInquiry: ProductsInquiry = {
	page: 1,
	limit: 6,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const MemberDetailContent = ({ memberId, category }: { memberId: string; category: string }) => {
	const { t, errorText } = useTranslation();
	const device = useDeviceDetect();

	/** STATES **/
	const [member, setMember] = useState<Member | null>(null);
	const [inquiry, setInquiry] = useState<PetsInquiry>({ ...initialInquiry, search: { memberId } });
	const [pets, setPets] = useState<Pet[]>([]);
	const [petTotal, setPetTotal] = useState(0);
	const [productsInquiry, setProductsInquiry] = useState<ProductsInquiry>({ ...initialProductsInquiry, search: { memberId } });
	const [products, setProducts] = useState<Product[]>([]);
	const [productTotal, setProductTotal] = useState(0);
	const [followLoading, setFollowLoading] = useState(false);
	const user = useReactiveVar(userVar);
	const activeCategory = category === 'followers' || category === 'followings' || category === 'products' ? category : 'pets';

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const { error: getMemberError, refetch: getMemberRefetch } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { memberId },
		skip: !memberId,
		onCompleted: (data: T) => setMember(data?.getMember ?? null),
	});
	const { loading: getPetsLoading, error: getPetsError } = useQuery(GET_PETS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: inquiry },
		skip: !memberId || activeCategory !== 'pets',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setPets(data?.getPets?.list ?? []);
			setPetTotal(data?.getPets?.metaCounter[0]?.total ?? 0);
		},
	});
	const { loading: getProductsLoading, error: getProductsError, refetch: getProductsRefetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: productsInquiry },
		skip: !memberId || activeCategory !== 'products',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProducts(data?.getProducts?.list ?? []);
			setProductTotal(data?.getProducts?.metaCounter[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const subscribeHandler = async () => {
		try {
			if (!memberId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (user.sub === memberId) return;

			setFollowLoading(true);
			await subscribe({ variables: { input: { followingId: memberId } } });
			setMember((previous) => previous ? {
				...previous,
				memberFollowers: previous.memberFollowers + 1,
				meFollowed: [{ followerId: user.sub, followingId: memberId, myFollowing: true }],
			} : previous);
			await sweetTopSmallSuccessAlert(t('ui.followed'), 800);
			const result = await getMemberRefetch({ memberId });
			if (result.data?.getMember) setMember(result.data.getMember);
		} catch (error) {
			await sweetMixinErrorAlert(errorText(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG));
		} finally {
			setFollowLoading(false);
		}
	};

	const unsubscribeHandler = async () => {
		try {
			if (!memberId) return;
			if (!user?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			if (user.sub === memberId) return;

			setFollowLoading(true);
			await unsubscribe({ variables: { input: { followingId: memberId } } });
			setMember((previous) => previous ? {
				...previous,
				memberFollowers: Math.max(0, previous.memberFollowers - 1),
				meFollowed: [],
			} : previous);
			await sweetTopSmallSuccessAlert(t('ui.unfollowed'), 800);
			const result = await getMemberRefetch({ memberId });
			if (result.data?.getMember) setMember(result.data.getMember);
		} catch (error) {
			await sweetMixinErrorAlert(errorText(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG));
		} finally {
			setFollowLoading(false);
		}
	};

	const likeProductHandler = async (authUser: CustomJwtPayload | null, productId: string) => {
		try {
			if (!productId) return;
			if (!authUser?.sub) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProduct({ variables: { productId } });
			await getProductsRefetch({ input: productsInquiry });
		} catch (error) {
			await sweetMixinErrorAlert(errorText(error instanceof Error ? error.message : Message.SOMETHING_WENT_WRONG));
		}
	};

	/** COMPUTED VALUES **/
	const memberImage = member?.memberImage ? `${REACT_APP_API_URL}/${member.memberImage}` : undefined;
	const totalPages = Math.ceil(petTotal / inquiry.limit);
	const productTotalPages = Math.ceil(productTotal / productsInquiry.limit);
	const isOwnProfile = user?.sub === memberId;
	const isFollowing = member?.meFollowed?.some((follow) => follow.myFollowing) ?? false;
	const memberContent = (
		<>
			<Stack direction="row" className="member-detail__tabs">
				{(member?.memberType === MemberType.AGENT || member?.memberType === MemberType.ADMIN) && (
					<Button component={Link} href={`/member/detail?id=${memberId}&category=products`} className={activeCategory === 'products' ? 'active' : ''}>{t('ui.products')}</Button>
				)}
				<Button component={Link} href={`/member/detail?id=${memberId}`} className={activeCategory === 'pets' ? 'active' : ''}>{t('ui.petListings')}</Button>
				<Button component={Link} href={`/member/detail?id=${memberId}&category=followers`} className={activeCategory === 'followers' ? 'active' : ''}>{t('ui.followers')}</Button>
				<Button component={Link} href={`/member/detail?id=${memberId}&category=followings`} className={activeCategory === 'followings' ? 'active' : ''}>{t('ui.followings')}</Button>
			</Stack>
			{activeCategory === 'pets' ? (
				<Stack className="member-detail__listings">
					<Typography component="h2">{t('ui.petListings')} <span>({petTotal})</span></Typography>
					{getPetsError ? <Alert severity="error">{t('ui.listingsCouldNotBeLoaded')}</Alert> : getPetsLoading ? <CircularProgress /> : pets.length ? (
						<Box className="member-detail__grid">{pets.map((pet) => <PetCard pet={pet} key={pet._id} />)}</Box>
					) : <Typography>{t('ui.noActivePetListingsYet')}</Typography>}
					{totalPages > 1 && <Pagination page={inquiry.page} count={totalPages} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />}
				</Stack>
			) : activeCategory === 'products' ? (
				<Stack className="member-detail__listings">
					<Typography component="h2">{t('ui.products')} <span>({productTotal})</span></Typography>
					{getProductsError ? <Alert severity="error">{t('ui.productsCouldNotBeLoaded')}</Alert> : getProductsLoading ? <CircularProgress /> : products.length ? (
						<Box className="member-detail__grid">{products.map((product) => <ProductCard product={product} likeTargetProduct={likeProductHandler} key={product._id} />)}</Box>
					) : <Typography>{t('ui.noActiveProductsYet')}</Typography>}
					{productTotalPages > 1 && <Pagination page={productsInquiry.page} count={productTotalPages} onChange={(_event, page) => setProductsInquiry({ ...productsInquiry, page })} />}
				</Stack>
			) : (
				<Box className="member-detail__follows">
					<MyFollows key={`${memberId}-${activeCategory}`} memberId={memberId} category={activeCategory} />
				</Box>
			)}
		</>
	);
	const followButton = isOwnProfile ? null : user?.sub ? isFollowing ? (
		<>
			<Button className="member-detail__unfollow" variant="outlined" onClick={unsubscribeHandler} disabled={followLoading}>{t('ui.unfollow')}</Button>
			<Typography className="member-detail__following">{t('ui.following')}</Typography>
		</>
	) : (
		<Button className="member-detail__follow" variant="contained" onClick={subscribeHandler} disabled={followLoading}>{t('ui.follow')}</Button>
	) : (
		<Button component={Link} href={`/account/join?referrer=${encodeURIComponent(`/member/detail?id=${memberId}`)}`} variant="outlined">
			{t('ui.signInToFollow')}
		</Button>
	);
	const contactButton = member?.memberType === MemberType.AGENT && !isOwnProfile ? (
		<Button component={Link} href={`/cs?tab=ask&recipient=${memberId}`} variant="outlined">{t('ui.contactAgent')}</Button>
	) : null;

	if (!memberId || (member?._id !== memberId && !getMemberError)) {
		return <Stack className="member-detail-state"><CircularProgress /></Stack>;
	}

	if (getMemberError || !member || member._id !== memberId) {
		return <Box className="member-detail-state container"><Alert severity="error">{t('ui.memberProfileCouldNotBeLoaded')}</Alert></Box>;
	}

	/** RENDER MOBILE **/
	if (device === 'mobile') {
		return (
			<>
				<Head><title>{member.memberNick} | PetNest Korea</title></Head>
				<Box component="main" className="member-detail-page member-detail-page--mobile container">
					<Typography className="member-detail-page__breadcrumb"><Link href="/pet">{t('nav.community')}</Link> / {member.memberNick}</Typography>
					<Stack className="member-detail__profile">
						<Avatar src={memberImage} alt={member.memberNick} />
						<Stack className="member-detail__intro">
							<Typography component="h1">{member.memberNick}</Typography>
							<Typography>{member.memberDesc || t('common.communityMember')}</Typography>
							<Stack direction="row" className="member-detail__social">
								<Typography component={Link} href={`/member/detail?id=${memberId}&category=followers`}>{t('counts.followers', { count: member.memberFollowers })}</Typography>
								<Typography component={Link} href={`/member/detail?id=${memberId}&category=followings`}>{t('counts.followings', { count: member.memberFollowings })}</Typography>
								{followButton}
								{contactButton}
							</Stack>
						</Stack>
					</Stack>
					{memberContent}
				</Box>
			</>
		);
	} else {
		/** RENDER PC **/
		return (
			<>
				<Head><title>{member.memberNick} | PetNest Korea</title></Head>
				<Box component="main" className="member-detail-page container">
					<Typography className="member-detail-page__breadcrumb"><Link href="/pet">{t('nav.community')}</Link> / {member.memberNick}</Typography>
					<Stack direction="row" className="member-detail__profile">
						<Avatar src={memberImage} alt={member.memberNick} />
						<Stack className="member-detail__intro">
							<Typography component="h1">{member.memberNick}</Typography>
							<Typography>{member.memberDesc || t('common.communityMember')}</Typography>
							<Stack direction="row" className="member-detail__social">
								<Typography component={Link} href={`/member/detail?id=${memberId}&category=followers`}>{t('counts.followers', { count: member.memberFollowers })}</Typography>
								<Typography component={Link} href={`/member/detail?id=${memberId}&category=followings`}>{t('counts.followings', { count: member.memberFollowings })}</Typography>
								{followButton}
								{contactButton}
							</Stack>
						</Stack>
					</Stack>
					{memberContent}
				</Box>
			</>
		);
	}
};

const MemberDetail: NextPage = () => {
	const router = useRouter();
	const memberId = typeof router.query.id === 'string' ? router.query.id : '';
	const category = typeof router.query.category === 'string' ? router.query.category : 'pets';

	return <MemberDetailContent memberId={memberId} category={category} key={memberId} />;
};

export default withLayoutFull(MemberDetail);
