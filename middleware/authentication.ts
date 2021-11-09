import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

export const jwtGenerator = (user_id: string) => {
    const payload = {
        user: user_id
    }
    if(process.env.jwtSecret){
        return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "1hr"})
    } else {
        return "Secrets of all secrets couldn't be found."
    }
}