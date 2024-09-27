import {jwtVerify, SignJWT} from "jose";

export async function createToken(email, id) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    let token = await new SignJWT({email: email, id: id})
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setIssuer(process.env.JWT_ISSUER)
        .setExpirationTime(process.env.JWT_EXPIRATION_TIME)
        .sign(secret);

    return token;

}
export async function verifyToken(token) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    let verifiedToken = await jwtVerify(token, secret)
    return verifiedToken['payload']
}