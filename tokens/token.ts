import jwt from 'jsonwebtoken';
import mysql from 'mysql2'
import { dbConnect } from '../config';
import dotenv from 'dotenv';

dotenv.config();
const connection = mysql.createConnection(dbConnect)


export let generateAccessToken = (id: number, userNick: string, roles:string) => {
    const payload = { id, userNick,roles }
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET || '', { expiresIn: '7m' })
    return accessToken
    

}
export let generateRefreshToken = (id: number, userNick: string, roles:string) => {
    const payload = { id, userNick,roles }
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || '', { expiresIn: '30d' })
    connection.execute(`update users set refreshToken="${refreshToken}" where id = "${id}"`, (err, result: any, fields) => {
        
    })
    return refreshToken
}



