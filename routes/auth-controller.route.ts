import { validationResult } from 'express-validator';
import mysql from 'mysql2'
import { dbConnect, secretKey } from '../config';
import bcrypt from 'bcryptjs'
import  jwt  from 'jsonwebtoken';

const connection = mysql.createConnection(dbConnect)

connection.connect((err) => {
    if (err) {
        return console.error("Ошибка: " + err.message);
    } else {
        console.log('Connected... cont')
    }
})
let generateAccessToken = (id:number, nick:string) => {
    const payload = {
        id,
        nick
    }
    return jwt.sign(payload, secretKey, {expiresIn: "2d"})
}

class AuthControllerRoute {
    async regestration(req: any, res: any) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ mes: 'Ошибка при регистрации', errors })
            }
            const { firstName, lastName, email, password, nick } = req.body;
            let nickname: string = nick.toLowerCase();



            connection.execute(`select * from users where nick like "${nickname}"`, (err, result: any, fields) => {
                console.log(nickname);
                if (result.length != 0) {
                    res.send({ mes: "Такой пользователь уже существует" })
                } else {
                    const hashPassword = bcrypt.hashSync(password, 7)
                    const sql = `insert into users( firstName, lastName, nick, email, password) `;
                    const user = `values("${firstName}", "${lastName}", "${nickname}", "${email}", "${hashPassword}")`;
                    connection.execute(sql + user, (err, result: any, fields) => {
                        res.status(200).json({ message: "Успешно зареган!" })
                    })

                }
            })



        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "ошибка при регистрации", error })
        }

    }
    async login(req: any, res: any) {
        try {
            const { nick, password } = req.body;
            connection.execute(`select * from users where nick like "${nick}"`, (err, result: any, field) => {
                console.log(result);

                if (result.length != 0) {
                    const validPassword = bcrypt.compareSync(password, result[0].password)
                    if(!validPassword){
                       return res.status(400).json({message: 'Неверный пароль'})
                    }
                    const token = generateAccessToken(result[0].id, result[0].nick)
                    return res.json({token, message: 'Успешный логин', status: 200})

                } else {
                    res.json({ message: 'Такой ползователь не зарегестрирован!' })
                }

            })


        } catch (error) {
            console.log(error);

        }
    }
}

let controller = new AuthControllerRoute()


export { controller }


