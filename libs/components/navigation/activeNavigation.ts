type NavigationQuery = Record<string, string | string[] | undefined>;

/** Match the catalog's short URLs and its serialized filter URLs. */
export function desktopNavigationActive(
	pathname: string,
	query: NavigationQuery,
): number {
	if (pathname.startsWith('/product')) {
		let category = query.category;
		let sort = query.sort;
		if (typeof query.input === 'string') {
			try {
				const input: unknown = JSON.parse(query.input);
				if (input && typeof input === 'object' && !Array.isArray(input)) {
					const filter = input as {
						sort?: unknown;
						search?: { categoryList?: unknown };
					};
					const categories = filter.search?.categoryList;
					category =
						Array.isArray(categories) && categories.length === 1
							? categories[0]
							: undefined;
					sort = typeof filter.sort === 'string' ? filter.sort : undefined;
				} else {
					return 0;
				}
			} catch {
				// Invalid filter URLs retain the catalog's default navigation state.
				return 0;
			}
		}
		if (category === 'DOG') return 1;
		if (category === 'CAT') return 2;
		if (sort === 'productSold') return 4;
		if (sort === 'createdAt') return 3;
		return 0;
	}
	if (pathname.startsWith('/pet')) return 5;
	if (pathname === '/cs') return 6;
	return -1;
}
