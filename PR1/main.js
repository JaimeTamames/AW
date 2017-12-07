//Jaime Tamames y Ruben Barrado

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const daoUsers = require("./dao_users_fb");
const taskUtils = require("./task_utils");
const express_session = require("express-session");
const express_mysql_session = require("express-mysql-session");

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
let daoT = new daoTasks.DAOTasks(pool);
let daoU = new daoUsers.DAOUsers(pool);


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

//Obtener tareas de usuario@ucm.es
app.get("/tasks", (request, response) => {
    
	
    let user = request.session.currentUser;
	app.locals.userMail = request.session.currentUser;

    daoT.getAllTasks(app.locals.userMail,(err, taskList )=>{

			if(err) {
				console.log(err);
				response.end();
			}else{
				response.status(200);
				
				app.locals.taskList = taskList;
				
				imagenUsuario:daoU.getUserImageName(app.locals.userMail, (err, callback) => {						
						if (err){
							console.log(err);
							response.end();
						}else {
							if(callback	=== null)					
								callback = "img/NoPerfil.png";
							else
								callback = "profile_imgs/" + callback;
							
							app.locals.imagenUsuario = callback;
										
							response.render("tasks");
						}
					})			
			}
    });
});
 
//Declaracion del middelware bodyParser para obtener el contenido de la peticion post
app.use(bodyParser.urlencoded({ extended: false }));

//Añadir tareas a usuario@ucm.es
app.post("/addTask", function(request, response) {
    
        let user = request.session.currentUser;
    
        //Para no añadir tareas vacias o con un espacio
	if (request.body.taskText !== "" && request.body.taskText !== " "){
            
            let task = taskUtils.createTask(request.body.taskText);
            task.done = false;

            daoT.insertTask(user, task, (err, callback)=>{

			if(err) {
                    console.log(err);
                    response.end();
                }else{
                    response.status(200);
                    response.redirect("/tasks");
                }
            });
	}else {
		
		response.status(200);
		response.redirect("/tasks");	
	}	
});

//Marcar tareas finalizadas de usuario@ucm.es
app.post("/finish", function(request, response) {
    
    let taskId = request.body.taskId;

    daoT.markTaskDone(taskId, (err, callback)=>{

        if(err) {
            console.log(err);
            response.end();
        }else{
            response.status(200);
            response.redirect("/tasks");
        }
    });
});

//Eliminar tareas completadas de usuario@ucm.es
app.get("/deleteCompleted", (request, response) => {
    
    let user = request.session.currentUser;

    daoT.deleteCompleted(user, (err, callback)=>{

        if(err) {
            console.log(err);
            response.end();
        }else{
            response.status(200);
            response.redirect("/tasks");
        }

    });
});

//Manejador del login.html
app.get("/login.html", (request, response) => {	
	
    response.status(200);
    response.render("login", {errorMsg:null});
	
});

app.post("/login", (request, response) => {
	
    let user = request.body.mail;
    let pass = request.body.pass;

    daoU.isUserCorrect(user, pass, (err, callback) => {

        if(err) {

            console.log(err);
            response.end();		
			
		}
        else {

            if(!callback){				

                response.status(400);
                response.render("login", {errorMsg:"Dirección de correo y/o contraseña no validos"});
            }
            else {

                response.status(200);
                request.session.currentUser = user;
                
                response.redirect("/tasks");
            }			
        }	
    });	
});

//Desconectar usuario
app.get("/logout", (request, response) => {

	response.status(200);
	request.session.destroy();
	response.redirect("/login.html");

});

//Manejadores PR1 <-------------------------------------------------------------- A PARTIR DE AQUI----------

app.get("/index.html", (request, response) => {

	response.status(200);
	request.session.destroy();
	response.redirect("/index");

});

app.get("/index", (request, response) => {	
	
    response.status(200);
    response.render("index", {errorMsg:null});
	
});

app.post("/conectar", (request, response) => {
	
	app.locals.userMail = request.body.email;
    let pass = request.body.pass;

    daoU.isUserCorrect(app.locals.userMail, pass, (err, callback) => {

        if(err) {

            console.log(err);
            response.end();		
			
		}
        else {

            if(!callback){				

                response.status(400);
                response.render("index", {errorMsg:"Dirección de correo y/o contraseña no validos"});
            }
            else {

                response.status(200);
                request.session.currentUser = app.locals.userMail;
				
				//Imagen usuario
				daoU.getUserImageName(app.locals.userMail, (err, callback) => {						
						if (err){
							console.log(err);
							response.end();
						}else {
							if(callback	=== null)					
								app.locals.imagenUsuario = "profile_imgs/NoProfile.png";
							else
								app.locals.imagenUsuario = "profile_imgs/" + callback;
							
							//Sexo del Usuario
							daoU.getUserSex(app.locals.userMail, (err, callback) => {						
								if (err){
									console.log(err);
									response.end();
								}else {
									if(callback	=== undefined)					
										app.locals.UserSex = null;							
									else
										app.locals.UserSex = callback;
									
									
									//Puntos del usuario
									UserPoints:daoU.getUserPoints(app.locals.userMail, (err, callback) => {						
											if (err){
												console.log(err);
												response.end();
											}else {
												if(callback	=== undefined)					
													app.locals.UserPoints = null;							
												else
													app.locals.UserPoints = callback;
												
												
												//Edad del usuario
												
												UserAge:daoU.getUserAge(app.locals.userMail, (err, callback) => {						
														if (err){
															console.log(err);
															response.end();
														}else {
															if(callback	=== undefined)					
																app.locals.UserAge = null;							
															else
																app.locals.UserAge = callback;
															
														}
														
														//Renderizar plantilla
														response.render("My_profile");
														
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


app.get ("/NuevoUsuario", (request, response) => {	
	
    response.status(200);
    response.render("NuevoUsuario");
	
});

app.get ("/NuevoUsuario.html", (request, response) => {	
	
    response.status(200);
    response.redirect("NuevoUsuario");
	
});


