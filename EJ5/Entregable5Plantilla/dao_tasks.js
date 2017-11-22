"use strict";


/**
 * Proporciona operaciones para la gestión de tareas
 * en la base de datos.
 */
class DAOTasks {
    /**
     * Inicializa el DAO de tareas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }


    /**
     * Devuelve todas las tareas de un determinado usuario.
     * 
     * Este método devolverá (de manera asíncrona) un array
     * con las tareas de dicho usuario. Cada tarea debe tener cuatro
     * atributos: id, text, done y tags. El primero es numérico, el segundo
     * una cadena, el tercero un booleano, y el cuarto un array de cadenas.
     * 
     * La función callback ha de tener dos parámetros: un objeto
     * de tipo Error (si se produce, o null en caso contrario), y
     * la lista de tareas (o undefined, en caso de error).
     * 
     * @param {string} email Identificador del usuario.
     * @param {function} callback Función callback.
     */
    getAllTasks(email, callback) {

        /* Implementar */
		this.pool.getConnection((err, connection) => {
            if (err) { callback (err); return; }
            connection.query(                
				"SELECT task.id AS id, task.text AS text, task.done AS done,  tag.tag AS tag" +
                " FROM task" +
				" LEFT JOIN tag ON task.id = tag.taskId" +
                " WHERE task.user = ?", 
                [email],				
				//ESTO FUNCIONA CON LOS 2 SELECT
				/*" SELECT task.id AS id, task.text AS text, task.done AS done" +
                " FROM task" +
                " WHERE task.user = ?", 
                [email],*/					
                (err, rows) => {
                    if (err) { callback(err); return; }
					connection.release();
                    if (rows.length === 0) {
                    	callback(null, undefined);
                	} else {
						
						let task;
						let i = 0;
						let tags;
						let fin;
						
						//Con for each
						for(i = 0; i < rows.length; i++){	
							
							tags = []; //asi se reinicializa en cada vuelta;
							fin = false;
							
							if(i != rows.length){
								
								//ESTE WHILE VA ABANZANDO POR LAS FILAS IGUAL QUE ROW Y ACUMULA LOS TAGS HASTA QUE EL SIGUIENTE ES DIFERENTE
								//AL SALIR ACUMULA EL ULTIMO IGUAL E IMPRIME, ESTA CONTROLADO QUE SE SALGA DEL ARRAY, PERO DA ERROR AUN 
								while(rows[i].id === rows[i+1].id && !fin){

									tags.push(rows[i].tag);								
									if (i+1 === rows.length)
										fin = true;
									else
									i++;	
									
								}
								
							}
							tags.push(rows[i].tag);	
							
							//DIFERENCIA ENTRE SI HAY TAGS O NO E IMPRIME UNA COSA U OTRA
							
							if(tags.length === 0)
								callback(null, [rows[i].id, rows[i].text, rows[i].done, null])
							else
								callback(null, [rows[i].id, rows[i].text, rows[i].done, tags])
							
																														
							
                		}
						
                	}
                }
            );    
        });

    }
	


	
	

    /**
     * Inserta una tarea asociada a un usuario.
     * 
     * Se supone que la tarea a insertar es un objeto con, al menos,
     * dos atributos: text y tags. El primero de ellos es un string con
     * el texto de la tarea, y el segundo de ellos es un array de cadenas.
     * 
     * Tras la inserción se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la inserción, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {object} task Tarea a insertar
     * @param {function} callback Función callback que será llamada tras la inserción
     */
    insertTask(email, task, callback) {

        //Implementar 
		this.pool.getConnection((err, connection) => {
            if (err) { callback (err); return; }
            connection.query(
                "INSERT INTO task (user, text, done)" +
				" VALUES (?, ?, ?)",
                [email, task.text, task.done],
                (err, rows) => {
                    if (err) { callback(err); return; }
                    else {
						connection.release();
                    	callback(null, undefined);
                	} 
                }
            );    
        });
       
    }

    /**
     * Marca la tarea indicada como realizada, estableciendo
     * la columna 'done' a 'true'.
     * 
     * Tras la actualización se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {object} idTask Identificador de la tarea a modificar
     * @param {function} callback Función callback que será llamada tras la actualización
     */
    markTaskDone(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "UPDATE task SET done = 1 WHERE id = ?",
                [idTask],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }

    /**
     * Elimina todas las tareas asociadas a un usuario dado que tengan
     * el valor 'true' en la columna 'done'.
     * 
     * Tras el borrado se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {function} callback Función llamada tras el borrado
     */
    deleteCompleted(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "DELETE FROM task WHERE user = ? AND done = 1",
                [email],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }
}

module.exports = {
    DAOTasks: DAOTasks
}