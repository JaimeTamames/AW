/* global __dirname */

"use strict";

const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const config = require("./config");
const express_session = require("express-session");
const express_mysql_session = require("express-mysql-session");
const MySQLStore = express_mysql_session(express_session);

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

//Middleware sesion
const middlewareSession = express_session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});
app.use(middlewareSession);

//Estado del servidor
app.listen(config.mysqlConfig.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.");
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.mysqlConfig.port}.`);
    }
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Ficheros estaticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

//Declaracion del middelware bodyParser para obtener el contenido de la peticion post
app.use(bodyParser.urlencoded({extended: false}));

//Declaracion del middelware para las paginas no encontradas
app.use((request, response, next) => {
    response.status(404);
    response.end("Not found: " + request.url);
});

//Middelware que comprueba si se esta logeado
function userLog (request, response, next){
    
    if(request.session.UserMail)
        next();
    else
        response.redirect("/");
}

app.get("/", (request, response) => {
    response.redirect("/main.html");
});
