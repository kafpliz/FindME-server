import jwt from "jsonwebtoken";

import { secretKey } from "../config";

const auth = (req: any, res: any, next: any) => {
    console.log(200);
    
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(400).json({ message: 'Вход не выполнен' })
        }
        const decodedData = jwt.verify(token, secretKey)
        req.user = decodedData;
        next()
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: 'Вход не выполнен', error })
    }
}

export {auth}