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

interface FilterType {
	searchFilter: ProductsInquiry;
	updateSearchFilter: (input: ProductsInquiry) => void;
	initialInput: ProductsInquiry;
}

const categoryOptions = [
	{ label: 'Dogs', value: ProductCategory.DOG },
	{ label: 'Cats', value: ProductCategory.CAT },
];

const typeOptions = [
	{ label: 'Food', value: ProductType.FOOD },
	{ label: 'Toys', value: ProductType.TOY },
	{ label: 'Beds', value: ProductType.BED },
	{ label: 'Harnesses', value: ProductType.HARNESS },
	{ label: 'Accessories', value: ProductType.ACCESSORY },
	{ label: 'Other', value: ProductType.OTHER },
];

const Filter = (props: FilterType) => {
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
						placeholder="Search products"
						slotProps={{
							htmlInput: { 'aria-label': 'Search products' },
							input: { endAdornment: <InputAdornment position="end"><IconButton type="submit" edge="end" aria-label="Submit search"><SearchRoundedIcon /></IconButton></InputAdornment> },
						}}
					/>
				</Box>
				<Stack direction="row" className="product-filter__mobile-groups">
					<FormControl className="product-filter__group">
						<FormLabel>Pet</FormLabel>
						<FormGroup>
							{categoryOptions.map(({ label, value }) => (
								<FormControlLabel key={value} label={label} control={<Checkbox size="small" checked={searchFilter.search.categoryList?.includes(value) ?? false} onChange={() => categorySelectHandler(value)} />} />
							))}
						</FormGroup>
					</FormControl>
					<FormControl className="product-filter__group">
						<FormLabel>Product type</FormLabel>
						<FormGroup>
							{typeOptions.map(({ label, value }) => (
								<FormControlLabel key={value} label={label} control={<Checkbox size="small" checked={searchFilter.search.typeList?.includes(value) ?? false} onChange={() => typeSelectHandler(value)} />} />
							))}
						</FormGroup>
					</FormControl>
				</Stack>
				<Button className="product-filter__reset" variant="outlined" onClick={resetFilterHandler}>Reset filters</Button>
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
					placeholder="Search products"
					slotProps={{
						htmlInput: { 'aria-label': 'Search products' },
						input: {
							endAdornment: (
								<InputAdornment position="end">
									<IconButton type="submit" edge="end" aria-label="Submit search">
										<SearchRoundedIcon />
									</IconButton>
								</InputAdornment>
							),
						},
					}}
				/>
			</Box>

			<FormControl className="product-filter__group">
				<FormLabel>Pet</FormLabel>
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
				<FormLabel>Product type</FormLabel>
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
				Reset filters
			</Button>
		</Box>
	);
	}
};

export default Filter;
