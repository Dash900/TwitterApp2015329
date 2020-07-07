'use strict'

var FLLW = require("../models/fllw");
var jwt = require("../services/jwt");
var bcrypt = require("bcrypt-nodejs");
var TW = require("../models/tw");
var FW = require("../models/fw");
var USR = require("../models/usr");


/* REGISTRAR USUARIO */
function register(req, res, wtg) {

    var tw = new TW();
    var fllwr = new FW();
    var user = new USR();
    var fllw = new FLLW();

    if (wtg[1] && wtg[2]) {
        user.username = wtg[1]
        user.password = wtg[2]

        USR.find({username: user.username}).exec((err, src) => {
            if (err) return res.status(500).send({message: "Error en la peticion"})
            if (src && src.length >= 1) {
                return res.status(200).send({message: "Este usuario ya existe"})
            } else {
                bcrypt.hash(user.password, null, null, (err, tst) => {
                    user.password = tst;
                    user.save((err, saveUSR) => {
                        if (err) return res.status(500).send({message: "Error al guardar"})
                        if (saveUSR) {
                            tw.username = user.username
                            tw.tweets = []
                            tw.save((err, gDRD) => {
                                if (err) return res.status(500).send({message: "Error al generar tweets"});
                                if (!gDRD) return res.status(400).send({message: "Error al crear tweets"});
                            })
                            fllwr.username = user.username
                            fllwr.seguidores = []
                            fllwr.save((err, gDRD) => {
                                if (err) return res.status(500).send({message: "Error peticion generar seguidores" });
                                if (!gDRD) return res.status(400).send({message: "Error al crear tweets"});
                            })
                            fllw.username = user.username
                            fllw.seguimientos = []
                            fllw.save((err, gDRD) => {
                                if (err) return res.status(500).send({message: "Error peticion generar seguimientos"});
                                if (!gDRD) return res.status(400).send({message: "Error al crear tweets"});
                            })
                            return res.status(200).send({user: saveUSR})
                        } else {
                            return res.status(200).send({message: 'No se pudo registar el usuario' })
                        }
                    })
                })
            }
        })
    }else {
        return res.status(500).send({message: "Ingrese los datos necesarios"})
    }
}


/* LOGIN DEL USUARIO */
function login(req, res, wtg) {

    var users = wtg[1]
    var password = wtg[2]

    if (wtg[3]){
        var gettoken = wtg[3].toLowerCase() == "true" ? true:false
    }else {
        return res.status(500).send({message: "Genere un token"})
    }

    USR.findOne({ username: users }, (err, usuario) => {
        if (err) return res.status(500).send({message: "Error en la peticion"})
        if (usuario) {
            bcrypt.compare(password, usuario.password, (err, txt) => {
                if (txt) {
                    if (gettoken) {
                        return res.status(200).send({token: jwt.createToken(usuario)})
                    }
                    else {return res.status(200).send({message: "Opcion no valida"})
                    }
                }
                else {return res.status(404).send({message: "Error no se ha encontrado el usuario"})
                }
            })
        }
        else {
            return res.status(500).send({message: "Error al ingresar"})
        }
    })

}


/* PERFIL DEL USUARIO */
function profile(req, res, wtg){
    var nombreUSR = wtg[1]

    if (nombreUSR) {
        USR.findOne({ username: nombreUSR }, (err, user) => {
            if (err) return res.status(500).send({message: "Error en la peticion"})
            if (!user) return res.status(404).send({message: "Ingrese un usuario que exista"})
            if (user){
            TW.findOne({username: nombreUSR},(err,tweets)=>{
                if(err) return res.status(500).send({error: "no se pudo realizar la peticion"})
                if (!tweets) return res.status(404).send({error: "no se han encontrado los tweets"})
                if (tweets){user.password = undefined
                    tweets.username = undefined
                    return res.status(200).send({profile: user,tweets})
                 } 
                })
            }
        });
    } else {
        return res.status(500).send({message: "Ingrese los datos necesarios"})
    }
}



/* AGREGAR TWEETS */
function add_tweet (req, res, wtg) {
    wtg.splice(0, 1)
    var contenido = wtg.join(" ")
    var posteador = req.user.username

    if (contenido) {
        TW.findOneAndUpdate({username: posteador}, {$push:{nTweets:{body: contenido}}}, {new: true}, (err, tweetMOD) => {
            console.log(posteador)
            if (err) return res.status(500).send({messsage: "Error en la peticion"})
            if (!tweetMOD) return res.status(404).send({messsage: "Error al agregar el tweet"})
            if (tweetMOD) {
                USR.findOneAndUpdate({username: posteador}, {$inc:{"tweets": 1}}, {new: true}, (err, masTW) => {
                    console.log(posteador, contenido)
                    if (err) return res.status(500).send({messsage: "Error en la peticion"})
                    if (!masTW) return res.status(404).send({messsage: "Error al subir el tweet"})
                    if (masTW) return res.status(200).send({tweet: tweetMOD})
                })
            }
        })
    } else {return res.status(500).send({messsage: "Ingrese los datos necesarios"})}
}


/* EDITAR TWEETS */
function edit_tweet (req, res, wtg){
    var dTweet = wtg[1]
    wtg.splice(0, 2)
    var contenido = wtg.join(" ")
    var posteador = req.user.username

    if (contenido) {
        TW.findOneAndUpdate({username: posteador, 'nTweets._id': dTweet}, {"$set": {"nTweets.$.body": contenido}}, {new: true}, (err, tweetMOD) => {
            console.log(posteador, contenido)
            if (err) return res.status(500).send({messsage: "Error en la peticion"})
            if (!tweetMOD) return res.status(404).send({messsage: "Error al editar el tweet"})
            if (tweetMOD) return res.status(200).send({tweetActualizado: tweetMOD})
        })
    } else {return res.status(500).send({messsage: "Ingrese los datos necesarios"})}
}


/* VER TWEETS */
function view_tweet (req, res, wtg){
    var nombreUSR = wtg[1]

    if (nombreUSR) {
        TW.findOne({username: nombreUSR }, (err, posts) => {
        console.log(nombreUSR)
            if (err) return res.status(500).send({messsage: "Error en la peticion"})
            if (!posts) return res.status(404).send({messsage: "Error usuario no existente"})
            if (posts) return res.status(200).send({tweetActualizado: posts})
        })
    } else {return res.status(500).send({messsage: "Ingrese los datos necesarios"})}
}


/* ELIMINAR TWEETS */
function delete_tweet (req,res, wtg){
    var dTweet = wtg[1]
    var posteador = req.user.username

    if (dTweet) {
        TW.findOne({ 'nTweets._id': dTweet }, (err, tweetEDITE) => {
            if (err) return res.status(500).send({messsage: "Error en la peticion"})
            if (!tweetEDITE) return res.status(404).send({messsage: "Error al encontrar el tweet"})
            if (tweetEDITE) {
                TW.findOneAndUpdate({username: posteador}, { $pull: { nTweets: { _id: dTweet } } }, (err, tweetDESCH) => {
                    console.log(posteador)
                    if (err) return res.status(500).send({messsage: "Error en la peticion"})
                    if (!tweetDESCH) return res.status(404).send({messsage: "Error al eliminar el tweet"})
                    if (tweetDESCH) {
                        USR.findOneAndUpdate({username: posteador}, {$inc: {"tweets": -1}}, {new: true}, (err, masTWT) => {
                            if (err) return res.status(500).send({messsage: "Error en la peticion"})
                            if (!masTWT) return res.status(404).send({messsage: "Error al eliminar el tweet seleccionado"})
                            if (masTWT) return res.status(200).send({tweetEliminado: tweetDESCH})
                        })
                    }
                })
            }
        })
    } else {return res.status(500).send({messsage: "Ingrese los datos necesarios"})}
}


/* SEGUIR */
function follow(req, res, wtg) {
    var posteador = req.user.username
    var nombreUSR = wtg[1]

    if (nombreUSR) {
        if(posteador == nombreUSR) {
            return res.status(200).send({message: "Opción invalida"})
        }else{
            FLLW.findOne({username: posteador, 'seguimientos.username': nombreUSR}, (err, usuarioS) => {
                if (err) return res.status(500).send({message: "Error en la peticion"})
                if (usuarioS) return res.status(404).send({message: "Usuario previamente seguido"})
                if (!usuarioS) {
                    USR.findOne({username: nombreUSR}, (err, buscarUSR) => {
                        if (err) return res.status(500).send({message: "Error en la peticion"});
                        if (!buscarUSR) return res.status(404).send({message: "El usuario a dejar de seguir no existe"});
                        if (buscarUSR) {
                            FLLW.findOneAndUpdate({username: posteador}, {$push:{seguimientos:{username: nombreUSR}}}, {new:true}, (err, modificarS) => {
                                if (err) return res.status(500).send({message: "Error en la peticion"})
                                if (!modificarS) return res.status(404).send({message: "Error en la peticion de seguir al usuario"})
                                if (modificarS) {
                                    USR.findOneAndUpdate({username: posteador}, {$inc:{"seguimientos": 1}}, {new:true}, (err, seguirC) => {
                                        if (err) return res.status(500).send({message: "Error en la peticion"})
                                        if (!seguirC) return res.status(404).send({message: "Error en agregar el usuario a seguir"})
                                        if (seguirC) {
                                            FW.findOneAndUpdate({username: nombreUSR}, {$push:{seguidores:{username: posteador}}}, {new:true}, (err, modificarFl) => {
                                                if (err) return res.status(500).send({message: "Error en la peticion"})
                                                if (!modificarFl) return res.status(404).send({message: "Error al agregar al seguidor"})
                                                if (modificarFl) {
                                                    USR.findOneAndUpdate({username: nombreUSR}, {$inc:{"seguidores": 1}}, {new:true}, (err, follC) => {
                                                        if (err) return res.status(500).send({message: "Error en la peticion"})
                                                        if (!follC) return res.status(404).send({message: "Error en incrementar seguidores"})
                                                        if (follC) return res.status(200).send({usuarioSeguido: modificarS})
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    } else {
        return res.status(500).send({message: "Ingrese los datos necesarios" })
    }
}


/* DEJAR DE SEGUIR */
function unfollow(req, res,wtg){
    var posteador = req.user.username
    var nombreUSR = wtg[1]

    if (nombreUSR) {
        if(posteador == nombreUSR) {
            return res.status(200).send({message: "Opción invalida"})
        }else{
            FLLW.findOne({username: posteador, 'seguimientos.username': nombreUSR}, (err, usuarioS) => {
                if (err) return res.status(500).send({message: "Error en la peticion"})
                if (!usuarioS) return res.status(404).send({message: "Error no puede eliminar de tus seguimientos a alguien que no sigues"})
                if (usuarioS) {
                    USR.findOne({username: nombreUSR}, (err, buscarUSR) => {
                        if (err) return res.status(500).send({message: "Error en la peticion"});
                        if (!buscarUSR) return res.status(404).send({message: "El usuario a dejar de seguir no existe"});
                        if (buscarUSR) {
                            FLLW.findOneAndUpdate({username: posteador}, {$pull:{seguimientos:{username: nombreUSR}}}, (err, modificarS) => {
                                if (err) return res.status(500).send({message: "Error en la peticion"})
                                if (!modificarS) return res.status(404).send({message: "Error en la peticion de dejar de seguir al usuario"})
                                if (modificarS) {
                                    USR.findOneAndUpdate({username: posteador}, {$inc:{"seguimientos": -1}}, (err, seguirC) => {
                                        if (err) return res.status(500).send({message: "Error en la peticion"})
                                        if (!seguirC) return res.status(404).send({message: "Error al dejar de seguir al usuario"})
                                        if (seguirC) {
                                            FW.findOneAndUpdate({username: nombreUSR}, {$pull:{seguidores:{username: posteador}}}, (err, modificarFl) => {
                                                if (err) return res.status(500).send({message: "Error en la peticion"})
                                                if (!modificarFl) return res.status(404).send({message: "Error al eliminar al seguidor"})
                                                if (modificarFl) {
                                                    USR.findOneAndUpdate({username: nombreUSR}, {$inc:{"seguidores": -1}}, (err, follC) => {
                                                        if (err) return res.status(500).send({message: "Error en la peticion"})
                                                        if (!follC) return res.status(404).send({message: "Error en disminuir seguidores"})
                                                        if (follC) return res.status(200).send({usuarioSeguido: modificarS})
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    } else {
        return res.status(500).send({message: "Ingrese los datos necesarios" })
    }
}


/* FUNCION PRINCIPAL COMMANDS */
function commands(req, res) {

    var params = req.body;
    var wtg = params.commands.split(" ");
    var src = wtg[0];

   if(src == "register"){
       register(req,res, wtg);
   }
   if (src == "login"){
       login(req,res, wtg);
   }
   if (src == "add_tweet"){
    add_tweet(req,res,wtg);
   } 
   if (src == "edit_tweet"){
    edit_tweet(req, res, wtg);
   }
   if (src == "delete_tweet"){
    delete_tweet(req,res,wtg);
   }
   if(src == "view_tweet"){
    view_tweet(req, res, wtg);
   }
   if(src == "follow"){
     follow(req,res, wtg);
   }
   if (src == "unfollow"){
      unfollow(req, res, wtg);
   }
   if (src == "profile"){
       profile(req, res, wtg);
   }
}


/* EXPORTACION DE FUNCION */
module.exports = {commands}
