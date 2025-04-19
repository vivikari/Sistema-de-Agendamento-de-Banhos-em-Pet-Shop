import express  from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(express.urlencoded({ extended: true })) //permite envio por forms com action
app.use(express.static('public')) //Adicione isso para servir os HTMLs
app.use("/api", routes)


//Conexão
app.listen(port, ()=> {
    console.log(`Servidor rodando em: http://localhost:${port}`)
})

//para conectar o nodemon usar:
//npx nodemon server.js
