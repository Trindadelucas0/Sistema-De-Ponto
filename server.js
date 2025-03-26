import express from 'express'
import publicas from './routes/publicas.js'
const  app = express()
app.use(express.json());


app.use('/',publicas)
//rotas cadastrar,login/listar rotas
//publicas login/ cadastro



//privadas listar usuarios








app.listen(3000,()=>console.log('****servidor Rodando*****'))


//mongodb+srv://atlas-sample-dataset-load-67e34e52d329fa5b694975f0:<db_password>@sistema-ponto.solp6nb.mongodb.net/?retryWrites=true&w=majority&appName=sistema-ponto
//lucasrodrigues4