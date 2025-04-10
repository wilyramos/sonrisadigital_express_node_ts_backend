import { CorsOptions } from 'cors';

export const corsConfig: CorsOptions = {
    origin: function (origin, callback){

        const whitelist = [process.env.FRONTEND_URL];

        if(process.argv[2] === '--api'){ // Si se ejecuta el servidor con el flag --api
            whitelist.push(undefined); // 
        } // Para poder probar con Postman Thunder Client

        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};