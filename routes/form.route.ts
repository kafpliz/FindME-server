import express from "express"

const FormRouter = express.Router()
import mysql from 'mysql2'
import { Human } from "../interfaces/forms"
import { dbConnect } from "../config"

const connection = mysql.createConnection(dbConnect)

connection.connect((err) => {
    if (err) {
        return console.error("Ошибка: " + err.message);
    } else {
        console.log('Connected... form')
    }
})


FormRouter.post('/create', async (req, res) => {
    console.log(req.body);
        
  
    let body = req.body;
    let formType: number = body.human == true ? 1 : 0



    if (formType == 1) {
        let sqlHuman: string = 'insert into human_forms(human, firstName, secondName, lastName, peculiarity, description, img, time,found)';
        let valueHuman: string = ` values("${body.human == true ? 1 : 0}", "${body.firstName}","${body.secondName}", "${body.lastName}"," ${body.peculiarity}", "${body.description}", "${body.img}","${body.date}", "0")`

        connection.execute(sqlHuman + valueHuman, (err, result, fields) => {err? console.log(err): res.status(200).json({message: 'успешно', result})})
  
       

    }

    if (formType == 0) {
        let sqlAnimal: string = 'insert into animal_forms(human, nick, peculiarity, description, img, time,found)';
        let valueAnimal: string = ` values("${body.human == true ? 1 : 0}", "${body.nick}", "${body.peculiarity}", "${body.description}", "${body.img}","${body.date}", ${body.found == true ? 1 : 0})`

        connection.execute(sqlAnimal + valueAnimal, (err, result, fields) => { console.log(err); })
        connection.execute('select * from animal_forms', (err, result, fields) => { res.send(result) })
   
    }




})

FormRouter.get('/get', async (req, res) => {
    let query = req.query;
    let arr: any[] = [];
    console.log(query);

    if (query.type == 'human') {
        connection.execute('select * from human_forms', (err, result, fields) => { res.json(result) })
    } else if (query.type == 'animal') {
        connection.execute('select * from animal_forms', (err, result, fields) => { res.json(result) })
    } else if (!query.type) {
        connection.execute('SELECT * FROM human_forms', (err, humanResult: any, fields) => {
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