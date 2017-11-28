const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");

const app = express();

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

let daoT = new daoTasks.DAOTasks(pool);

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

    daoT.getAllTasks("usuario@ucm.es",(err, taskList )=>{

        if(err) {
            console.log(err);
            response.end();
        }else{
            response.status(200);
            response.render("tasks" ,{ taskList:taskList} );
        }

    });
	

});

app.post("/addTask", (request, response) => {
	
	console.log("AÑADIENDOOOOOO TAREAAAAAA");
	response.end();
});


