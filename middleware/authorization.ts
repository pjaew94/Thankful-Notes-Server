import { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";



dotenv.config();

module.exports = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const jwtToken = req.header("token");
    

        if(!jwtToken){
            return res.status(403).json({eng: "Not authorized to access this feature.", kor: "이 기능에 액세스할 수 있는 권한이 없습니다."})
        }
        if(process.env.jwtSecret){
            await jwt.verify(jwtToken, process.env.jwtSecret, (error, decoded) => {
                if(error) {
                    res.status(401).json( 'Token is not valid' );
                } else {
                    req.user = decoded!.user;
                    next();
                }
            });
            
        } else {
            return res.status(403).json("No secret to compare")
        }

    }catch(err) {
        console.log(err)
        return res.status(403).json("Not authorized to access this feature.")
    }
}