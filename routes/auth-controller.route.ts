import { validationResult } from 'express-validator';
import mysql from 'mysql2'
import { dbConnect, secretKey } from '../config';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { log } from 'console';

const connection = mysql.createConnection(dbConnect)

connection.connect((err) => {
    if (err) {
        return console.error("Ошибка: " + err.message);
    } else {
        console.log('Connected... cont')
    }
})
let generateAccessToken = (id: number, nick: string) => {
    const payload = {
        id,
        nick
    }
    return jwt.sign(payload, secretKey, { expiresIn: "2d" })
}

class AuthControllerRoute {
    async regestration(req: any, res: any) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.json({ message: 'Ошибка при регистрации', errors, status: 400 })
            }
            const { firstName, lastName, email, password, nick, secondName } = req.body;
            let nickname: string = nick.toLowerCase();



            connection.execute(`select * from users where nick like "${nickname}"`, (err, result: any, fields) => {

                if (result.length != 0) {
                    res.send({ message: "Такой пользователь уже существует", status: 400 })
                } else {
                    const hashPassword = bcrypt.hashSync(password, 7)
                    const sql = `insert into users( firstName, lastName, nick, email, password, secondName) `;
                    const user = `values("${firstName}", "${lastName}", "${nickname}", "${email}", "${hashPassword}", "${secondName}")`;
                    connection.execute(sql + user, (err, result: any, fields) => {
                        res.json({ message: "Успешно зарегестрирован", status: 200 })
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
            console.log(req.body);

            connection.execute(`select * from users where nick like "${nick}"`, (err, result: any, field) => {
                /*  console.log('result',result); */

                if (result.length != 0) {


                    const validPassword = bcrypt.compareSync(password, result[0].password)
                    if (!validPassword) {
                        return res.json({ message: 'Неверный пароль', status: 400 })
                    }
                    const token = generateAccessToken(result[0].id, result[0].nick)
                    return res.json({ token, message: 'Успешный логин', status: 200 })

                } else {
                    res.json({ message: 'Такой ползователь не зарегестрирован!', status: 500 })
                }

            })


        } catch (error) {
            console.log(error);

        }
    }
    async getUser(req: any, res: any) {
        const token = req.headers.authorization.split(' ')[1];
        const decodedData: any = jwt.verify(token, secretKey)
        connection.execute(`select * from users where id like "${decodedData.id}"`, (err, result: any, field) => {
            console.log(result);
            const newData = {
                id: result[0].id,
                firstName: result[0].firstName,
                lastName: result[0].lastName,
                secondName: result[0].secondName,
                nick: result[0].nick,
                email: result[0].email,
                description: result[0].description,
                avatar: result[0].avatar,
            }
            console.log(newData);
            
            res.json({ status: 200, data: newData })
        })

    }
}

let controller = new AuthControllerRoute()


export { controller }


