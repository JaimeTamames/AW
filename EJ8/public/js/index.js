"use strict";

/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    // Solicita al servidor la lista de tareas, y la muestra en la página
    loadTasks();

    // Cuando se pulse alguno de los botones 'Eliminar', se llamará a
    // la función onRemoveButtonClick
    $("div.tasks").on("click", "button.remove", onRemoveButtonClick);

    // Cuando se pulse el botón de 'Añadir', se llamará a la función
    // onAddButtonClick
    $("button.add").on("click", onAddButtonClick);
});

/*
 * Convierte una tarea en un elemento DOM.
 *  
 * @param {task} Tarea a convertir. Debe ser un objeto con dos atributos: id y text.
 * @return Selección jQuery con el elemento del DOM creado
 */
function taskToDOMElement(task) {
    let result = $("<li>").addClass("task");
    result.append($("<span>").text(task.text));
    result.append($("<button>").addClass("remove").text("Eliminar"));
    result.data("id", task.id);
    return result;
}

function loadTasks() {
   
   $.ajax({
	   
	   method:"GET",
	   url:"tasks",
	   
	   success: function(data) {
		   
		  console.log(data);
			
		  data.forEach(elem => {			  
			  $("#tareas").before(taskToDOMElement(elem));		  
		  });			
		   
		   
	   },
	   
	   error: function(error) {
		   alert("ha ocurrido un error: " + error);		   
	   }
	   
	   /*
	   $("#botonvalue").on("click", () => {
		   
		   let cantidad = $("#idcampo").prop("value");
		   let otro = $("#idcombobox").find("option:selected").prop("value");
		   
		   $.ajax({
			   
			   method:"GET",
			   url:();
			   
			   data: 
			   
			   
		   };
		   
	   });*/
	   
	   
   });
   
   
}

function onRemoveButtonClick(event) {
    // Obtenemos el botón 'Eliminar' sobre el que se ha
    // hecho clic.
    let selected = $(event.target);

    // Obtenemos el elemento <li> que contiene el botón
    // pulsado.
    let liPadre = selected.parent();

    
	$.ajax({
		
		type:"Delete",
		url:"tasks/" + liPadre.data("id"),
		
		success: function(data) {
			
			liPadre.remove();
			
		},
		error: function(error) {
		   alert("ha ocurrido un error: " + error);		   
		}
		
		
	});
	
}

function onAddButtonClick(event) {
    
	let newTask = document.getElementsByName("taskText")[0].value;
	
	if(newTask.length > 0){ //Comprobamos que la tarea no esté vacia
        
		$.ajax({ 
            method: "POST",
            url:"tasks",
            contentType:"application/json",
            data:JSON.stringify({text:newTask}),

            success: (data)=>{
                $("#tareas").before(taskToDOMElement(data));
            },
            //En caso de error, mostramos el error producido
            error: function (error) {
                alert("Se ha producido un error: " + error);
            }

        });
		
    }else{
        alert("No puedes añadir una tarea vacia.")

    }
	
	
	
}
