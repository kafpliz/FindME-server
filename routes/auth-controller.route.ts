import { validationResult } from 'express-validator';
import mysql from 'mysql2'
import { dbConnect } from '../config';
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import { generateAccessToken, generateRefreshToken } from '../tokens/token';
import { forgotPasswordTemplate, generatePassword, generateRandomNumber, layoutLetters } from '../utils/allUtils';
import { Sequelize, Op } from 'sequelize'
import { User, Team,FindBlank } from '../models/allModels';

const sequelize = new Sequelize(dbConnect.database, dbConnect.user, dbConnect.password, {
    host: dbConnect.host,
    dialect: 'mysql',
    logging: false
})

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
            sequelize.authenticate().then(() => { console.log('Успещно подклюено!'); return User.sync(); })

            let candidate = await User.findOne({ where: { nick: nickname } })

            if (candidate) {
                return res.json({ message: "Пользователь с таким username уже существует!", status: 400 })
            }

            const hashPassword = bcrypt.hashSync(password, 7)
            await User.create({
                firstName,
                lastName,
                email,
                password: hashPassword,
                nick: nickname,
                secondName,
            }).then((user) => {
                return res.json({ message: "Успешно зарегестрирован", status: 200, tokens: { accessToken: generateAccessToken(user.dataValues.id, user.dataValues.nick, user.dataValues.roles), refreshToken: generateRefreshToken(user.dataValues.id, user.dataValues.nick, user.dataValues.roles) } })
            }
            )
        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "ошибка при регистрации", error })
        }

    }
    async login(req: any, res: any) {
        try {
            const { nick, password } = req.body;
            let nickname: string = nick.toLowerCase()
            let user = await User.findOne({ where: { nick: nickname } })
            if (!user) {
                return res.json({ message: 'Такой пользователь не зарегестрирован!', status: 500 })
            }
            const validPassword = bcrypt.compareSync(password, user.dataValues.password)
            if (!validPassword) {
                return res.json({ message: 'Неверный пароль', status: 400 })
            }
            const tokens = { accessToken: generateAccessToken(user.dataValues.id, user.dataValues.nick, user.dataValues.roles), refreshToken: generateRefreshToken(user.dataValues.id, user.dataValues.nick, user.dataValues.roles) }
            return res.json({ tokens, message: 'Успешный логин', status: 200 })



        } catch (error) {
            console.log(error)
        }
    }
    async getUser(req: any, res: any) {
        let userID: number | null = req.user.id || null
        if (!userID) {
            return res.json({ status: 400, message: 'Не указан userId' })
        }
        let user = await User.findOne({ where: { id: userID }, attributes: { exclude: ['refreshToken', 'password', 'emailCode'] } })
        if (!user) {
            res.json({ status: 400, message: 'Ошибка' })
        }
        let newUserData = user?.dataValues


        res.json({ status: 200, data: newUserData })

    }
    async users(req: any, res: any) {
        let users = await User.findAll({ attributes: { exclude: ['password', 'refreshToken', 'emailCode'] } })
        return res.json({ status: 200, data: users })

    }
    async updateUser(req: any, res: any) {
        let body = req.body
        let filePath: string | null = req.files.length == 0 ? null : req.files[0].destination.slice(8) + req.files[0].filename
        let confirmPassword = req.body.confirmPassword.length == 0 ? false : req.body.confirmPassword
        let newPassword = req.body.newPassword.length == 0 ? false : req.body.newPassword

        let userID: number | null = req.user.id || null
        if (!userID) {
            return res.json({ status: 400, message: 'Не указан userId' })
        }


        if (confirmPassword && newPassword) {
            let user = await User.findOne({ where: { id: userID } })
            const validPassword = bcrypt.compareSync(confirmPassword, user?.dataValues.password)
            if (!validPassword) {
                return res.json({ message: 'Неверный пароль', status: 400 })
            }
            const hashPassword = bcrypt.hashSync(newPassword, 7)
            const updateFields = {
                firstName: body.editFirstName ? body.editFirstName : undefined,
                secondName: body.editSecondName ? body.editSecondName : undefined,
                lastName: body.editLastName ? body.editLastName : undefined,
                email: body.editEmail ? body.editEmail : undefined,
                avatar: filePath || undefined,
                password: hashPassword || undefined,
                phone: body.editPhone ? body.editPhone : undefined,
                socialLinks: body.socialLinks ? body.socialLinks : undefined,
                description: body.editDescription ? body.editDescription : undefined
            };
            await User.update(updateFields, {
                where: { id: userID }
            }).then(data => {
                res.json({ status: 200, message: 'Успешно обновлено' })
            }).catch(err => {
                res.json({ status: 400, message: 'Ощибка' })
            })


        } else {
            const updateFields = {
                firstName: body.editFirstName ? body.editFirstName : undefined,
                secondName: body.editSecondName ? body.editSecondName : undefined,
                lastName: body.editLastName ? body.editLastName : undefined,
                email: body.editEmail ? body.editEmail : undefined,
                avatar: filePath || undefined,
                phone: body.editPhone ? body.editPhone : undefined,
                socialLinks: body.socialLinks ? body.socialLinks : undefined,
                description: body.editDescription ? body.editDescription : undefined
            };
            await User.update(updateFields, {
                where: { id: userID }
            }).then(data => {
                res.json({ status: 200, message: 'Успешно обновлено' })
            }).catch(err => {
                res.json({ status: 400, message: 'Ошибка' })
            })

        }




    }
    async createTeam(req: any, res: any) {
        let body = req.body;
        let filePath: string | boolean = req.files.length == 0 ? null : req.files[0].destination.slice(8) + req.files[0].filename
        let members = JSON.parse(body.members)
        console.log(body);

        if (body.members.length < 3) {
            members.push({ id: req.user.id, type: 'Создатель' })
            body.members = members

        } else {
            members.push({ id: req.user.id, type: 'Создатель' })
            body.members = JSON.stringify(members)


        }

        let teamCandidate = await Team.findOne({ where: { nick: body.nick } })
        if (teamCandidate) {
            return res.json({ message: 'Ошибка, команда с таким ником существует!', status: 400 })
        }
        Team.create({
            name: body.name,
            description: body.description,
            members: body.members,
            socialLinks: body.socialLinks,
            nick: body.nick,
            img: filePath,
        }).then(data => {
            return res.json({ message: 'Команда успешно создана!', status: 200 })
        })








    }
    /*    async updateUsers(req: any, res: any) {
           let body = req.body;
           console.log(body);
   
       } */
    async sendEmailCode(req: any, res: any) {
        let code = ''
        for (let i = 0; i < 6; i++) {
            code += generateRandomNumber(0, 9)
        }
        let data = req.user;
        let user = await User.findOne({ where: { id: data.id }, attributes: ['email', 'emailCode'] })
        let userEmail = user?.dataValues.email

        await User.update({ emailCode: code }, {
            where: { id: data.id }
        }).then(() => {
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASSWORD
                }
            });
            let mailOptions = {
                from: process.env.USER,
                to: userEmail,
                subject: 'Код доступа',
                html: layoutLetters(code),
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
            });

            return res.json({ message: 'Код успешно отправлен на вашу почту', status: 200 })
        })


    }
    async confirmEmail(req: any, res: any) {  
        let code = req.body.code
        const data = req.user
        let user = await User.findOne({ where: { id: data.id } })
        let userCode = user?.dataValues.emailCode
        if (code === userCode) {
            User.update(
                {
                    confirmEmail: true
                },
                {
                    where: { id: data.id }
            }).then(()=> {
               return res.json({ status: 200, message: 'Почта успешно подтверждена!' })
            })
        } else {
            res.json({ status: 400, message: 'Неверный код!' })
        }

        /*  connection.execute(`select emailCode from users where id ="${data.id}"`, (err, result: any, field) => {
             console.log();
             if (code == result[0].emailCode) {
                 connection.execute(`update users set confirmEmail="1" where id ="${data.id}"`)
                
             } else {
                 connection.execute(`update users set confirmEmail="0" where id ="${data.id}"`)
              
             }
         }) */

    }
    async getTips(req: any, res: any) {
        let tips = req.body.tips
        await User.findAll({where: { nick: { [Op.like]: `${tips}%` } }, attributes: ['id', 'nick', 'avatar'] }) .then((users:any) => {
            let data = users;
            
            return res.json({status:200, data})
            
        })
            

    }
    async setPublicProfile(req: any, res: any) {
        await  User.update({public: req.body.public}, {where: {id: req.user.id}}).then(()=> {
            res.json({ status: 200, message: 'Успешно обновлено' })
        })


    }
    async publicUsers(req: any, res: any) {

        await User.findAll({where: {public: true}, attributes: ['avatar', 'firstName', 'lastName', 'email','socialLinks']}).then((data:any)=> {
          return  res.json({ status: 200, data })
        })
      
    }

    async updateUserPassword(req: any, res: any) {
        try {
            let email = req.body.email
            if (!email) {
                return res.status(401).json({ message: "Вы не ввели почту!" })
            }
            let user = await User.findOne({where: {email: email}})
            if(!user){
                return res.json({ message: "Такой почты не найдено в базе!", status: 400 })
            }
       
            let newPassword = generatePassword(0, 12)
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
            await User.update({password: hashPassword}, {where: {email: email}}).then(()=> {
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                });
                return res.json({ message: "Пароль отправлен на почту!", status: 200 })
            })


        } catch (error) {
            console.log(error);
            res.status(400).json({ message: "Ошибка при попытке сброса пароля!", error })
        }
    }
 
    async moderateBlank(req: any, res: any) {
        let user = req.user
        if (user.roles === 'admin') {
            await FindBlank.findAll({where: {isModerate: false}}).then(data=> {
               
                return res.json({ status: 200, message: 'Модерация заявок', data})
            })

        } else {
            return res.json({ message: 'Вы не админ!', status: 401 })
        }
    }
    async approvedBlank(req: any, res: any) {
        let blankID = req.body.id
   
        if (blankID) {
           await FindBlank.update({isModerate: true}, {
                where: { id:blankID }
            }).then(data => {
                res.json({ status: 200, message: 'Успешно обновлено!' })
            }).catch(err => {
                res.json({ status: 400, message: 'Ошибка!', err })
            })

           

        }

    }

}

let controller = new AuthControllerRoute()


export { controller }


