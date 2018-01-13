//Jaime Tamames y Ruben Barrado

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoUsers = require("./dao_users_fb");
const daoFriends = require("./dao_friends_fb");
const daoQuestions = require("./dao_questions_fb");
const express_session = require("express-session");
const express_mysql_session = require("express-mysql-session");
var expressValidator = require("express-validator");
const MySQLStore = express_mysql_session(express_session);
const app = express();

const sessionStore = new MySQLStore({

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

let pool = mysql.createPool({
    database: config.mysqlConfig.dbName,
    host: config.mysqlConfig.dbHost,
    user: config.mysqlConfig.dbUser,
    password: config.mysqlConfig.dbPassword
});

//Pool de conexiones a la BBDD
let daoU = new daoUsers.DAOUsers(pool);
let daoF = new daoFriends.DAOFriends(pool);
let daoQ = new daoQuestions.DAOQuestions(pool);

//Estado del servidor
app.listen(config.mysqlConfig.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.");
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.mysqlConfig.port}.`);
    }
});

//Ficheros estaticos
const ficherosEstaticos = path.join(__dirname, "public");
app.use(express.static(ficherosEstaticos));

//Plantillas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Declaracion del middelware bodyParser para obtener el contenido de la peticion post
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());

//Middelware que comprueba si se esta logeado
function userLog (request, response, next){
    
    if(request.session.UserMail)
        next();
    else
        response.redirect("/");
}

//Pagina principal
app.get("/", (request, response) => {

    response.status(200);
    response.redirect("/index");
});

//Pagina principal
app.get("/index", (request, response) => {

    response.status(200);
    response.render("index", {errorMsg: null});
});

//Pagina principal
app.get("/index.html", (request, response) => {

    response.status(200);
    response.render("index", {errorMsg: null});
});

//Login, boton conectar de la pagina index
app.post("/conectar", (request, response) => {

    let userMail = request.body.email;
    let userPass = request.body.pass;

    daoU.isUserCorrect(userMail, userPass, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();
        } else {

            if (!callback) {

                response.status(400);
                response.render("index", {errorMsg: "Dirección de correo y/o contraseña no validos"});
            } else {

                response.status(200);

                daoU.getUser(userMail, (err, user) => {
                    if (err) {
                        console.log(err);
                        response.end();
                    } else {

                        request.session.UserMail = user.email;
                        request.session.UserName = user.nombre;
                        request.session.UserPass = user.password;
                        request.session.UserImg = user.img;
                        request.session.UserSex = user.sexo;
                        request.session.UserPoints = user.puntuacion;
                        request.session.UserDate = user.fechaNacimiento;
                        request.session.UserAge = getAge(user.fechaNacimiento);
                        

                        //Renderizar plantilla
                        response.locals.UserImg = request.session.UserImg;
                        response.locals.UserPoints = request.session.UserPoints;
                        response.locals.UserName = request.session.UserName;
                        response.locals.UserAge = request.session.UserAge;
                        response.locals.UserSex = request.session.UserSex;
                        response.render("myProfile");

                    }
                });
            }
        }
    });
});

//Pagina nuevo usuario
app.get("/nuevoUsuario", (request, response) => {

    response.status(200);
    response.render("newUser", {errores: [], usuario: {}});
});

//Alta usuario, boton crear usuario de la pagina newUser
app.post("/altaNuevoUsuario", (request, response) => {

    request.checkBody("email", "Dirección de correo no válida").notEmpty().isEmail();
    request.checkBody("pass", "La contraseña debe tener entre 6 y 20 caracteres").notEmpty().isLength({min: 6, max: 20});
    request.checkBody("nombre", "Nombre de usuario vacío").notEmpty();
    request.checkBody("fechaNacimiento", "Fecha de nacimiento no válida").notEmpty().isBefore();
    request.getValidationResult().then((result) => {
        if (result.isEmpty()) {

            //Datos para dar de alta el usuario
            let user = {
                email: request.body.email,
                pass: request.body.pass,
                nombre: request.body.nombre,
                sexo: request.body.sexo,
                fechaNacimiento: request.body.fechaNacimiento,
                img: request.body.img,
                exist: null
            };

            //Acotar si se ha añadido la imagen		
            if (user.img === undefined || user.img === '') {
                user.img = "profile_imgs/NoProfile.png";
            } else {
                user.img = "/profile_imgs/" + user.img;
            }

            daoU.existUser(user, (err, callback) => {

                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    if (!callback) {

                        daoU.addUser(user, (err, callback) => {

                            if (err) {
                                console.log(err);
                                response.end();
                            } else {

                                response.status(200);

                                //Variables para cargar el perfil
                                request.session.UserName = user.nombre;
                                request.session.UserAge = getAge(user.fechaNacimiento); //Convetir a edad
                                request.session.UserDate = user.fechaNacimiento;
                                request.session.UserPoints = 0;
                                request.session.UserSex = user.sexo;
                                request.session.UserMail = user.email;
                                request.session.UserImg = user.img;

                                //Renderizar plantilla
                                response.locals.UserImg = request.session.UserImg;
                                response.locals.UserPoints = request.session.UserPoints;
                                response.locals.UserName = request.session.UserName;
                                response.locals.UserAge = request.session.UserAge;
                                response.locals.UserSex = request.session.UserSex;
                                response.render("myProfile");
                            }
                        });

                    } else {

                        let error1 = "Este usuario ya esta dado de alta";
                        //Datos introducidos que se devuelven para no escribirlos de nuevo
                        let usuarioIncorrecto = {
                            email: request.body.email,
                            pass: request.body.pass,
                            nombre: request.body.nombre,
                            sexo: request.body.sexo,
                            fechaNacimiento: request.body.fechaNacimiento,
                            img: request.body.img,
                            exist: error1
                        };

                        response.render("newUser", {errores: result.mapped(), usuario: usuarioIncorrecto});
                    }
                }
            });


        } else {

            //Datos introducidos que se devuelven para no escribirlos de nuevo
            let usuarioIncorrecto = {
                email: request.body.email,
                pass: request.body.pass,
                nombre: request.body.nombre,
                sexo: request.body.sexo,
                fechaNacimiento: request.body.fechaNacimiento,
                img: request.body.img,
                exist: null
            };

            response.render("newUser", {errores: result.mapped(), usuario: usuarioIncorrecto});
        }
    });
});

//Pagina mi perfil
app.get("/myProfile", userLog, (request, response) => {

    response.status(200);

    response.locals.UserImg = request.session.UserImg;
    response.locals.UserPoints = request.session.UserPoints;
    response.locals.UserName = request.session.UserName;
    response.locals.UserAge = request.session.UserAge;
    response.locals.UserSex = request.session.UserSex;

    response.render("myProfile");
});

//Pagina modificar perfil
app.get("/modificarPerfil", userLog, (request, response) => {

    response.status(200);

    response.locals.UserImg = request.session.UserImg;
    response.locals.UserPoints = request.session.UserPoints;
    response.locals.UserName = request.session.UserName;
    response.locals.UserPass = request.session.UserPass;
    response.locals.UserDate = request.session.UserDate;
    response.locals.UserSex = request.session.UserSex;

    response.render("myProfileAdmin", {errores: []});
});

//Aplicar cambios, boton de la pagina myProfileAdmin
app.post("/aplicarCambiosPerfil", userLog, (request, response) => {

    request.checkBody("nombre", "Nombre de usuario vacío").notEmpty();
    request.checkBody("fechaNacimiento", "Fecha de nacimiento no válida").notEmpty().isBefore();

    if (request.body.pass !== "") {
        request.checkBody("pass", "La contraseña debe tener entre 6 y 20 caracteres").notEmpty().isLength({min: 6, max: 20});
    }

    request.getValidationResult().then((result) => {
        if (result.isEmpty()) {

            //Datos para modificar el usuario
            let user = {
                nombre: request.body.nombre,
                email: request.session.UserMail,
                pass: request.body.pass,
                fechaNacimiento: request.body.fechaNacimiento,
                sexo: request.body.sexo,
                img: request.body.img
            };

            //Acotar si se ha modificado la imagen		
            if (user.img === undefined || user.img === '') {
                user.img = request.session.UserImg;
            } else {
                user.img = "/profile_imgs/" + user.img;
            }

            daoU.setUser(user, (err, callback) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    request.session.UserName = user.nombre;
                    request.session.UserAge = getAge(user.fechaNacimiento); //Convetir a edad
                    request.session.UserDate = user.fechaNacimiento;
                    request.session.UserSex = user.sexo;
                    request.session.UserImg = user.img;

                    response.locals.UserImg = request.session.UserImg;
                    response.locals.UserPoints = request.session.UserPoints;
                    response.locals.UserName = request.session.UserName;
                    response.locals.UserAge = request.session.UserAge;
                    response.locals.UserSex = request.session.UserSex;
                    response.render("myProfile");
                }
            });            			
        } else {

            //No devolvemos datos introducidos previamente, pueden crear confusion de si estan ya cambiados o no, pero si errores       
            response.render("myProfileAdmin", {errores: result.mapped()});
        }
    });
});

//Pagina de amigos
app.get("/friends", userLog, (request, response) => {

    //response.status(200);

    let errSol = null;
    let errAmi = null;
    daoF.getRequests(request.session.UserMail, (err, listaSolicitudes) => {

        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);
            let error = null;
            if (listaSolicitudes === undefined) {
                errSol = "No tienes ninguna solicitud";
            }

            daoF.getFriends(request.session.UserMail, (err, listaAmigos) => {

                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    response.status(200);
                    if (listaAmigos === undefined) {
                        errAmi = "No tienes ningun amigo";
                    }


                    response.locals.UserImg = request.session.UserImg;
                    response.locals.UserPoints = request.session.UserPoints;

                    response.render("friends", {errorsSolicitudes: errSol, errorsAmigos: errAmi, listaAmigos: listaAmigos, listaSolicitudes: listaSolicitudes});
                }
            });
        }
    });
});

//Aceptar, boton de la pagina amigos
app.post("/aceptarAmistad", userLog, (request, response) => {

    let amigo = request.body.aceptaAmigo;
    daoF.addFriend(request.session.UserMail, amigo, (err, callback) => {

        if (err) {
            console.log(err);
            response.end();
        } else {


            response.redirect("friends");
        }
    });
});

//Rechazar, boton de la pagina amigos
app.post("/rechazarAmistad", userLog, (request, response) => {

    let amigo = request.body.rechazarAmigo;
    let user = request.session.UserMail;

    daoF.rmRequest(user, amigo, (err, callback) => {

        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);
            response.redirect("friends");
        }
    });
});

//Buscar, boton de la pagina amigos
app.post("/search/", userLog, (request, response) => {

    //Caracteres que se quieren buscar
    let busqueda = {
        UserSearch: request.body.buscar
    };

    let char = "%" + busqueda.UserSearch + "%";

    daoU.search(request.session.UserMail, char, (err, lista) => {

        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);
            let errors = null;
            if (lista === undefined) {
                errors = "La busqueda no tiene resultados";
            }

            response.locals.UserImg = request.session.UserImg;
            response.locals.UserPoints = request.session.UserPoints;

            response.render("searchResult", {errors: errors, busqueda: busqueda, lista: lista});
        }
    });

});

//Solicitar, boton solicita amistad de la pagina de resultados de busqueda
app.post("/solicitarAmistad", userLog, (request, response) => {

    daoF.addRequest(request.session.UserMail, request.body.solicitudAmigo, (err, callback) => {

        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);
            response.redirect("friends");
        }
    });
});

//Ver perfil de solicitantes o amistades
app.get("/verPerfil/:email", userLog, (request, response) => {

    let user = {
        mail: request.params.email,
        nombre: null,
        edad: null,
        sexo: null,
        puntos: null,
        img: null
    };

    //Imagen usuario
    daoU.getUser(user.mail, (err, callback) => {
        if (err) {
            console.log(err);
            response.end();
        } else {

            user.img = callback.img;
            user.sexo = callback.sexo;
            user.puntos = callback.puntos;
            user.edad = getAge(callback.fechaNacimiento);
            user.nombre = callback.nombre;
            
            //Renderizar plantilla

            response.locals.UserImg = request.session.UserImg;
            response.locals.UserPoints = request.session.UserPoints;

            response.render("otherProfile", {user: user});         
        }
    });

});

//Pagina de preguntas
app.get("/questions", userLog, (request, response) => {

    let user = request.session.UserMail;

    daoQ.getUserNoAnsweredQuestions(user, (err, listaPreguntas) => {
        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);
            let errors = null;
            if (listaPreguntas === undefined) {
                errors = "No tienes preguntas sin contestar";
            } else {

                //Renderizar plantilla

                response.locals.UserImg = request.session.UserImg;
                response.locals.UserPoints = request.session.UserPoints;
                response.render("questions", {errors: errors, listaPreguntas: listaPreguntas});
            }
        }
    });
});

app.post("/addNewQuestion", userLog, (request, response) => {

    let textRespuestas = request.body.respuestas;
    let pregunta = {
        pregunta: request.body.pregunta,
        respuestas: textRespuestas.split(",")
    };

    daoQ.addQuestion(pregunta, (err, callback) => {

        if (err) {
            console.log(err);
            response.end();
        } else {

            response.redirect("questions");
        }
    });

});

app.get("/verPregunta/:id_pregunta", userLog, (request, response) => {

    let id_pregunta = request.params.id_pregunta;
    let user = request.session.UserMail;

    daoQ.getQuestion(id_pregunta, (err, pregunta) => {
        if (err) {
            console.log(err);
            response.end();
        } else {

            daoQ.getMyAnswer(id_pregunta, user, (err, respuesta) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    if (respuesta === undefined) {

                        respuesta = null;
                    }

                    daoQ.getUsersAnswers(id_pregunta, user, (err, listaRespuestasAmigos) => {
                        if (err) {
                            console.log(err);
                            response.end();
                        } else {

                            if (listaRespuestasAmigos === undefined) {

                                listaRespuestasAmigos = null;
                            }

                            response.locals.UserImg = request.session.UserImg;
                            response.locals.UserPoints = request.session.UserPoints;

                            //Renderizar plantilla
                            response.render("questionView", {pregunta: pregunta, respuesta: respuesta, listaRespuestasAmigos: listaRespuestasAmigos});

                        }
                    });
                }
            });

        }
    });
});

app.get("/responderPregunta/:id_pregunta", userLog, (request, response) => {

    let id_pregunta = request.params.id_pregunta;

    daoQ.getQuestionWAnswers(id_pregunta, (err, respuestas) => {
        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);
            daoQ.getQuestion(id_pregunta, (err, pregunta) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    response.status(200);
                    //Renderizar plantilla

                    response.locals.UserImg = request.session.UserImg;
                    response.locals.UserPoints = request.session.UserPoints;
                    response.render("answerQuestion", {pregunta: pregunta, respuestas: respuestas});

                }
            });
        }
    });
});

app.post("/confirmarRespuesta", userLog, (request, response) => {

    let id_pregunta = request.body.id_pregunta;
    let id_respuesta = request.body.id_respuesta;
    let user = request.session.UserMail;

    //Si el usuario a introducido una nueva respuesta
    if (id_respuesta === "otra") {

        let respuesta = {
            respuesta: request.body.respuesta
        };

        daoQ.addProperUserAnswer(id_pregunta, respuesta.respuesta, user, (err, callback) => {
            if (err) {
                console.log(err);
                response.end();
            } else {

                response.status(200);
                daoQ.getQuestion(id_pregunta, (err, pregunta) => {
                    if (err) {
                        console.log(err);
                        response.end();
                    } else {

                        response.status(200);
                        daoQ.getUsersAnswers(id_pregunta, user, (err, listaRespuestasAmigos) => {
                            if (err) {
                                console.log(err);
                                response.end();
                            } else {

                                if (listaRespuestasAmigos === undefined) {

                                    listaRespuestasAmigos = null;
                                }

                                response.locals.UserImg = request.session.UserImg;
                                response.locals.UserPoints = request.session.UserPoints;

                                //Renderizar plantilla
                                response.render("questionView", {pregunta: pregunta, respuesta: respuesta, listaRespuestasAmigos: listaRespuestasAmigos});

                            }
                        });


                    }
                });
            }
        });

    } else {

        daoQ.addUserAnswer(id_pregunta, id_respuesta, user, (err, callback) => {
            if (err) {
                console.log(err);
                response.end();
            } else {

                daoQ.getQuestion(id_pregunta, (err, pregunta) => {
                    if (err) {
                        console.log(err);
                        response.end();
                    } else {

                        response.status(200);
                        daoQ.getMyAnswer(id_pregunta, user, (err, respuesta) => {
                            if (err) {
                                console.log(err);
                                response.end();
                            } else {

                                response.status(200);
                                daoQ.getUsersAnswers(id_pregunta, user, (err, listaRespuestasAmigos) => {
                                    if (err) {
                                        console.log(err);
                                        response.end();
                                    } else {

                                        if (listaRespuestasAmigos === undefined) {

                                            listaRespuestasAmigos = null;
                                        }

                                        response.locals.UserImg = request.session.UserImg;
                                        response.locals.UserPoints = request.session.UserPoints;

                                        //Renderizar plantilla
                                        response.render("questionView", {pregunta: pregunta, respuesta: respuesta, listaRespuestasAmigos: listaRespuestasAmigos});

                                    }
                                });


                            }
                        });

                    }
                });
            }
        });
    }
});

//Desconectar usuario, boton desconectar
app.get("/logOut", (request, response) => {

    response.status(200);

    request.session.destroy();

    response.redirect("/index");
});

//Añadir pregunta interfaz
app.get("/addQuestion", userLog, (request, response) => {

    response.status(200);

    response.locals.UserImg = request.session.UserImg;
    response.locals.UserPoints = request.session.UserPoints;
    response.locals.UserName = request.session.UserName;

    response.render("addQuestion", {errors: null});
});

//Recibe una fecha como parametro y devuelve la edad
function getAge(x) {

    let fecha = x;
    let valores = fecha.split("/");
    let dia = valores[1];
    let mes = valores[0];
    let ano = valores[2];
    let hoy = new Date();
    let año_actual = hoy.getYear();
    let mes_actual = hoy.getMonth() + 1;
    let dia_actual = hoy.getDate();
    // realizamos el calculo
    let edadUser = (año_actual + 1900) - ano;
    if (mes_actual < mes)
    {
        edadUser--;
    }
    if ((mes === mes_actual) && (dia_actual < dia))
    {
        edadUser--;
    }
    if (edadUser > 1900)
    {
        edadUser -= 1900;
    }


    return edadUser;
}
