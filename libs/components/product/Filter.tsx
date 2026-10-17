import { FormEvent, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
} from '@mui/material';

import { ProductCategory, ProductType } from '../../enums/product.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductsInquiry } from '../../types/product/product.input';
import { useTranslation } from '../../i18n';

interface FilterType {
	searchFilter: ProductsInquiry;
	updateSearchFilter: (input: ProductsInquiry) => void;
	initialInput: ProductsInquiry;
}

const Filter = (props: FilterType) => {
	const { t } = useTranslation();
	const categoryOptions = [
		{ label: t('nav.dogs'), value: ProductCategory.DOG },
		{ label: t('nav.cats'), value: ProductCategory.CAT },
	];
	const typeOptions = [
		{ label: t('ui.food'), value: ProductType.FOOD },
		{ label: t('ui.toys'), value: ProductType.TOY },
		{ label: t('ui.beds'), value: ProductType.BED },
		{ label: t('ui.harnesses'), value: ProductType.HARNESS },
		{ label: t('ui.accessories'), value: ProductType.ACCESSORY },
		{ label: t('ui.other'), value: ProductType.OTHER },
	];

	const { searchFilter, updateSearchFilter, initialInput } = props;
	const device = useDeviceDetect();

	/** STATES **/
	const [searchText, setSearchText] = useState(searchFilter.search.text ?? '');

	/** HANDLERS **/
	const categorySelectHandler = (category: ProductCategory) => {
		const categoryList = searchFilter.search.categoryList ?? [];
		const nextCategories = categoryList.includes(category)
			? categoryList.filter((item) => item !== category)
			: [...categoryList, category];

		updateSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				categoryList: nextCategories.length ? nextCategories : undefined,
			},
		});
	};

	const typeSelectHandler = (type: ProductType) => {
		const typeList = searchFilter.search.typeList ?? [];
		const nextTypes = typeList.includes(type)
			? typeList.filter((item) => item !== type)
			: [...typeList, type];

		updateSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				typeList: nextTypes.length ? nextTypes : undefined,
			},
		});
	};

	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		updateSearchFilter({
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				text: searchText.trim() || undefined,
			},
		});
	};

	const resetFilterHandler = () => {
		setSearchText('');
		updateSearchFilter(initialInput);
	};

	if (device === 'mobile') {
		/** RENDER MOBILE **/
		return (
			<Stack component="aside" className="product-filter product-filter--mobile">
				<Box component="form" className="product-filter__search" onSubmit={searchHandler}>
					<TextField
						fullWidth
						size="small"
						type="search"
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						placeholder={t('nav.search')}
						slotProps={{
							htmlInput: { 'aria-label': t('nav.search') },
							input: { endAdornment: <InputAdornment position="end"><IconButton type="submit" edge="end" aria-label={t('nav.submitSearch')}><SearchRoundedIcon /></IconButton></InputAdornment> },
						}}
					/>
				</Box>
				<Stack direction="row" className="product-filter__mobile-groups">
					<FormControl className="product-filter__group">
						<FormLabel>{t('ui.pet')}</FormLabel>
						<FormGroup>
							{categoryOptions.map(({ label, value }) => (
								<FormControlLabel key={value} label={label} control={<Checkbox size="small" checked={searchFilter.search.categoryList?.includes(value) ?? false} onChange={() => categorySelectHandler(value)} />} />
							))}
						</FormGroup>
					</FormControl>
					<FormControl className="product-filter__group">
						<FormLabel>{t('ui.productType')}</FormLabel>
						<FormGroup>
							{typeOptions.map(({ label, value }) => (
								<FormControlLabel key={value} label={label} control={<Checkbox size="small" checked={searchFilter.search.typeList?.includes(value) ?? false} onChange={() => typeSelectHandler(value)} />} />
							))}
						</FormGroup>
					</FormControl>
				</Stack>
				<Button className="product-filter__reset" variant="outlined" onClick={resetFilterHandler}>{t('ui.resetFilters')}</Button>
			</Stack>
		);
	} else {
		/** RENDER PC **/
		return (
			<Box component="aside" className="product-filter">
				<Box component="form" className="product-filter__search" onSubmit={searchHandler}>
					<TextField
						fullWidth
						size="small"
						type="search"
						value={searchText}
						onChange={(event) => setSearchText(event.target.value)}
						placeholder={t('nav.search')}
						slotProps={{
							htmlInput: { 'aria-label': t('nav.search') },
							input: {
								endAdornment: (
									<InputAdornment position="end">
										<IconButton type="submit" edge="end" aria-label={t('nav.submitSearch')}>
											<SearchRoundedIcon />
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>
				</Box>

				<FormControl className="product-filter__group">
					<FormLabel>{t('ui.pet')}</FormLabel>
					<FormGroup>
						{categoryOptions.map(({ label, value }) => (
							<FormControlLabel
								key={value}
								label={label}
								control={(
									<Checkbox
										size="small"
										checked={searchFilter.search.categoryList?.includes(value) ?? false}
										onChange={() => categorySelectHandler(value)}
									/>
								)}
							/>
						))}
					</FormGroup>
				</FormControl>

				<FormControl className="product-filter__group">
					<FormLabel>{t('ui.productType')}</FormLabel>
					<FormGroup>
						{typeOptions.map(({ label, value }) => (
							<FormControlLabel
								key={value}
								label={label}
								control={(
									<Checkbox
										size="small"
										checked={searchFilter.search.typeList?.includes(value) ?? false}
										onChange={() => typeSelectHandler(value)}
									/>
								)}
							/>
						))}
					</FormGroup>
				</FormControl>

				<Button className="product-filter__reset" variant="outlined" onClick={resetFilterHandler}>
					{t('ui.resetFilters')}
				</Button>
			</Box>
		);
	}
};

export default Filter;
