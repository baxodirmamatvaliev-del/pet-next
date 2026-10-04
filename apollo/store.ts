import { makeVar } from '@apollo/client';

import { CustomJwtPayload } from '../libs/types/customJwtPayload';

export const userVar = makeVar<CustomJwtPayload | null>(null);
export const cartCountVar = makeVar<number>(0);
