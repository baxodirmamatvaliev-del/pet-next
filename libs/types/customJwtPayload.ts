export interface CustomJwtPayload {
	sub: string;
	iat?: number;
	exp?: number;
}
