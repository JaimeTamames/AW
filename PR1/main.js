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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());

app.get("/", (request, response) => {

    response.status(200);
    response.redirect("/index");
});

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
                                                else{
                                                    app.locals.UserAge = callback;
                                                
                                                //Nombre del usuario
                                                    daoU.getUserName(user, (err, callback) => {
                                                        if (err) {
                                                            console.log(err);
                                                            response.end();
                                                        } else {
                                                            if (callback === undefined)
                                                                app.locals.UserName = null;
                                                            else{
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
    
    var values = {
                sexo: "Masculino",
                fechaNacimiento: "dd/mm/aaaa"
            };
    response.render("newUser", {errores: [], usuario: values});
});

//Alta usuario, boton crear usuario de la pagina newUser
app.post("/altaNuevoUsuario", (request, response) => {
    //response.render("newUser");
    
    request.checkBody("email", "Email de usuario vacío").notEmpty();
    request.checkBody("email", "Dirección de correo no válida").isEmail();
    request.checkBody("pass", "Contraseña de usuario vacío").notEmpty();
    request.checkBody("pass", "La contraseña no tiene entre 6 y 20 caracteres").isLength({ min: 6, max: 20 });
    request.checkBody("nombre", "Nombre de usuario vacío").notEmpty();
    //request.checkBody("nombre", "Nombre de usuario no válido").matches(/^[A-Z0-9]*$/i);
    request.checkBody("fechaNacimiento", "Fecha de nacimiento no válida").isBefore();
    
    request.getValidationResult().then((result) => {
        if (result.isEmpty()) {
            
            var user = {
                email: request.body.email,
                pass: request.body.pass,
                nombre: request.body.nombre,
                sexo: request.body.sexo,
                fechaNacimiento: request.body.fechaNacimiento,
                img: request.body.imagenPerfil
            }
            
            daoU.addUser(user, (err, callback)=>{

				if(err) {
                    console.log(err);
                    response.end();
                }else{
                    response.status(200);
					
					//Variables para cargar el perfil
					
					app.locals.UserName = user.nombre;
					app.locals.UserAge = user.fechaNacimiento;   // CALCULAR EDAD
					app.locals.UserPoints = 0;
					app.locals.UserSex = user.sexo;					
					app.locals.UserMail = user.email;
					
					
					if(user.img === "")
						app.locals.imagenUsuario = "profile_imgs/NoProfile.png";
					else
						app.locals.imagenUsuario = "profile_imgs/" + user.img;
					
                    response.redirect("myProfile");
                }
            });
            
            
        } else {
            //console.log(result.array());
            //console.log(result.mapped());
            var usuarioIncorrecto = {
                email: request.body.email,
                pass: request.body.pass,
                nombre: request.body.nombre,
                sexo: request.body.sexo,
                fechaNacimiento: request.body.fechaNacimiento,
                img: request.body.imagenPerfil
            };
            response.render("newUser", {errores: result.mapped(), usuario: usuarioIncorrecto });
        }
    });
});

app.get("/myProfile", (request, response) => {

    response.status(200);
    response.render("myProfile");
});

//Pagina modificar perfil
app.get("/modificarPerfil", (request, response) => {

    response.status(200);
    response.render("myProfileAdmin");
});

//Aplicar cambios,boton de la pagina myProfileAdmin
app.post("/aplicarCambiosPerfil", (request, response) => {

    response.status(200);
    response.render("myProfileAdmin");
});

app.get("/friends", (request, response) => {

    response.status(200);
    response.render("friends");
});

app.get("/questions", (request, response) => {

    response.status(200);
	//app.locals.imagenUsuario = null;
	//app.locals.UserPoints = 0;
    response.render("questions");
});

//Desconectar usuario
app.get("/logOut", (request, response) => {

	response.status(200);
	request.session.destroy();
	response.redirect("/index");

});