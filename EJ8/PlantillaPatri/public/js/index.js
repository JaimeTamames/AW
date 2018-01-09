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

        type: "GET",
        url: "/tasks",

        // En caso de éxito, colocamos el texto con el resultado
        // en el documento HTML
        success: function (data,textStatus, jqXHR){
            data.forEach(element => {
                $("#result").before(taskToDOMElement(element));
            });

        },
        //En caso de error, mostramos el error producido
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Se ha producido un error: " + errorThrown);
        }
    }); 
        
}

function onRemoveButtonClick(event) {
    // Obtenemos el botón 'Eliminar' sobre el que se ha
    // hecho clic.
    let selected = $(event.target);

    // Obtenemos el elemento <li> que contiene el botón
    // pulsado.
    let liPadre = selected.parent();

    // Implementar el resto del método aquí.
    $.ajax({
        type: "Delete",
        url: "/tasks/" + liPadre.data("id"),
        success:function(data){
            liPadre.remove();
        },
        //En caso de error, mostramos el error producido
        error: function (jqXHR, textStatus, errorThrown) {
            alert("Se ha producido un error: " + errorThrown);
        }

    });
}

function onAddButtonClick(event) {
    
    var newTag = document.getElementsByName("taskText")[0].value; //Tema 7 diap 35

    if(newTag.length > 0){
        $.ajax({ //Diapositiva 79 tema 8
            type: "POST",
            url:"/tasks",
            contentType:"application/json",
            data:JSON.stringify({text:newTag}),

            success: (data,textStatus, jqXHR)=>{
                $("#result").before(taskToDOMElement(data));

            },
            //En caso de error, mostramos el error producido
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
            }

        });
    }else{
        alert("No puedes añadir una tarea vacia.")

    }

}

