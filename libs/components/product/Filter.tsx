import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
	Box,
	Checkbox,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	IconButton,
	InputAdornment,
	TextField,
} from '@mui/material';
import { FormEvent, useState } from 'react';

import { ProductCategory, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';

interface FilterProps {
	search: ProductsInquiry['search'];
	onChange: (search: ProductsInquiry['search']) => void;
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

const Filter = ({ search, onChange }: FilterProps) => {
	const [searchText, setSearchText] = useState(search.text ?? '');

	const toggleCategory = (category: ProductCategory) => {
		const categoryList = search.categoryList ?? [];
		const nextCategories = categoryList.includes(category)
			? categoryList.filter((item) => item !== category)
			: [...categoryList, category];

		onChange({ ...search, categoryList: nextCategories.length ? nextCategories : undefined });
	};

	const toggleType = (type: ProductType) => {
		const typeList = search.typeList ?? [];
		const nextTypes = typeList.includes(type)
			? typeList.filter((item) => item !== type)
			: [...typeList, type];

		onChange({ ...search, typeList: nextTypes.length ? nextTypes : undefined });
	};

	const submitSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onChange({ ...search, text: searchText.trim() || undefined });
	};

	return (
		<Box component="aside" className="product-filter">
			<Box component="form" className="product-filter__search" onSubmit={submitSearch}>
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
							control={<Checkbox
								size="small"
							checked={search.categoryList?.includes(value) ?? false}
							onChange={() => toggleCategory(value)}
							/>}
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
							control={<Checkbox
								size="small"
							checked={search.typeList?.includes(value) ?? false}
							onChange={() => toggleType(value)}
							/>}
						/>
					))}
				</FormGroup>
			</FormControl>
		</Box>
	);
};

export default Filter;
