import express from "express"
import { FormRouter } from "./routes/form.route";
import { AuthRoute } from "./routes/auth.route";


const app = express();



app.use(express.json())
app.get('/', (req, res) => {
    res.send('Work')
})

app.use('/form', FormRouter)
app.use('/auth', AuthRoute)



app.listen(3000, () => { console.log('Starting...'); })
