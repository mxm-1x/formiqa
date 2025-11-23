import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mxmnew_secret';

export type JwtPayload = {
    id: string;
    email: string;
};

export const signJwt = (payload: JwtPayload, expiresIn = "7d") => {
    // @ts-ignore
    return sign(payload, JWT_SECRET, { expiresIn });
}

export const verifyJwt = (token: string): JwtPayload | null => {
    try {
        const data = verify(token, JWT_SECRET) as JwtPayload;
        return data;
    } catch (error) {
        return null;
    }
}