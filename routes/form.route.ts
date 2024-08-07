import express from "express"

const FormRouter = express.Router()
import mysql from 'mysql2'
import { dbConnect } from "../config"
import multer from "multer"
import path from "path"
import { v4 as uuidv4 } from 'uuid';
import { FindBlank } from "../models/allModels"

const connection = mysql.createConnection(dbConnect)




const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './static/form_img/')
    },
    filename: (req, file, cb) => {
        const uniqueSuf = uuidv4();
        cb(null, uniqueSuf + `${path.extname(file.originalname)}`);



    }
})
const upload = multer({ storage })

FormRouter.post('/create', upload.array('files', 5), async (req, res) => {
    let dateString = req.body.timeWTF
    const date = new Date(dateString);
    const unixDate = Math.floor(date.getTime() / 1000);
    





    const pathArr: string[] = []
    let files: any = req.files;


    for (const item of files) {

        pathArr.push(item.destination.slice(8) + item.filename)
    }



    let body = req.body;
    let formType: number = body.human == 'true' ? 1 : 0



    if (formType == 1) {
      await FindBlank.create({
            human: true,
            lastName: body.lastName,
            firstName: body.firstName,
            description: body.description,
            peculiarity: body.peculiarity,
            img: pathArr[0],
            time: unixDate,
            found: false,
            secondName: body.secondName,
        })
       return res.status(200).json({message: 'успешно',status: 200})
      



    }

    if (formType == 0) {


        let sqlAnimal: string = 'insert into animal_forms(human, nick, peculiarity, description, img, time,found)';
        let valueAnimal: string = ` values("${body.human == true ? 1 : 0}", "${body.nick}", "${body.peculiarity}", "${body.description}", "${pathArr}","${body.timeWTF}", "0")`

        connection.execute(sqlAnimal + valueAnimal, (err, result, fields) => { err ? console.log(err) : res.status(200).json({ message: 'Успешно добавлено', status: 200 }) })


    }




})

FormRouter.get('/get', async (req, res) => {
    let query = req.query;
    let arr: any[] = [];


    if (query.type == 'human') {
        connection.execute('select * from human_forms where isModerate = 1', (err, result, fields) => { res.json(result) })
    } else if (query.type == 'animal') {
        connection.execute('select * from animal_forms where isModerate = 1', (err, result, fields) => { res.json(result) })
    } else if (!query.type) {
        connection.execute('SELECT * FROM human_forms where isModerate = 1', (err, humanResult: any, fields) => {
            if (err) { console.log(err); return }
            for (let i = 0; i < humanResult.length; i++) {
                arr.push(humanResult[i])

            }

            connection.execute('SELECT * FROM animal_forms', (err, animalsResult: any, fields) => {
                if (err) { console.log(err); return }

                for (let i = 0; i < animalsResult.length; i++) {
                    arr.push(animalsResult[i])
                }

                res.json(arr);
            });

        });


    }


})



export { FormRouter }