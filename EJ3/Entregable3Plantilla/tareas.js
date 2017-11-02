/**
 * Jaime Tamames y Ruben Barrado
 *
 *
 * ============================
 * Ejercicio entregable 3.
 * Funciones de orden superior.
 * ============================
 * 
 * Puedes ejecutar los tests ejecutando `mocha` desde el directorio en el que se encuentra
 * el fichero `tareas.js`.
 */

"use strict";

let listaTareas = [
  { text: "Preparar práctica PDAP", tags: ["pdap", "practica"] },
  { text: "Mirar fechas congreso", done: true, tags: [] },
  { text: "Ir al supermercado", tags: ["personal"] },
  { text: "Mudanza", done: false, tags: ["personal"] },
];

/**
 * Devuelve las tareas de la lista de entrada que no hayan sido finalizadas.
 */
function getToDoTasks(tasks) {
	
	let res = (tasks.filter(n => n.done === false || n.done === undefined)).map(n => n.text);
	return res;
}

/**
 * Devuelve las tareas que contengan el tag especificado
 */
function findByTag(tasks, tag) {
	
	let res = tasks.filter(n => n.tags.indexOf(tag, 0) > -1);
	return res;
}

/**
 * Devuelve las tareas que contengan alguno de los tags especificados
 */
function findByTags(tasks, myTags) {
  
	let res = tasks.filter(n => n.tags.some( x => myTags.indexOf(x, 0) > -1 ));
	return res;
}

/**
 * Devuelve el número de tareas finalizadas
 */
function countDone(tasks) {
 
	let res = tasks.reduce((acum,x) => acum += terminada(x), 0);
	return res;
	
	function terminada (task){
		
		if(task.done === true){return 1;}
		else return 0;
		
	}
}

/**
 * Construye una tarea a partir de un texto con tags de la forma "@tag"
 */
function createTask(text) {

	let res;
  	let exp = new RegExp("/\@[A-Za-z0-9]+/g");
  	let find = text.indexOf("@");
	
	if(find === -1){ 
    
     	res ={ text: text.trim(), tags:[] };
	  
  	}else{
		text = text.trim();
  		let aux = text.substring(0, find);
		res = text.replace(exp, " ").substring(find-1, text.length).split(" @");
		res = {text: aux.trim(), tags: res.slice(1)};
  }
	
	return res;
}


/**
console.log(getToDoTasks(listaTareas));
console.log(findByTag(listaTareas, "personal"));
console.log(findByTags(listaTareas, ["personal", "pdap"]))
console.log(countDone(listaTareas));
<<<<<<< HEAD
=======
console.log(createTask("Y por aqui va otra @personal"));
>>>>>>> AW/master
*/

/*
  NO MODIFICAR A PARTIR DE AQUI
  Es necesario para la ejecución de tests
*/
module.exports = {
  getToDoTasks: getToDoTasks,
  findByTag: findByTag,
  findByTags: findByTags,
  countDone: countDone,
  createTask: createTask
}
