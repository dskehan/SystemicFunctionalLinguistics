let express = require('express')
let app = express()
let clauseRoute = require('./routes/clause')
let userRoute = require('./routes/user')
let threeStrandTableRoute = require('./routes/threeStrandTables')
let onetrandTableRoute = require('./routes/oneStrandTables')
let treeGenerationRoute = require('./routes/treeGeneration')
let docs = require('./routes/docs')
let path = require('path')
let bodyParser = require('body-parser')
let swaggerJsdoc = require('swagger-jsdoc');
let swaggerUi = require('swagger-ui-express');


app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true
  }));

app.use((req, res,next) =>{
    console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body)
    next()
})

app.use(express.static('public'))
app.use(clauseRoute)
app.use(userRoute)
app.use(threeStrandTableRoute)
app.use(onetrandTableRoute)
app.use(treeGenerationRoute)
app.use(docs)
 
app.use((req, res, next) =>{
    res.status(404).send("request not found!")
})

app.use((err, req, res, next) => {
    console.error(err.stack) 
    res.sendFile(path.join(__dirname, '../public/500.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))