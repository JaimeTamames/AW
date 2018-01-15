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
                response.end("Este usuario no existe");

            } else {

                response.status(200);
                var user = usuario;
                response.json({"nombre": callback.login, "id": callback.id });

            }
        }
    });
});

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

            } else {

                response.status(400);
                response.end("No se pudo crear el usuario");
            }
        }
    });
});

app.post("/crearPartida", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    var nombrePartida = request.body.nombrePartida;
    var idUsuario = request.body.idUsuario;

    daoP.crearPartida(nombrePartida, idUsuario, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback) {

                response.status(201);

            } else {

                response.status(400);
                response.end("No se pudo crear la partida");
            }
        }
    });

});

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
                
                            if (callback) {
                
                                response.status(201);
                
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

//Declaracion del middelware para las paginas no encontradas
app.use((request, response, next) => {
    response.status(404);
    response.redirect("/notFound.html");
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
