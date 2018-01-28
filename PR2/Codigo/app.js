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

//HTTPS
var https = require("https");
var fs = require("fs");
var clavePrivada = fs.readFileSync("./certificados/mi_clave.pem");
var certificado = fs.readFileSync("./certificados/certificado_firmado.crt");

let app = express();

//HTTPS
var servidor = https.createServer(
    { key: clavePrivada, cert: certificado }, app);

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
    var nombreUsuario = request.body.nombreUsuario;

    let usuario = {
        nombre: nombreUsuario,
        id: idUsuario,
        nCartas: 0,
        mano: [],
    };

    let partida = {
        jugador: [],
        nJugadores: 1,
        nombre: nombrePartida,
        id: 0,
        ganada: false,
        mentiroso: false,
        turno: "",
        mesa: {
            valorCartas: [],
            valorCartasMentiroso: [],
            nCartasMesa: 0,
            jugadorAnterior: "",
            ncartasjugadorAnterior: 0,
            mensaje: "",
            numeroJugado: "", 
        },
    };

    //Introducimos los valores del jugador que la creo
    partida.jugador.push(usuario);

    daoP.crearPartida(nombrePartida, idUsuario, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (callback.ok) {

                partida.id = callback.idPartida;

                //Para mandar al DAO
                let estado = JSON.stringify(partida);

                //Añadimos al historial de la partida
                let mensaje = "@" + nombreUsuario + " ha creado la partida " + nombrePartida;

                daoP.añadeHistorial(partida.id, mensaje, (err, callback) => {

                    if (err) {
                        console.log(err);
                        response.end();
                    }else{
                        //Guadar estado de partida
                        daoP.guardarPartida(partida.id, estado, (err, callback) => {
            
                            if (err) {
                                
                                console.log(err);
                            } else {                      
            
                                response.status(201);
                                response.json({"partida": partida});
                            }
                        });
                    }
                });

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
    var nombreUsuario = request.body.nombreUsuario;

    daoP.estadoPartida(idPartida, (err, estadoPartida) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (estadoPartida === undefined) {

                response.status(404);
                response.end("Este identificador no corresponde con ninguna partida");

            } else {

                let partida = JSON.parse(estadoPartida);

                //Partida llena
                if(partida.nJugadores === 4){

                    response.status(402);
                    response.end("La partida esta llena");

                }else{

                    let pertenece = false;

                    for(let i = 0; i < partida.jugador.length; i++){

                        if(partida.jugador[i].id === idUsuario){
                            pertenece = true;
                        }
                    }

                    //Comprobamos si el jugador pertenece a la partida
                    if(pertenece){

                        response.status(400);
                        response.end("Ya perteneces a esta partida");

                    }else{

                        daoP.unirsePartida(idPartida, idUsuario, (err, callback) => {

                            if (err) {
                    
                                console.log(err);
                                response.end();
                                
                            } else {
                    
                                if (callback) {
                    
                                    response.status(201);

                                    //Metemos el usuario en la partida
                                    let usuario = {
                                        nombre: nombreUsuario,
                                        id: idUsuario,
                                        nCartas: 0,
                                        mano: [],
                                    };

                                    partida.jugador.push(usuario);
                                    partida.nJugadores++;

                                    //Si se une el cuarto jugador se comienza la partida
                                    if(partida.nJugadores === 4){

                                        comenzarPartida(partida);
                                    }

                                    //Para mandar al DAO
                                    let estado = JSON.stringify(partida);

                                    //Añadimos al historial de la partida
                                    let mensaje = "@" + nombreUsuario + " se ha unido a la partida";

                                    daoP.añadeHistorial(idPartida, mensaje, (err, callback) => {

                                        if (err) {
                                            console.log(err);
                                            response.end();
                                        }else{
                                            //Guadar estado de partida
                                            daoP.guardarPartida(idPartida, estado, (err, callback) => {
                                
                                                if (err) {
                                                    
                                                    console.log(err);
                                                    response.end();
                                                } else {                      
                                
                                                    response.status(200);
                                                    response.json({"nombre": partida.nombre, "id": partida.id});
                                                }
                                            });
                                        }
                                    });

                                } else {
                                    
                                    response.status(400);
                                    response.end();
                                }
                            }
                        });
                    }
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
    var nombreJugador = request.query.nombreJugador;

    daoP.estadoPartida(idPartida, (err, estadoPartida) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (estadoPartida === undefined) {

                response.status(404);
                response.end("Este identificador no corresponde a ninguna partida");

            } else {

                let partida = JSON.parse(estadoPartida);

                //Antes de pasar la partida al cliente quitamos los datos que no debe ver
                partida.mesa.valorCartas = null;
                partida.jugador.forEach(elem => {

                    if(elem.nombre !== nombreJugador){

                        elem.mano = null;
                    }
                });

                //Buscamos el historial
                daoP.buscarHistorial(idPartida, (err, callback) => {

                    if (err) {
            
                        console.log(err);
                        response.end();
                    } else {   
                        
                        response.status(200);
                        response.json({partida: partida, historial: callback.reverse()});
                    }
                }); 
            }
        }
    }); 
});

//Juega las cartas seleccionadas, actualiza el estado de la partida
app.post("/jugarCartas", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
    
    let vCartas = request.body.vCartas;
    let nombreUsuario = request.body.nombreUsuario;
    let idPartida = request.body.idPartida;
    let numeroJugado = request.body.numeroJugado;

    daoP.estadoPartida(idPartida, (err, estadoPartida) => {

        if (err) {

            console.log(err);
            response.end();
        } else{ 
            
            if (estadoPartida === undefined) {
                        
                response.status(404);
                response.end("Este identificador no corresponde a ninguna partida");

            } else {
                
                //Buscar las cartas jugadas, quitarselas al jugador, meterlas en la mesa, meter el palo, pasar el turno, actualizar ultima jugada  
                let partida = JSON.parse(estadoPartida);

                //Reinicializar mentiroso por si se marco anteriormente
                partida.mentiroso = false;
                partida.mesa.valorCartasMentiroso = [];
         
                let indice = -1;

                //Buscamos el indice de nuestro usuario
                partida.jugador.forEach(function(elem, index) {
                    
                    if(elem.nombre === nombreUsuario){
                        indice = index;
                    }
                });

                //Elimina las cartas seleccionadas de la mano del jugador y meterlas en la mesa
                for(let j = 0; j < vCartas.length; j++){

                    //Quita de la mano
                    partida.jugador[indice].mano.splice(partida.jugador[indice].mano.indexOf(vCartas[j]), 1);

                    //Pone en la mesa
                    partida.mesa.valorCartas.push(vCartas[j]);

                    //Aumenta numero de cartas en la mesa
                    partida.mesa.nCartasMesa++;

                    //Disminulle el numero de cartas del jugador
                    partida.jugador[indice].nCartas--;
                }

                //Actualiza numeroJugado
                if(numeroJugado !== "noCambia"){

                    partida.mesa.numeroJugado = numeroJugado;
                }

                //Añadimos al historial de la partida
                let mensaje = "@" + nombreUsuario + " ha colocado " + vCartas.length + " " + partida.mesa.numeroJugado + "'s";       
                daoP.añadeHistorial(partida.id, mensaje, (err, callback) => {

                    if (err) {
                        console.log(err);
                        response.end();
                    }else{
                        
                    }
                });

                if(partida.jugador[indice].nCartas === 0){

                    partida.ganada = true;

                    //Añadimos al historial de la partida
                    let mensaje = "@" + nombreUsuario + " ha ganado la partida!";    
                    daoP.añadeHistorial(partida.id, mensaje, (err, callback) => {

                        if (err) {
                            console.log(err);
                            response.end();
                        }else{
                            
                        }
                    });
                }

                //Pasamos el turno
                if(indice === 3){
                    indice = 0
                }else{
                    indice++;
                }

                //Cambia el turno
                partida.turno = partida.jugador[indice].nombre;

                //Actualizar ultima jugada
                partida.mesa.jugadorAnterior = nombreUsuario;
                partida.mesa.ncartasjugadorAnterior = vCartas.length
                partida.mesa.mensaje = nombreUsuario + " dice que ha colocado " + vCartas.length + " " + partida.mesa.numeroJugado + "'s";
                
                let estado = JSON.stringify(partida);
                
                //Guadar estado de partida
                daoP.guardarPartida(idPartida, estado, (err, callback) => {

                    if (err) {
            
                        console.log(err);
                        response.end();
                    } else {   
                        
                        response.status(200);
                        response.end();
                    }
                });   
            }
        }
    });
});

//Realiza las comprobaciones de mentiroso
app.post("/mentiroso", passport.authenticate('basic', { failureRedirect: '/', failureFlash: true, session: false}), function(request, response) {
 
    let idPartida = request.body.idPartida;
    let nombreUsuario = request.body.nombreUsuario;
    let mentiroso = false;

    daoP.estadoPartida(idPartida, (err, estadoPartida) => {

        if (err) {

            console.log(err);
            response.end();
        } else{ 
            
            if (estadoPartida === undefined) {
                        
                response.status(404);
                response.end("Este identificador no corresponde a ninguna partida");

            } else {

                let partida = JSON.parse(estadoPartida);

                partida.mesa.valorCartas.reverse();

                partida.mesa.mensaje = "";

                partida.mentiroso = true;

                //Comprobamos si el jugador anterior mintio o no
                for(let i = 0; i < partida.mesa.ncartasjugadorAnterior; i++){
                    
                    if(partida.mesa.valorCartas[i].charAt(0) === partida.mesa.numeroJugado && !mentiroso){

                        mentiroso = false;                    
                    }else{
                        mentiroso = true;
                    }

                    partida.mesa.valorCartasMentiroso.push(partida.mesa.valorCartas[i]);
                }

                let indice = -1

                //Sacamos el indice del jugador al que le vamos a meter todas las cartas
                if(mentiroso){

                    partida.jugador.forEach(function(elem, index) {
                    
                        if(elem.nombre === partida.mesa.jugadorAnterior){
                            indice = index;
                        }
                    });

                    //Añadimos al historial de la partida
                    let mensaje = "@" + nombreUsuario + " ha destapado al mentiroso de " + partida.mesa.jugadorAnterior + ", no echo "  + partida.mesa.ncartasjugadorAnterior + " " + partida.mesa.numeroJugado + "'s";   
                    daoP.añadeHistorial(partida.id, mensaje, (err, callback) => {

                        if (err) {
                            console.log(err);
                            response.end();
                        }else{
                            
                        }
                    });

                    partida.mesa.mensaje += partida.mesa.jugadorAnterior + " es un mentiroso, no echo " + partida.mesa.ncartasjugadorAnterior + " " + partida.mesa.numeroJugado + "'s!!";
                    
                }else{

                    partida.jugador.forEach(function(elem, index) {
                    
                        if(elem.nombre === nombreUsuario){
                            indice = index;
                        }
                    });

                    //Añadimos al historial de la partida
                    let mensaje = "@" + nombreUsuario + " ha destapado al honrado de " + partida.mesa.jugadorAnterior + ", si echo "  + partida.mesa.ncartasjugadorAnterior + " " + partida.mesa.numeroJugado + "'s";   
                    daoP.añadeHistorial(partida.id, mensaje, (err, callback) => {

                        if (err) {
                            console.log(err);
                            response.end();
                        }else{
                            
                        }
                    });

                    partida.mesa.mensaje += partida.mesa.jugadorAnterior + " no es un mentiroso, si echo " + partida.mesa.ncartasjugadorAnterior + " " + partida.mesa.numeroJugado + "'s!!";
                    
                }

                //Sacamos las cartas de la mesa y se las metemos en la mano
                while(partida.mesa.valorCartas.length){

                    partida.jugador[indice].mano.push(partida.mesa.valorCartas.pop());
                    partida.jugador[indice].nCartas++;
                }

                //Actualiza datos de la mesa
                partida.mesa.numeroJugado = "";
                partida.mesa.ncartasjugadorAnterior = 0;
                partida.mesa.nCartasMesa = 0;
                partida.mesa

                let estado = JSON.stringify(partida);

                //Guadar estado de partida
                daoP.guardarPartida(idPartida, estado, (err, callback) => {

                    if (err) {
            
                        console.log(err);
                        response.end();
                    } else {                      
            
                        response.status(200);
                        response.json({mentiroso: mentiroso});
                    }
                });
            }
        }
    });
});

//Comienza una partida, repartiendo las cartas y los turnos
function comenzarPartida(partida){

    let ok = true;

    let jugadorAux = partida.jugador.slice();;

    let i = 0;

    //Orden de jugadores aleatorio
    while(jugadorAux.length) {

        var index = Math.floor( Math.random()*jugadorAux.length);

        //Asignamos el turno del primer jugador
        if(ok){
            partida.turno = jugadorAux[index].nombre;
            ok = false;
        }

        //Sobreescribimos los jugadores en la partida dando un orden aleatorio
        partida.jugador[i] = jugadorAux[index];

        i++;

        // Elimina un jugador del array
        jugadorAux.splice(index, 1);
    }

    //Se reparten las cartas aleatoriamente
    partida.jugador = repartirCartas(partida.jugador);

    partida.mesa.mensaje = "Aun no se han jugado cartas, esperando primera mano...";           

    let estado = JSON.stringify(partida);

    //Añadimos al historial de la partida
    let mensaje = "@Server la partida ha comenzado"; 

    daoP.añadeHistorial(partida.id, mensaje, (err, callback) => {

        if (err) {
            console.log(err);
        }else{
            //Guadar estado de partida
            daoP.guardarPartida(partida.id, estado, (err, callback) => {

                if (err) {
                    
                    console.log(err);
                } else {                      

                }
            });
        }
    });
}

//Funcion que reparte las cartas aleatoriamente entre los jugadores
function repartirCartas(jugador){

    let baraja = cartas;
    let i = 0;

    //console.log(jugador[0]);

    while(baraja.length) {
                    
        var index = Math.floor( Math.random()*baraja.length );                 

        jugador[i].mano.push(baraja[index]);
        jugador[i].nCartas++;

        //Siguiente jugador
        i++;

        //Si llegamos al ultimo jugador volvemos al primero
        if(i === 4){
            i = 0;
        }

        // Elimina una carta del array
        baraja.splice(index, 1);
    }

    return jugador;
}

//Declaracion del middelware para las paginas no encontradas
app.use((request, response, next) => {
    response.status(404);
    response.end("Not found: " + request.url);
});

//Servidor https
servidor.listen(5555, function(err) {
    console.log("Escuchando en puerto 5555");
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