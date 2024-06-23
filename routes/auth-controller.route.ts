import { body, validationResult } from 'express-validator';
import mysql from 'mysql2'
import { dbConnect } from '../config';
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import { generateAccessToken, generateRefreshToken } from '../tokens/token';
import { forgotPasswordTemplate, generatePassword, generateRandomNumber, layoutLetters } from '../utils/allUtils';
dotenv.config();

const connection = mysql.createConnection(dbConnect)


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
                        connection.execute(`select * from users where nick like "${nickname}"`, (err, result: any, fields) => {
                            res.json({ message: "Успешно зарегестрирован", status: 200, token: { accessToken: generateAccessToken(result[0].id, result[0].nick, result[0].roles), refreshToken: generateRefreshToken(result[0].id, result[0].nick, result[0].roles) } })
                        })


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
                if (err) {
                    console.log(err);
                }

                if (result.length == 0) {
                    return res.json({ message: 'Такой пользователь не зарегестрирован!', status: 500 })
                }


                const validPassword = bcrypt.compareSync(password, result[0].password)
                if (!validPassword) {
                    return res.json({ message: 'Неверный пароль', status: 400 })
                }
                const token = { accessToken: generateAccessToken(result[0].id, result[0].nick, result[0].roles), refreshToken: generateRefreshToken(result[0].id, result[0].nick, result[0].roles) }
                return res.json({ token, message: 'Успешный логин', status: 200 })

            })


        } catch (error) {
            console.log(error)
        }
    }
    async getUser(req: any, res: any) {
        connection.execute(`select * from users where id like "${req.user.id}"`, (err, result: any, field) => {
            const newData = {
                id: result[0].id,
                firstName: result[0].firstName,
                lastName: result[0].lastName,
                secondName: result[0].secondName,
                nick: result[0].nick,
                email: result[0].email,
                description: result[0].description,
                avatar: result[0].avatar,
                roles: result[0].roles,
                phone: result[0].phone,
                socialLinks: JSON.parse(result[0].socialLinks),
                confirmEmail: result[0].confirmEmail == 1 ? true : false,
                public: result[0].public == 1 ? true : false,
            }

            res.json({ status: 200, data: newData })
        })

    }
    async users(req: any, res: any) {
        connection.execute(`select * from users`, (err, result: any, field) => {
            res.json({ status: 200, data: result })
        })
    }

    async updateUser(req: any, res: any) {
        let body = req.body
        let filePath: string | boolean = req.files.length == 0 ? false : req.files[0].destination.slice(8) + req.files[0].filename
        let confirmPassword = req.body.confirmPassword.length == 0 ? false : req.body.confirmPassword
        let newPassword = req.body.newPassword.length == 0 ? false : req.body.newPassword



        if (confirmPassword && newPassword) {
            connection.execute(`select * from users where id = "${req.user.id}"`, (err, result: any, field) => {
                const validPassword = bcrypt.compareSync(confirmPassword, result[0].password)
                if (!validPassword) {
                    return res.json({ message: 'Неверный пароль', status: 400 })
                }
                console.log('newpass', newPassword);
                const hashPassword = bcrypt.hashSync(newPassword, 7)
                console.log(hashPassword);
                let sqlQuery = 'update users set ' + (body.editFirstName ? `firstName='${body.editFirstName}',` : '') + (body.editLastName ? `lastName='${body.editLastName}',` : '') +
                    (body.editEmail ? `email='${body.editEmail}',` : '') + (body.editDescription ? `description='${body.editDescription}',` : '') + (body.editSecondName ? `secondName='${body.editSecondName}',` : '') +
                    (body.editPhone ? `phone='${body.editPhone}',` : '') + (body.socialLinks ? `socialLinks='${body.socialLinks}'` : '') + (filePath == false ? '' : `,avatar='${filePath}'`) + (`,password = "${hashPassword}"`) + ` where id = '${req.user.id}'`;

                connection.execute(sqlQuery,
                    (err, result: any, field) => {
                        if (err) {
                            console.log(err);
                            return res.json({ status: 400, message: 'Ошибка' })
                        } else {
                            res.json({ status: 200, message: 'Успешно обновлено' })
                        }
                    })
            })


        } else {
            let sqlQuery = 'update users set ' + (body.editFirstName ? `firstName='${body.editFirstName}',` : '') + (body.editLastName ? `lastName='${body.editLastName}',` : '') +
                (body.editEmail ? `email='${body.editEmail}',` : '') + (body.editDescription ? `description='${body.editDescription}',` : '') + (body.editSecondName ? `secondName='${body.editSecondName}',` : '') +
                (body.editPhone ? `phone='${body.editPhone}',` : '') + (body.socialLinks ? `socialLinks='${body.socialLinks}'` : '') + (filePath == false ? '' : `,avatar='${filePath}'`) + ` where nick = '${body.userNick}'`;

            connection.execute(sqlQuery,
                (err, result: any, field) => {
                    if (err) {
                        console.log(err);
                        return res.json({ status: 400, message: 'Ошибка' })
                    } else {
                        res.json({ status: 200, message: 'Успешно обновлено' })
                    }
                })
        }




    }
    async createTeam(req: any, res: any) {
        let body = req.body;
        let filePath: string | boolean = req.files.length == 0 ? false : req.files[0].destination.slice(8) + req.files[0].filename
        let members = JSON.parse(body.members)



        if (body.members.length < 3) {
            members.push({ id: req.user.id, type: 'Создатель' })
            body.members = members

        } else {
            members.push({ id: req.user.id, type: 'Создатель' })
            body.members = JSON.stringify(members)


        }

        connection.execute(`select * from teams where nick="${body.nick}"`, (err, result: any, field) => {

            if (result.length != 0) {
                return res.json({ message: 'Ошибка, команда с таким ником существует!', status: 400 })
            } else {

                console.log('body', body);
                let insert = `insert into teams(name, description, members, socialLinks, nick, img) `
                let values = `values("${body.name}","${body.description}",'${JSON.stringify(body.members)}','${JSON.stringify(body.socialLinks)}',"${body.nick}","${filePath}")`


                connection.execute(insert + values, (err, result1: any, field) => {
                    if (!err) {
                        return res.json({ status: 200, message: 'Успешно создана!' })
                    }
                })
            }


        })





    }

    async updateUsers(req: any, res: any) {
        let body = req.body;
        console.log(body);

    }
    async sendEmailCode(req: any, res: any) {
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += generateRandomNumber(0, 9)
        }

        let data = req.user
        connection.execute(`select email from users where id ="${data.id}"`, (err, result: any, field) => {
            connection.execute(`update users set emailCode="${code}" where id = "${data.id}"`)
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASSWORD
                }
            });
            let mailOptions = {
                from: process.env.USER,
                to: result[0].email,
                subject: 'Код доступа',
                html: layoutLetters(code),

            };


            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
            });
            res.json({ message: 'Код успешно отправлен на вашу почту', status: 200 })
        })



    }
    async confirmEmail(req: any, res: any) {
        console.log('confirmEmail');
        let code = req.body.code
        console.log(code);
        console.log(req.body);
        const data = req.user
        connection.execute(`select emailCode from users where id ="${data.id}"`, (err, result: any, field) => {
            console.log();
            if (code == result[0].emailCode) {
                connection.execute(`update users set confirmEmail="1" where id ="${data.id}"`)
                res.json({ status: 200, message: 'Почта успешно подтверждена!' })
            } else {
                connection.execute(`update users set confirmEmail="0" where id ="${data.id}"`)
                res.json({ status: 400, message: 'Неверный код!' })
            }
        })

    }
    async getTips(req: any, res: any) {
        console.log('tips', 200);
        console.log(req.body);

        let tips = req.body.tips
        connection.execute(`select id, nick, avatar from users where nick LIKE '${tips}%'`, (err, result: any, field) => {
            if (err) {
                console.log(err);

            } else {
                res.json({ status: 200, data: result })
            }



        })


    }
    async setPublicProfile(req: any, res: any) {
        console.log(req.body);

        let solution = req.body.public == true ? 1 : 0
        console.log(solution);
        connection.execute(`update users set public = "${solution}" where id = ${req.user.id}`, (err, result: any, field) => {
            if (err) {
                console.log(err);
                return res.json({ status: 400, message: 'Ошибка' })
            } else {
                res.json({ status: 200, message: 'Успешно обновлено' })
            }
        })

    }
    async publicUsers(req: any, res: any) {

        const options = 'avatar, firstName, lastName, secondName, description, email, socialLinks'
        connection.execute(`select ${options} from users where public = 1`, (err, result: any, field) => {
            if (err) {
                res.json({ status: 400, err })
            } else {
                res.json({ status: 200, data: result })
            }

        })
    }
    async updateUserPassword(req: any, res: any) {
        try {
            if (!req.body.email) {
                return res.status(401).json({ message: "Вы не ввели почту!" })
            }
            let email = req.body.email
            connection.execute(`select * from users where email = "${email}"`, (err, result: any, field) => {
                if (result.length == 0) {

                    return res.json({ message: "Такой почты не найдено в базе!", status: 400 })

                }
                let newPassword = generatePassword(0, 16)

                let transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: process.env.USER,
                        pass: process.env.PASSWORD
                    }
                });
                let mailOptions = {
                    from: process.env.USER,
                    to: email,
                    subject: 'Смена пароля',
                    html: forgotPasswordTemplate(newPassword),
                };
                const hashPassword = bcrypt.hashSync(newPassword, 7)


                connection.execute(`update users set password = '${hashPassword}' where email = '${email}'`, (err, result, field) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('успешно');

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            }
                        });
                        return res.json({ message: "Пароль отправлен на почту!", status: 200 })
                    }

                })





            })

        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "Ошибка при попытке сброса пароля!", error })
        }
    }
    async moderateBlank(req: any, res: any) {
        let user = req.user
        if (user.roles === 'admin') {
            connection.execute('select * from human_forms where isModerate = 0', (err, result, fields) => { res.json({ status: 200, message: 'Модерация заявок', data: result }) })

        } else {
            return res.json({ message: 'Вы не админ!', status: 401 })
        }
    }
    async approvedBlank(req: any, res: any) {
        let blankID = req.body.id
        console.log(blankID);
        if (blankID) {
            connection.execute(`update human_forms set isModerate = 1 where id=${blankID}`, (err, result, fields) => {
                if (err) {
                    console.log(err);
                    res.json({ status: 401, message: 'Ошибка при одобрение анкеты!' })

                } else {
                    res.json({ status: 200, message: 'Успешно добавлена!' })
                }
            })

        }
    
    }

}

let controller = new AuthControllerRoute()


export { controller }


