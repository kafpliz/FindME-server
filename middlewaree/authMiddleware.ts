import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import mysql from 'mysql2'
import { dbConnect } from '../config';
const connection = mysql.createConnection(dbConnect)
import { generateAccessToken, generateRefreshToken } from '../tokens/token';
dotenv.config();


const auth = (req: any, res: any, next: any) => {
    console.log('auth');

    if (req.method === "OPTIONS") {
        next()
    }
    const accessToken = req.headers.accesstoken ? req.headers.accesstoken.split(' ')[1] : null
    const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || '';
    const refreshToken = req.headers.refreshtoken ? req.headers.refreshtoken.split(' ')[1] : null
    const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '';
    try {

        console.log('аксес', accessToken);


        if (accessToken) {
            const decodedData = jwt.verify(accessToken, JWT_ACCESS_SECRET)

            req.user = decodedData;
            console.log(200, 'аксес есть');
            next()
        } 



    } catch (error: any) {
        console.log('--------------------------------------');
        console.log(error);
        if (error.message == 'jwt expired') {
            console.log(200)
            if (refreshToken) {
                const decodedData = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
                let param: string | any = decodedData
                let userId = param.id
                console.log('рефреш есть');

                connection.execute(`select * from users where id = ${param.id}`, (err, result: any, fields) => {
                    console.log('1)',refreshToken);
                    console.log('2)',result[0].refreshToken);
                    
                    if (refreshToken == result[0].refreshToken) {
                        console.log(200, 'равны');
                        try {
                            let refreshToken = generateRefreshToken(result[0].id, result[0].nick);
                            connection.execute(`update users set refreshToken=? where id =?`, [refreshToken, userId])
                            console.log(205, 'равны');
                            let options = { 
                                message: 'Перезапустите приложение', 
                                tokens: { accessToken: generateAccessToken(result[0].id, result[0].nick), refreshToken: refreshToken },
                                status: 205 
                            }
                            console.log(options);
                            
                            return res.json(options)
                            

                        } catch (error) {
                            console.error('Ошибка при обновлении refreshToken:', error);
                            return res.status(401).json({ message: 'Вход не выполнен, ошибка при обновлении refreshToken ', error, status: 401 });
                        }
                    } else {
                        return res.status(401).json({ message: 'Вход не выполнен, присланный refreshToken отличается от сохранённого',status : 401 })
                    }
                })

            }



        } else {
            return res.status(401).json({ message: 'Вход не выполнен', error, status: 401 })
        }


        
    }
}

export { auth }