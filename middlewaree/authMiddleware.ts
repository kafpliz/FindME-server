import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import mysql from 'mysql2'
import { dbConnect } from '../config';
import { generateAccessToken, generateRefreshToken } from '../tokens/token';
import { User } from "../models/allModels";
dotenv.config();


const auth = async (req: any, res: any, next: any) => {
    if (req.method === "OPTIONS") {
        next()
    }
    const accessToken = req.headers.accesstoken ? req.headers.accesstoken.split(' ')[1] : null
    const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || '';
    const refreshToken = req.headers.refreshtoken ? req.headers.refreshtoken.split(' ')[1] : null
    const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '';
    try {
        if (accessToken) {
            const decodedData = jwt.verify(accessToken, JWT_ACCESS_SECRET)
            req.user = decodedData;
            next()
        }
    } catch (error: any) {
        console.log('--------------------------------------');
        console.log(error);
        if (error.message === 'jwt expired') {
            console.log(200)
            if (refreshToken) {
                const decodedData = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
                let param: string | any = decodedData
                let userId = param.id
                let user = await User.findOne({ where: { id: userId } })
                if (user?.dataValues.refreshToken != refreshToken) {
                    return res.status(401).json({ message: 'Вход не выполнен, присланный refreshToken отличается от сохранённого', status: 401 })
                }
                console.log(200, 'равны');
                try {
                    let refreshToken = generateRefreshToken(user?.dataValues.id, user?.dataValues.nick, user?.dataValues.roles);
                    await User.update({ refreshToken: refreshToken }, { where: { id: userId } }).then(() => {
                        let options = {
                            message: 'Перезапустите приложение',
                            tokens: { accessToken: generateAccessToken(user?.dataValues.id, user?.dataValues.nick, user?.dataValues.roles), refreshToken: refreshToken },
                            status: 205
                        }
                        return res.json(options)
                    })
                } catch (error) {
                    console.error('Ошибка при обновлении refreshToken:', error);
                    return res.status(401).json({ message: 'Вход не выполнен, ошибка при обновлении refreshToken ', error, status: 401 });
                }
              

            }



        } else {
            return res.status(401).json({ message: 'Вход не выполнен', error, status: 401 })
        }



    }
}

export { auth }