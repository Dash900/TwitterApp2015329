'use strict'

//VARIABLES GLOBALES
const express = require("express")
const app = express()
const bodyParser = require("body-parser")

//CARGA DE RUTAS
var user_routes = require("./src/routes/tweetRoutes")


//MIDDLEWARES espaciar datos al json
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

//CABECERAS
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Acces-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')

    next();
})

//RUTAS 
app.use('/api', user_routes)

//EXPORTAR
module.exports = app;
