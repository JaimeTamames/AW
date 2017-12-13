//Jaime Tamames y Ruben Barrado

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoUsers = require("./dao_users_fb");
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
})

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

//Estado del servidor
app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
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
                        if (callback === null)
                            app.locals.imagenUsuario = "profile_imgs/NoProfile.png";
                        else
                            app.locals.imagenUsuario = "profile_imgs/" + callback;

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
                                                                response.redirect("myProfile");
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                })

                            }
                        })
                    }
                })
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
                img: request.body.imagenPerfil
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

                    if (user.img === undefined)
                        app.locals.imagenUsuario = "profile_imgs/NoProfile.png";
                    else
                        app.locals.imagenUsuario = "profile_imgs/" + user.img;

                    response.redirect("myProfile");
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
                //img: request.body.imagenPerfil
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

    request.checkBody("email", "Dirección de correo no válida").notEmpty().isEmail();    
    request.checkBody("nombre", "Nombre de usuario vacío").notEmpty();
    //request.checkBody("nombre", "Nombre de usuario no válido").matches(/^[A-Z0-9]*$/i);
    request.checkBody("fechaNacimiento", "Fecha de nacimiento no válida").notEmpty().isBefore();
	
	if(request.body.pass !== ""){
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
				img: request.body.imagenPerfil			
            }
			
			if(user.nombre !== app.locals.UserName){
				
				daoU.setName(user, (err, callback) => {
					if (err) {
						console.log(err);
						response.end();
					} else {

						app.locals.UserName = user.nombre;
						
					}				
					
				})
				
			}
			
			if(user.fechaNacimiento !== app.locals.UserDate){
				
				daoU.setDate(user, (err, callback) => {
					if (err) {
						console.log(err);
						response.end();
					} else {
						
						app.locals.UserAge = getAge(user.fechaNacimiento); //Convetir a edad
						app.locals.UserDate = user.fechaNacimiento;
						
					}				
					
				})
				
			}
			
			if(user.sexo !== app.locals.UserSex){
				
				daoU.setDate(user, (err, callback) => {
					if (err) {
						console.log(err);
						response.end();
					} else {
						
						app.locals.UserSex = user.sexo;
						
					}				
					
				})
				
			}
			
			if(user.imagenPerfil !== app.locals.imagenUsuario){
				
				daoU.setImage(user, (err, callback) => {
					if (err) {
						console.log(err);
						response.end();
					} else {
						
						app.locals.imagenUsuario = user.imagenPerfil;
						
					}				
					
				})
				
			}
			
			if(user.pass !== ""){
				
				daoU.setPassword(user, (err, callback) => {
					if (err) {
						console.log(err);
						response.end();
					} 					
				})
				
			}
			
			response.render("myProfile");

        } else {

            //No devolvemos datos introducidos previamente, pueden crear confusion de si estan ya cambiados o no, pero si errores       
            response.render("myProfileAdmin", {errores: result.mapped()});
        }
    });
});

//Pagina de amigos
app.get("/friends", (request, response) => {

    response.status(200);
    response.render("friends");
});

//Pagina de preguntas
app.get("/questions", (request, response) => {

    response.status(200);
    response.render("questions");
});

//Desconectar usuario, boton desconectar
app.get("/logOut", (request, response) => {

    response.status(200);
    request.session.destroy();
    response.redirect("/index");

});

function getAge(x) {
   
    let fecha = x;
	
	let valores = fecha.split("/");
    let dia = valores[1];
    let mes = valores[0];
    let ano = valores[2];
	   
    let hoy = new Date();
    let año_actual = hoy.getYear();
    let mes_actual = hoy.getMonth()+1;
    let dia_actual = hoy.getDate();
 
    // realizamos el calculo
    let edadUser = (año_actual + 1900) - ano;
        if ( mes_actual < mes )
        {
            edadUser--;
        }
        if ((mes == mes_actual) && (dia_actual < dia))
        {
            edadUser--;
        }
        if (edadUser > 1900)
        {
            edadUser -= 1900;
        }
 
        
   return edadUser;
}

