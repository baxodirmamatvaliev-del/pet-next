declare module 'apollo-upload-client/createUploadLink.mjs' {
	import type { ApolloLink } from '@apollo/client';

	type CreateUploadLinkOptions = {
		uri?: string;
	};

	export default function createUploadLink(options?: CreateUploadLinkOptions): ApolloLink;
}
