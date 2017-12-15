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
    database: "facebluff",
    host: "localhost",
    user: "root",
    password: "awaw"
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
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

//Pool de conexiones a la BBDD
let daoU = new daoUsers.DAOUsers(pool);
let daoF = new daoFriends.DAOFriends(pool);
let daoQ = new daoQuestions.DAOQuestions(pool);

//Estado del servidor
app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.");
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
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

//Login, boton conectar de la pagina index
app.post("/conectar", (request, response) => {

    let user = request.body.email;
    let pass = request.body.pass;
    app.locals.UserMail = user;

    daoU.isUserCorrect(user, pass, (err, callback) => {

        if (err) {

            console.log(err);
            response.end();

        } else {

            if (!callback) {

                response.status(400);
                response.render("index", {errorMsg: "Dirección de correo y/o contraseña no validos"});
            } else {

                response.status(200);
                request.session.currentUser = user;

                //Imagen usuario
                daoU.getUserImageName(user, (err, callback) => {
                    if (err) {
                        console.log(err);
                        response.end();
                    } else {
                        app.locals.UserImg = callback;

                        //Sexo del Usuario
                        daoU.getUserSex(user, (err, callback) => {
                            if (err) {
                                console.log(err);
                                response.end();
                            } else {
                                if (callback === undefined)
                                    app.locals.UserSex = null;
                                else
                                    app.locals.UserSex = callback;

                                //Puntos del usuario
                                daoU.getUserPoints(user, (err, callback) => {
                                    if (err) {
                                        console.log(err);
                                        response.end();
                                    } else {
                                        if (callback === undefined)
                                            app.locals.UserPoints = null;
                                        else
                                            app.locals.UserPoints = callback;

                                        //Edad del usuario
                                        daoU.getUserAge(user, (err, callback) => {
                                            if (err) {
                                                console.log(err);
                                                response.end();
                                            } else {
                                                if (callback === undefined)
                                                    app.locals.UserAge = null;
                                                else {
                                                    app.locals.UserDate = callback;
                                                    app.locals.UserAge = getAge(callback);

                                                    //Nombre del usuario
                                                    daoU.getUserName(user, (err, callback) => {
                                                        if (err) {
                                                            console.log(err);
                                                            response.end();
                                                        } else {
                                                            if (callback === undefined)
                                                                app.locals.UserName = null;
                                                            else {
                                                                app.locals.UserName = callback;

                                                                //Renderizar plantilla
                                                                response.render("myProfile");
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                });

                            }
                        });
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
    //request.checkBody("nombre", "Nombre de usuario no válido").matches(/^[A-Z0-9]*$/i);
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
                img: request.body.img
            };

            //Acotar si se ha añadido la imagen		
            if (user.img === undefined || user.img === '') {
                user.img = "profile_imgs/NoProfile.png";
            } else {
                user.img = "/profile_imgs/" + user.img;
            }

            daoU.addUser(user, (err, callback) => {

                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    response.status(200);

                    //Variables para cargar el perfil
                    app.locals.UserName = user.nombre;
                    app.locals.UserAge = getAge(user.fechaNacimiento); //Convetir a edad
                    app.locals.UserDate = user.fechaNacimiento;
                    app.locals.UserPoints = 0;
                    app.locals.UserSex = user.sexo;
                    app.locals.UserMail = user.email;
                    app.locals.UserImg = user.img;


                    response.render("myProfile");
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
                img: request.body.img
            };

            response.render("newUser", {errores: result.mapped(), usuario: usuarioIncorrecto});
        }
    });
});

//Pagina mi perfil
app.get("/myProfile", (request, response) => {

    response.status(200);
    response.render("myProfile");
});

//Pagina modificar perfil
app.get("/modificarPerfil", (request, response) => {

    response.status(200);
    response.render("myProfileAdmin", {errores: []});
});

//Aplicar cambios,boton de la pagina myProfileAdmin
app.post("/aplicarCambiosPerfil", (request, response) => {

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
                email: app.locals.UserMail,
                pass: request.body.pass,
                fechaNacimiento: request.body.fechaNacimiento,
                sexo: request.body.sexo,
                img: request.body.img
            };

            //Acotar si se ha modificado la imagen		
            if (user.img === undefined || user.img === '') {
                user.img = app.locals.UserImg;
            } else {
                user.img = "/profile_imgs/" + user.img;
            }
            //-------------------------------------//   SETERS

            daoU.setName(user, (err, callback) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    app.locals.UserName = user.nombre;

                    daoU.setDate(user, (err, callback) => {
                        if (err) {
                            console.log(err);
                            response.end();
                        } else {

                            app.locals.UserAge = getAge(user.fechaNacimiento); //Convetir a edad
                            app.locals.UserDate = user.fechaNacimiento;

                            daoU.setSex(user, (err, callback) => {
                                if (err) {
                                    console.log(err);
                                    response.end();
                                } else {

                                    app.locals.UserSex = user.sexo;

                                    daoU.setImage(user, (err, callback) => {
                                        if (err) {
                                            console.log(err);
                                            response.end();
                                        } else {

                                            app.locals.UserImg = user.img;


                                            if (user.pass !== "") {

                                                daoU.setPassword(user, (err, callback) => {
                                                    if (err) {
                                                        console.log(err);
                                                        response.end();
                                                    } else
                                                        response.render("myProfile");
                                                });

                                            }
                                            // FINAL DE IF DE SETPASS		
                                            else {

                                                response.render("myProfile");
                                            }

                                        }

                                    });
                                    // FINAL DE SETIMAGE

                                }

                            });
                            //FINAL DE SETSEX							
                        }

                    });

                    // FINAL DE SETDATE						
                }

            });
            //FINAL DE SETNAME				
        } else {

            //No devolvemos datos introducidos previamente, pueden crear confusion de si estan ya cambiados o no, pero si errores       
            response.render("myProfileAdmin", {errores: result.mapped()});
        }
    });
});

//Pagina de amigos
app.get("/friends", (request, response) => {

    //response.status(200);

    let errSol = null;
    let errAmi = null;

    daoF.getRequests(app.locals.UserMail, (err, listaSolicitudes) => {

        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);

            let error = null;

            if (listaSolicitudes === undefined) {
                errSol = "No tienes ninguna solicitud";
            }

            daoF.getFriends(app.locals.UserMail, (err, listaAmigos) => {

                if (err) {
                    console.log(err);
                    response.end();
                } else {

                    response.status(200);

                    if (listaAmigos === undefined) {
                        errAmi = "No tienes ningun amigo";
                    }

                    response.render("friends", {errorsSolicitudes: errSol, errorsAmigos: errAmi, listaAmigos: listaAmigos, listaSolicitudes: listaSolicitudes});
                }
            });
        }
    });
});

//Aceptar, boton de la pagina amigos
app.post("/aceptarAmistad", (request, response) => {

    let amigo = request.body.aceptaAmigo;

    daoF.addFriend(app.locals.UserMail, amigo, (err, callback) => {

        if (err) {
            console.log(err);
            response.end();
        } else {
            response.redirect("friends");
        }
    });
});

//Rechazar, boton de la pagina amigos
app.post("/rechazarAmistad", (request, response) => {

    let amigo = request.body.rechazarAmigo;

    daoF.rmRequest(app.locals.UserMail, amigo, (err, callback) => {

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
app.post("/search", (request, response) => {

    //Caracteres que se quieren buscar
    let busqueda = {
        UserSearch: request.body.buscar
    };

    let char = "%" + busqueda.UserSearch + "%";

    daoU.search(app.locals.UserMail, char, (err, lista) => {

        if (err) {
            console.log(err);
            response.end();
        } else {

            response.status(200);

            let errors = null;

            if (lista === undefined) {
                errors = "La busqueda no tiene resultados";
            }

            response.render("searchResult", {errors: errors, busqueda: busqueda, lista: lista});
        }
    });

});

//Solicitar, boton solicita amistad de la pagina de resultados de busqueda
app.post("/solicitarAmistad", (request, response) => {

    daoF.addRequest(app.locals.UserMail, request.body.solicitudAmigo, (err, callback) => {

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
app.post("/verPerfil", (request, response) => {

    let user = {
        mail: request.body.perfil,
        nombre: null,
        edad: null,
        sexo: null,
        puntos: null,
        img: null
    };

    //Imagen usuario
    daoU.getUserImageName(user.mail, (err, callback) => {
        if (err) {
            console.log(err);
            response.end();
        } else {
            user.img = callback;

            //Sexo del Usuario
            daoU.getUserSex(user.mail, (err, callback) => {
                if (err) {
                    console.log(err);
                    response.end();
                } else {
                    if (callback === undefined)
                        user.sexo = null;
                    else
                        user.sexo = callback;

                    //Puntos del usuario
                    daoU.getUserPoints(user.mail, (err, callback) => {
                        if (err) {
                            console.log(err);
                            response.end();
                        } else {
                            if (callback === undefined)
                                user.puntos = null;
                            else
                                user.puntos = callback;

                            //Edad del usuario
                            daoU.getUserAge(user.mail, (err, callback) => {
                                if (err) {
                                    console.log(err);
                                    response.end();
                                } else {
                                    if (callback === undefined)
                                        user.edad = null;
                                    else {

                                        user.edad = getAge(callback);

                                        //Nombre del usuario
                                        daoU.getUserName(user.mail, (err, callback) => {
                                            if (err) {
                                                console.log(err);
                                                response.end();
                                            } else {
                                                if (callback === undefined)
                                                    user.nombre = null;
                                                else {
                                                    user.nombre = callback;

                                                    //Renderizar plantilla
                                                    response.render("otherProfile", {user: user});
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });

                }
            });
        }
    });

});

//Pagina de preguntas
app.get("/questions", (request, response) => {

    let user = app.locals.UserMail;

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
                response.render("questions", {errors: errors, listaPreguntas: listaPreguntas});
            }
        }
    });
});

app.post("/verPregunta", (request, response) => {

    let id_pregunta = request.body.id_pregunta;
    let user = app.locals.UserMail;

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

                    if (respuesta === undefined) {

                        respuesta = null;
                    }

                    //Renderizar plantilla
                    response.render("questionView", {pregunta: pregunta[0], respuesta: respuesta[0]});

                }
            });

        }
    });
});

app.post("/responderPregunta", (request, response) => {

    let id_pregunta = request.body.id_pregunta;

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
                    response.render("answerQuestion", {pregunta: pregunta, respuestas: respuestas});

                }
            });
        }
    });
});

app.post("/confirmarRespuesta", (request, response) => {

    let id_pregunta = request.body.id_pregunta;
    let id_respuesta = request.body.id_respuesta;
    let user = app.locals.UserMail;

    //Si el usuario a introducido una nueva respuesta
    if (id_respuesta === "otra") {

        let respuesta = respuesta;

        daoQ.addProperUserAnswer(id_pregunta, respuesta, user, (err, callback) => {
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
                        response.render("questionView", {pregunta: pregunta, respuesta: respuesta});

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


                                //Renderizar plantilla
                                response.render("questionView", {pregunta: pregunta, respuesta: respuesta});

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
