import express from "express"
import { FormRouter } from "./routes/form.route";
import { AuthRoute } from "./routes/auth.route";
import formData from 'express-form-data'
import cors from 'cors'




const app = express();

formData.parse()

app.use(cors())
app.use(express.static('static'))
app.use(express.json())







app.get('/', async (req, res) => {

  
})


app.use('/form', FormRouter)
app.use('/auth', AuthRoute)




app.listen(3000, () => { console.log('Starting...'); })
