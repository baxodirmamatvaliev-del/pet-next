const priceFormatter = new Intl.NumberFormat('ko-KR');

export const formatterStr = (value: number): string => {
	return priceFormatter.format(value);
};
