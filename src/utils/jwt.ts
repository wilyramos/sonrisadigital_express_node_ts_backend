import jwt from 'jsonwebtoken';

export const generateJWT = ( id: string ) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '100d'
    });
    return token;
}