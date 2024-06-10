import express from "express"
import { body } from "express-validator"
import { controller } from "./auth-controller.route"
import { auth } from "../middlewaree/authMiddleware"
import multer from "multer"
import path from "path"


const AuthRoute = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './static/user_img/') 
    },
    filename: (req, file, cb) => {
        const uniqueSuf = 'avatar-'+ req.body.userNick
        cb(null, uniqueSuf +`${path.extname(file.originalname)}` );
    }
})

const uploadUserImg = multer({ storage })

const uploadTeamsImg = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => { cb(null, './static/teams_img/') },
        filename: (req, file, cb) => {  
            const uniqueSuf = 'team-' + req.body.nick;
            cb(null, uniqueSuf + path.extname(file.originalname));
        }
    }),
    
});



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
AuthRoute.post('/users', auth, controller.users)
AuthRoute.post('/updateUser', auth, uploadUserImg.array('files'), controller.updateUser)
AuthRoute.post('/createTeam', auth, uploadTeamsImg.array('files'), controller.createTeam)
AuthRoute.post('/sendEmailCode', auth, controller.sendEmailCode)
AuthRoute.post('/confirmEmail', auth, controller.confirmEmail)
AuthRoute.post('/tips', auth, controller.getTips)
AuthRoute.post('/setPublicProfile', auth, controller.setPublicProfile)
AuthRoute.post('/publicUsers', auth, controller.publicUsers)



export { AuthRoute }