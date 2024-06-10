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
    try {
        /*       let body = req.body;
              const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || ''; */

        const accessToken = req.headers.accesstoken ? req.headers.accesstoken.split(' ')[1] : null
        const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || '';
        const refreshToken = req.headers.refreshtoken ? req.headers.refreshtoken.split(' ')[1] : null
        const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || '';

    /*     console.log('ac', accessToken);

        console.log('refrres', refreshToken); */


        if (accessToken) {
            const decodedData = jwt.verify(accessToken, JWT_ACCESS_SECRET)
            req.user = decodedData;
         /*    console.log(200, '34'); */
            next()
        } else if (refreshToken) {
            const decodedData = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
            let param: string | any = decodedData
         /*    console.log(201); */

            connection.execute(`select * from users where id = ${param.id}`, (err, result: any, fields) => {
            
                    if (refreshToken == result[0].refreshToken) {

                    console.log(200, 'равны');

                    
                    let refreshToken = generateRefreshToken(result[0].id, result[0].nick);
                    connection.execute(`update users set refreshToken='${refreshToken}' where id ="${param.id}"`,(err, result2: any, fields) => { 
                        console.log('connect exucte');
                        return res.status(205).json({ message: 'Перезапустите приложение', tokens: { accessToken: generateAccessToken(result[0].id, result[0].nick), refreshToken: refreshToken } })
            
                    })
                    
                
                     } else {
                             return res.status(401).json({ message: 'Вход не выполнен' })

                }
            })

        }




    } catch (error: any) {
        console.log('--------------------------------------');
        console.log(error);
        return res.status(401).json({ message: 'Вход не выполнен', error })
    }
}

export { auth }