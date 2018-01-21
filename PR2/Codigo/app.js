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

    daoU.existeUsuario(usuario, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback) {

                response.status(400);
                response.end();

            } else {

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

                        }
                    }
                });

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
    var nParticipantes = null;

    daoP.existePartida(idPartida, (err, callback) => {
        if (err) {

            console.log(err);
            response.end();
        } else {  

            if (callback) {            
            
                daoP.numeroJugadoresPartida(idPartida, (err, callback) => {

                    if (err) {

                        console.log(err);
                        response.end();
                    } else {

                        if (callback === undefined) {

                            response.status(404);
                            response.end("La partida no tiene jugadores");

                        } else {

                            nParticipantes = callback;

                            //Partida llena
                            if(nParticipantes >= 4){

                                response.status(402);
                                response.end("La partida esta llena");

                            }else{
                                
                                daoP.perteneceAPartida(idPartida, idUsuario, (err, callback) => {

                                    if (err) {
                                    
                                        console.log(err);
                                        response.end();
                                        
                                    } else {
                            
                                        if (!callback) {
                                            daoP.unirsePartida(idPartida, idUsuario, (err, callback) => {

                                                if (err) {
                                        
                                                    console.log(err);
                                                    response.end();
                                                    
                                                } else {
                                        
                                                    if (callback.ok) {
                                        
                                                        response.status(201);

                                                        //Si se une el cuarto jugador se comienza la partida
                                                        if(nParticipantes === 3){

                                                            comenzarPartida(callback.idPartida);
                                                        }
                                                        
                                                        response.json({"nombrePartida": callback.nombrePartida, "idPartida": callback.idPartida});
                                        
                                                    } else {
                                        
                                                        response.status(400);
                                                        response.end();
                                                    }
                                                }
                                            });
                                        }
                                        else {
                                        
                                            response.status(400);
                                            response.end("No se pudo unir a la partida");
                                        }
                                    }
                                });
                            }  
                        }
                    }
                });
            }
           else {
           
                response.status(403); //la partida no existe
                response.end();
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
    var nombreJugador = request.query.nombreJugador;

    let partida = {
        idPartida: idPartida,
        nombrePartida: nombrePartida,
        nParticipantes: 0,
        arrayParticipantes: [{"nombre": null, "nCartas": null}, {"nombre": null, "nCartas": null}, {"nombre": null, "nCartas": null}, {"nombre": null, "nCartas": null}],
        arrayMisCartas: [],
        turno: null,
        mesa: [],
        palo: null,
        jugadaAnterior: null,
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
                partida.nParticipantes = nParicipantes;

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
            
                            daoP.estadoPartida(idPartida, (err, estadoPartida) => {

                                if (err) {
                        
                                    console.log(err);
                                    response.end();
                                } else {
                        
                                    if (estadoPartida === undefined) {
                        
                                        response.status(404);
                                        response.end("Este identificador no corresponde a ninguna partida");
                        
                                    } else {

                                        //Convierte el string en un array, con cada palabra en un indice
                                        var array = estadoPartida.split(',');

                                        //Si la partida ha empezado
                                        if(array[0] === "empezada"){

                                            let nCartas = 0;

                                            //Extraemos el orden de los jugadores
                                            for(let i = 1; i < array.length; i++){

                                                //console.log(array[i + 1]);

                                                switch (array[i]) {
                                                    case "jugador1":
                                                        partida.arrayParticipantes[0].nombre = array[i + 1];
                                                        
                                                        nCartas = 0;

                                                        if(nombreJugador === array[i + 1]){

                                                            i = i + 2;

                                                            while(array[i + 1] !== "jugador2"){

                                                                partida.arrayMisCartas.push(array[i]);
                                                                nCartas++;
                                                                i++;
                                                            }
                                                            partida.arrayMisCartas.push(array[i]);
                                                            nCartas++;
                                                            partida.arrayParticipantes[0].nCartas = nCartas;         
                                                        }else{

                                                            i = i + 2;
                                                            
                                                            while(array[i + 1] !== "jugador2"){

                                                                nCartas++;
                                                                i++;
                                                            }
                                                            nCartas++;

                                                            partida.arrayParticipantes[0].nCartas = nCartas;
                                                        }

                                                        break;
                                                    case "jugador2":
                                                        partida.arrayParticipantes[1].nombre = array[i + 1];

                                                        nCartas = 0;

                                                        if(nombreJugador === array[i + 1]){

                                                            i = i + 2;

                                                            while(array[i + 1] !== "jugador3"){

                                                                partida.arrayMisCartas.push(array[i]);
                                                                nCartas++;
                                                                i++;
                                                            }
                                                            partida.arrayMisCartas.push(array[i]);
                                                            nCartas++;
                                                            partida.arrayParticipantes[1].nCartas = nCartas; 
                                                        }else{

                                                            i = i + 2;

                                                            while(array[i + 1] !== "jugador3"){

                                                                nCartas++
                                                                i++;
                                                            }
                                                            nCartas++;

                                                            partida.arrayParticipantes[1].nCartas = nCartas;
                                                        }

                                                        break;
                                                    case "jugador3":
                                                        partida.arrayParticipantes[2].nombre = array[i + 1];

                                                        nCartas = 0;

                                                        if(nombreJugador === array[i + 1]){

                                                            i = i + 2;

                                                            while(array[i + 1] !== "jugador4"){

                                                                partida.arrayMisCartas.push(array[i]);
                                                                nCartas++;
                                                                i++;
                                                            }
                                                            partida.arrayMisCartas.push(array[i]);
                                                            nCartas++;
                                                            partida.arrayParticipantes[2].nCartas = nCartas; 
                                                        }else{

                                                            i = i + 2;

                                                            while(array[i + 1] !== "jugador4"){

                                                                nCartas++
                                                                i++;
                                                            }
                                                            nCartas++;

                                                            partida.arrayParticipantes[2].nCartas = nCartas;
                                                        }

                                                        break;
                                                    case "jugador4":
                                                        partida.arrayParticipantes[3].nombre = array[i + 1];

                                                        nCartas = 0;

                                                        if(nombreJugador === array[i + 1]){

                                                            i = i + 2;

                                                            while(array[i + 1] !== "turno"){

                                                                partida.arrayMisCartas.push(array[i]);
                                                                nCartas++;
                                                                i++;
                                                            }
                                                            partida.arrayMisCartas.push(array[i]);
                                                            nCartas++;
                                                            partida.arrayParticipantes[3].nCartas = nCartas; 
                                                        }else{

                                                            i = i + 2;

                                                            while(array[i + 1] !== "turno"){

                                                                nCartas++
                                                                i++;
                                                            }
                                                            nCartas++;

                                                            partida.arrayParticipantes[3].nCartas = nCartas;
                                                        }

                                                        break;
                                                    case "turno":
                                                        partida.turno = array[i + 1];
                                                        break;
                                                    case "mesa":
                                                        partida.mesa = array[i + 1];
                                                        break;
                                                    case "palo":
                                                        partida.palo = array[i + 1];
                                                        break;
                                                    case "jugadaAnterior":
                                                        partida.jugadaAnterior = array[i + 1];
                                                        break;                
                                                }
                                            }
                                        }else{

                                            partida.arrayParticipantes = arrayParticipantes;
                                            
                                        }

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

//Juega las cartas seleccionadas
app.post("/jugarCartas", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    let vCartas = request.body.vCartas;
    let nombreUsuario = request.body.nombreUsuario;
    let idPartida = request.body.idPartida;
    let palo = request.body.palo;

    let partida = {
        idPartida: idPartida,
        nombrePartida: nombrePartida,
        nParticipantes: 0,
        arrayParticipantes: [{"nombre": null, "nCartas": null}, {"nombre": null, "nCartas": null}, {"nombre": null, "nCartas": null}, {"nombre": null, "nCartas": null}],
        arrayMisCartas: [],
        turno: null,
        mesa: [],
        palo: palo,
        jugadaAnterior: null,
        estado: null,
    }

    console.log(partida);

    daoP.estadoPartida(idPartida, (err, estado) => {

        if (err) {

            console.log(err);
            response.end();
        } else{ 
            
            if (estado === undefined) {
                        
                response.status(404);
                response.end("Este identificador no corresponde a ninguna partida");

            } else {

                //Buscar las cartas jugadas, quitarselas al jugador, meterlas en la mesa, meter el palo, pasar el turno
                

                //Convierte el string en un array, con cada palabra en un indice
                var array = estado.split(',');

                //Elimina las cartas seleccionadas de la mano del jugador
                for(let j = 0; j < vCartas.length; j++){
            
                    //Splice(position, numberOfItemsToRemove, itemInsert)
                    array.splice(array.indexOf(vCartas[j]), 1);
                    array.splice(array.indexOf("mesa") + j + 1, 0, vCartas[j]);
                }

                


                response.status(200);
                response.json(partida);
            }

        }
    });
});


//Comienza una partida, repartiendo las cartas y los turnos
function comenzarPartida(idPartida){

    let estado = "empezada,";
    let jugador1 = "jugador1,";
    let jugador2 = "jugador2,";
    let jugador3 = "jugador3,";
    let jugador4 = "jugador4,";
    let turno = "turno,";

    daoP.participantesDePartida(idPartida, (err, jugadores) => {

        if (err) {

            console.log(err);
            //response.end();
        } else {

            if (jugadores === undefined) {

                //response.status(404);
                //response.end("Este identificador no corresponde a ninguna partida");

            } else {

                //response.status(200);

                let i = 0;

                //Orden de jugadores aleatorio
                while(jugadores.length) {
                    
                    var index = Math.floor( Math.random()*jugadores.length );
                    //console.log( baraja[index] ); // Muestra la carta elegida                    
            
                    switch (i) {
                        case 0:
                            jugador1 = jugador1 + jugadores[index].nombre + ",";
                            turno = turno + jugadores[index].nombre + ",";
                            break;
                        case 1:
                            jugador2 = jugador2 + jugadores[index].nombre + ",";
                            break;
                        case 2:
                            jugador3 = jugador3 + jugadores[index].nombre + ",";
                            break;
                        case 3:
                         jugador4 = jugador4 + jugadores[index].nombre + ",";
                            break;
                    }

                    //Siguiente jugador
                    i++;
            
                    // Elimina un jugador del array
                    jugadores.splice( index, 1 );
                }

                let aux = repartirCartas(jugador1, jugador2, jugador3, jugador4);
                
                //Repartimos cartas aleatoriamente
                let partida = estado + aux;

                //Añadir turno
                partida = partida + turno;

                //Añadir mesa
                partida = partida + "mesa,null,";

                //Añadir palo
                partida = partida + "palo,null,";

                //Añadir jugada anterior
                partida = partida + "jugadaAnterior,null,";

                //Guadar estado de partida
                daoP.guardarPartida(idPartida, partida, (err, callback) => {

                    if (err) {
            
                        console.log(err);
                        //response.end();
                    } else {
                        
            
                    }
                });
            } //fin del else final
        }
    });
}

//Funcion que reparte las cartas aleatoriamente entre los jugadores
function repartirCartas(jugador1, jugador2, jugador3, jugador4){

    let baraja = cartas;
    let i = 0;

    while(baraja.length) {
                    
        var index = Math.floor( Math.random()*baraja.length );
        //console.log( baraja[index] ); // Muestra la carta elegida                    

        switch (i) {
            case 0:
                jugador1 = jugador1 + baraja[index] + ",";
                break;
            case 1:
                jugador2 = jugador2 + baraja[index] + ",";
                break;
            case 2:
                jugador3 = jugador3 + baraja[index] + ",";
                break;
            case 3:
             jugador4 = jugador4 + baraja[index] + ",";
                break;
        }

        //Siguiente jugador
        i++;

        //Si llegamos al ultimo jugador volvemos al primero
        if(i === 4){
            i = 0;
        }

        // Elimina una carta del array
        baraja.splice( index, 1 );
    }

    let aux = jugador1 + jugador2 + jugador3 + jugador4;

    return aux;
}

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

//Constante de la baraja
const cartas = [ "2_C", "2_D", "2_H", "2_S", "3_C", "3_D", "3_H", "3_S", "4_C", "4_D", "4_H", "4_S", "5_C", "5_D", "5_H", "5_S", "6_C", "6_D", "6_H", "6_S", "7_C", "7_D", "7_H", "7_S", "8_C", "8_D", "8_H", "8_S", "9_C", "9_D", "9_H", "9_S", "10_C", "10_D", "10_H", "10_S", "J_C", "J_D", "J_H", "J_S", "Q_C", "Q_D", "Q_H", "Q_S", "K_C", "K_D", "K_H", "K_S", "A_C", "A_D", "A_H", "A_S"];