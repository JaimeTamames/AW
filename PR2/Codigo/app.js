/* global __dirname */

"use strict";

const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const config = require("./config");
const daoUsers = require("./dao_users_jm");
const daoPartidas = require("./dao_partidas_jm");
const express_session = require("express-session");
const express_mysql_session = require("express-mysql-session");
const MySQLStore = express_mysql_session(express_session);

var passport = require("passport");
var passportHTTP = require("passport-http");

let app = express();

//Configuracion de la BBDD
const sessionStore = new MySQLStore({

    database: config.mysqlConfig.dbName,
    host: config.mysqlConfig.dbHost,
    user: config.mysqlConfig.dbUser,
    password: config.mysqlConfig.dbPassword
});

//Pool de conexiones a la BBDD
let pool = mysql.createPool({
    database: config.mysqlConfig.dbName,
    host: config.mysqlConfig.dbHost,
    user: config.mysqlConfig.dbUser,
    password: config.mysqlConfig.dbPassword
});

//DAOs
let daoU = new daoUsers.DAOUsers(pool);
let daoP = new daoPartidas.DAOPartidas(pool);

//Middleware sesion
const middlewareSession = express_session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});
app.use(middlewareSession);

//Middelware passport
app.use(passport.initialize());

passport.use(new passportHTTP.BasicStrategy(
    { realm: 'Autenticacion requerida' },
    function(user, pass, callback) {

        daoU.usuarioCorrecto(user, pass, (err, ok) => {

            if (err) {
    
                console.log(err);
                response.end();
            } else {
    
                if (!ok) {

                    callback(null, false);
    
                } else {
    
                    callback(null, { userId: user });
                }
            }
        });
    }
));

//Ficheros estaticos
app.use(express.static(path.join(__dirname, "public")));

//Declaracion del middelware bodyParser para obtener el contenido de la peticion post
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get("/", (request, response) => {
    response.redirect("/index.html");
});

//Comprueba que exista el usuario, si es asi se loguea
app.post("/login", function(request, response) {

    var usuario = request.body.usuario;
    var contraseña = request.body.contraseña;

    daoU.usuarioCorrecto(usuario, contraseña, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (!callback) {

                response.status(400);
                response.end("Este usuario y/o contraseña no existe");

            } else {

                response.status(200);
                response.json({"nombre": callback.login, "id": callback.id});
            }
        }
    });
});

//Da de alta un nuevo usuario
app.post("/nuevoUsuario", function(request, response) {

    var usuario = request.body.usuario;
    var contraseña = request.body.contraseña;

    daoU.nuevoUsuario(usuario, contraseña, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback) {

                response.status(201);
                response.json({"nombre": usuario});


            } else {

                response.status(400);
                response.end("Este usuario ya existe");
            }
        }
    });
});

//Crea una partida con el nombre y añade al jugador a ella
app.post("/crearPartida", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    var nombrePartida = request.body.nombrePartida;
    var idUsuario = request.body.idUsuario;

    daoP.crearPartida(nombrePartida, idUsuario, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback.ok) {

                response.status(201);
                response.json({"nombrePartida": callback.nombrePartida, "idPartida": callback.idPartida });

            } else {

                response.status(400);
                response.end("No se pudo crear la partida");
            }
        }
    });

});

//Une al jugador a la partida si no esta llena
app.post("/unirsePartida", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    var idPartida = request.body.idPartida;
    var idUsuario = request.body.idUsuario;

    daoP.numeroJugadoresPartida(idPartida, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback === undefined) {

                response.status(404);
                response.end("La partida no tiene jugadores");

            } else {

                if(callback.num >= 4){
                    response.status(400);
                    response.end("La partida esta llena");
                }else{
            
                    daoP.unirsePartida(idPartida, idUsuario, (err, callback) => {

                        if (err) {
                
                            console.log(err);
                            response.end();
                        } else {
                
                            if (callback.ok) {
                
                                response.status(201);
                                response.json({"nombrePartida": callback.nombrePartida, "idPartida": callback.idPartida});
                
                            } else {
                
                                response.status(400);
                                response.end("No se pudo unir a la partida");
                            }
                        }
                    });
                }  
            }
        }
    });
});

//Comprueba y devuelve en que partidas participa el usuario
app.get("/participaEnPartidas", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    var idUsuario = request.query.idUsuario;

    daoP.participaEnPartidas(idUsuario, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback === undefined) {

                response.end("El usuario no participa en ninguna partida");

            } else {

                response.status(200);
                response.json(callback);
            }
        }
    });
});

//Devuelve los participantes de una partida
app.get("/participantesDePartida", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    var idPartida = request.query.idUsuario;

    daoP.participantesDePartida(idPartida, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback === undefined) {

                response.status(404);
                response.end("Este identificador no corresponde a ninguna partida");

            } else {

                response.status(200);
                response.json(callback);
            }
        }
    });
});

//Devuelve el estado de una partida
app.get("/estadoPartida", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    var idPartida = request.query.idPartida;
    var nombrePartida = request.query.nombrePartida;

    let partida = {
        idPartida: idPartida,
        nombrePartida: nombrePartida,
        nParticipantes: null,
        arrayParticipantes: null,
        estado: null,
    }

    daoP.numeroJugadoresPartida(idPartida, (err, nParicipantes) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (nParicipantes === undefined) {

                response.status(404);
                response.end("Esta partida no tiene jugadores");

            } else {

                response.status(200);
                partida.nParticipantes = nParicipantes.num;

                daoP.participantesDePartida(idPartida, (err, arrayParticipantes) => {

                    if (err) {
            
                        console.log(err);
                        response.end();
                    } else {
            
                        if (arrayParticipantes === undefined) {
            
                            response.status(404);
                            response.end("Esta partida no tiene jugadores");
            
                        } else {
            
                            response.status(200);
                            partida.arrayParticipantes = arrayParticipantes;
            
                            daoP.estadoPartida(idPartida, (err, estadoPartida) => {

                                if (err) {
                        
                                    console.log(err);
                                    response.end();
                                } else {
                        
                                    if (estadoPartida === undefined) {
                        
                                        response.status(404);
                                        response.end("Este identificador no corresponde a ninguna partida");
                        
                                    } else {

                                        partida.estado = estadoPartida;

                                        response.status(200);
                                        response.json(partida);
                                    }
                                }
                            });   
                        }
                    }
                });
            }
        }
    });
});

//Declaracion del middelware para las paginas no encontradas
app.use((request, response, next) => {
    response.status(404);
    response.end("Not found: " + request.url);
});

//Estado del servidor
app.listen(config.mysqlConfig.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.");
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.mysqlConfig.port}.`);
    }
});
