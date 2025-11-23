export type JwtPayload = {
    id: string;
    email: string;
};
export declare const signJwt: (payload: JwtPayload, expiresIn?: string) => never;
export declare const verifyJwt: (token: string) => JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map