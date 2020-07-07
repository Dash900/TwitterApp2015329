'use strict'

const mongoose = require("mongoose")
const app = require("./app")  // "./" directorio actual

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/IN6BM', {useNewUrlParser: true, useUnifiedTopology:  true, useFindAndModify: false }).then(() =>{
    console.log('Se encuentra conectado a la base de datos');

    app.set('port', process.env.PORT || 3000)
    app.listen(app.get('port'), ()=>{
        console.log(`El servidor esta corriendo en el puerto: ${app.get('port')}`);
    })
}).catch(err => console.log(err))