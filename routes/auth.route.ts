import express from "express"
import { body } from "express-validator"
import { controller } from "./auth-controller.route"
import { auth } from "../middlewaree/authMiddleware"

const AuthRoute = express.Router()


AuthRoute.post('/register',[
    body('firstName','Имя юзера не может быть пустым').notEmpty(),
    body('firstName', 'Имя юзера может содержать не больше 32-ух символов').isLength({max: 32}),
    body('lastName','Фамилия юзера не может быть пустым').notEmpty(),
    body('lastName', 'Фамилия юзера может содержать не больше 32-ух символов').isLength({max: 32}),
    body('secondName', 'Отчество юзера может содержать не больше 32-ух символов').isLength({max: 32}),
    body('email', 'Введите корректный email!').isEmail(),
    body('nick', 'Введите корректный email!').notEmpty(),
    body('password', 'Пароль должен быть длинее 4-ёх символов, но меньше 12-ти').isLength({min:4, max: 12})
], controller.regestration)

AuthRoute.post('/login', [
    body('nick', 'Имя юзера не может быть пустым').notEmpty(),
    body('password', 'Пароль должен быть длинее 4-ёх символов, но меньше 12-ти').isLength({ min: 4, max: 12 })
], controller.login)

AuthRoute.post('/getUser', auth, controller.getUser)

export { AuthRoute }