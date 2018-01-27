"use strict";

/*--SESION--*/

let login;
let loginId;
let cadenaBase64;

$(document).ready(() => {

    cargarPricipal();

    /*-----------LISTENERS-----------*/

    $("#aceptarLogin").on("click", acceder);
    $("#nuevoUsuario").on("click", nuevoUsuario);
    $("#desconectarSesion").on("click", desconectar);
    $("#crear").on("click", crearPartida);
    $("#unirse").on("click", unirsePartida);
    $("#listaPartidas").on("click", "li", muestraPartida);
    $("#cartas-mano").on("click", "img", selecionarCarta);
    $("#actualiarPartida").on("click", actualizaPartida);
    $("#jugarCartas").on("click", jugarCartas);
    $("#mentiroso").on("click", mentiroso);
});

/*-----------------------CONTROL USUARIO-----------------------*/

//Funcion que valida el usuario introducido e inicia la sesion
function acceder(){

    let usuario = $("#nombreUsuario").val();
    let contraseña = $("#contraseñaUsuario").val();

    if(usuario.length > 0 && contraseña.length > 0){

        $.ajax({
            type: 'POST',
            url: '/login',
            contentType: "application/json",
            data: JSON.stringify ({
                usuario: usuario,
                contraseña: contraseña,
            }),
            success: (data, textStatus, jqXHR) => {
           
                borrarmsg();
                login = data.nombre;
                loginId = data.id;

                cadenaBase64 = btoa(usuario + ":" + contraseña);

                $("#nombreUsuario").prop("value", "");
                $("#contraseñaUsuario").prop("value", "");

                ocultar();

                $("#sesion").show();
                $("#crearPartida").show();
                $("#unirsePartida").show();
                $("#usuario").text(usuario);
                cargaMenu();
            
            },
            error: (jqXHR, textStatus, errorThrown) => {

                if(jqXHR.status === 400){
                    borrarmsg();
                    $("#login").after(pintarError("El usuario y/o contraseña introducidos son incorrectos"));
                }

            }
        });
    }else{

        borrarmsg();
        $("#login").after(pintarError("Los campos de login y contraseña no están correctamente rellenos"));
    }
}

//Funcion que da de alta un nuevo usuario
function nuevoUsuario(){

    let usuario = $("#nombreUsuario").val();
    let contraseña = $("#contraseñaUsuario").val();

    if(usuario.length > 0 && contraseña.length > 0){

        $.ajax({
            type: 'POST',
            url: '/nuevoUsuario', 
            contentType: "application/json",
            data: JSON.stringify ({
                usuario: usuario,
                contraseña: contraseña,
            }),
            success: (data, textStatus, jqXHR) => {
                borrarmsg();
                $("#login").after(pintarInfo("Usuario " + data.nombre + " creado correctamente, logueate!"));     
            },
            error: (jqXHR, textStatus, errorThrown) =>{
                if(jqXHR.status === 400){
                    borrarmsg();
                    $("#login").after(pintarError("El usuario ya existe en la BBDD"));
                }
                if(jqXHR.status === 401){
                    borrarmsg();
                    $("#login").after(pintarError("Los campos de login y contraseña no están correctamente rellenos"));
                }           
            }
        });
    }else{

        borrarmsg();
        $("#login").after(pintarError("Los campos de login y contraseña no están correctamente rellenos"));
    }
}

//Funcion que desconecta al usuario y finaliza la sesion
function desconectar(){

        login = null;
        cadenaBase64 = null;
        borrarmsg();
        vaciarMenu();
        cargarPricipal();
}

/*-----------------------CONTROL PARTIDA-----------------------*/

//Funcion que crea una nueva partida
function crearPartida(){

    let nombrePartida = $("#nombreNuevaPartida").val();

    if(nombrePartida.length > 0){

        $.ajax({
            type: 'POST',
            url: '/crearPartida', 
            beforeSend: function(req) {
                // Añadimos la cabecera 'Authorization' con los datos de autenticación.
                req.setRequestHeader("Authorization",
                "Basic " + cadenaBase64);
            },
            contentType: "application/json",
            data: JSON.stringify ({
                nombrePartida: nombrePartida,
                idUsuario: loginId,
                nombreUsuario: login,
            }),
            success: (data, textStatus, jqXHR) => {

                borrarmsg();
                $("#unirsePartida").after(pintarInfo("Partida " + data.partida.nombre + " creada correctamente!"));
            
                $("#nombreNuevaPartida").prop("value", "");
                $("#misPartidas").after(pintarPestañas(data.partida));
            },
            error: (jqXHR, textStatus, errorThrown) =>{

                alert("Se ha producido un error: " + errorThrown);
            }
        });
    }else{

        borrarmsg();
        $("#unirsePartida").after(pintarError("El nombre de partida no puede estar vacio"));
    }
}

//Funcion que une al usuario a una partida existente
function unirsePartida(){

    let idPartida = $("#idUnirsePartida").val();

    if(idPartida.length > 0){

        $.ajax({
            type: 'POST',
            url: '/unirsePartida', 
            beforeSend: function(req) {
                // Añadimos la cabecera 'Authorization' con los datos de autenticación.
                req.setRequestHeader("Authorization",
                "Basic " + cadenaBase64);
            },
            contentType: "application/json",
            data: JSON.stringify ({
                idPartida: idPartida,
                idUsuario: loginId,
                nombreUsuario: login,
            }),
            success: (data, textStatus, jqXHR) => {
                borrarmsg();
                $("#unirsePartida").after(pintarInfo("Te has unido a la partida con id " + data.id));

                $("#idUnirsePartida").prop("value", "");
                $("#misPartidas").after(pintarPestañas(data));

            },
            error: (jqXHR, textStatus, errorThrown) =>{
                if(jqXHR.status === 400){
                    borrarmsg();
                    $("#unirsePartida").after(pintarError("Ya perteneces a esta partida"));
                }
                if(jqXHR.status === 402){
                    borrarmsg();
                    $("#unirsePartida").after(pintarError("La partida está llena"));
                }
                if(jqXHR.status === 403){
                    borrarmsg();
                    $("#unirsePartida").after(pintarError("La partida no existe"));
                }
            }
        });
    }else{

        borrarmsg();
        $("#unirsePartida").after(pintarError("El id de partida no puede estar vacio"));
    }
}

//Tratamiento de las cartas
function selecionarCarta(event){

    let idCarta = event.currentTarget.id;

    //Criterios de seleccion y deselección
    if($("#" + idCarta).hasClass("cartaSeleccionada")){
        $("#" + idCarta).removeClass("cartaSeleccionada");
    }
    else{
        $("#" + idCarta).addClass("cartaSeleccionada");
    }

}

//Funcion que maneja las pestañas de partidas
function muestraPartida(event){

    let nombrePartida = $(event.target);
    let idPartida = event.currentTarget.id;

    vaciarInfoPartida();
    vaciarCartasPartida();
    vaciarCartasMano();

    if(idPartida === "misPartidas"){
        borrarmsg();
        muestraMisPartidas(idPartida);
    }else{
        borrarmsg();
        cargarPartida(idPartida);
    }
}

//Juega las cartas seleccionadas
function jugarCartas() {

    let vCartas = [];
    let nCartasMesa = 0;
    let idPartida = $("a.active").parent().prop("id");

    //Obtenemos el numero de cartas en la mesa
    $(".cartaMesa").each(function (index, value) { 
       
        nCartasMesa++;
    });

    let palo = null;
    let aux = false;

    //Obtenemos el palo seleccionado
    if(nCartasMesa === 0){

        palo = $("#paloInput :selected").text();

        //Controla si se ha elegido un palo
        if(palo === "Elige palo" && aux){

            borrarmsg();
            $("#partida").after(pintarError("No hay palo seleccionado"));
        }else{

            juega (vCartas, login, idPartida, palo);
        }

    }else{

        palo = "noCambia";

        juega (vCartas, login, idPartida, palo);
    }
}

function juega(vCartas, login, idPartida, palo){

    //Obtenemos las cartas seleccionadas
    $(".cartaSeleccionada").each(function (index, value) { 
        
        vCartas.push($(this).attr('id'));
    });

    //Si hay cartas seleccionadas se juega
    if (vCartas.length > 0){

        let idPartida = $("a.active").parent().prop("id");

        $.ajax({
            type: 'POST',
            url: '/jugarCartas', 
            beforeSend: function(req) {
                // Añadimos la cabecera 'Authorization' con los datos de autenticación.
                req.setRequestHeader("Authorization",
                "Basic " + cadenaBase64);
            },
            contentType: "application/json",
            data: JSON.stringify ({
                vCartas: vCartas,
                nombreUsuario: login,
                idPartida: idPartida,
                palo: palo,
            }),
            success: (data, textStatus, jqXHR) => {

                vaciarCartasMano();
                vaciarCartasPartida();
                cargarPartida(idPartida);
                
            },
            error: (jqXHR, textStatus, errorThrown) =>{

                alert("Se ha producido un error: " + errorThrown);
            }
        });

    }else{

        borrarmsg();
        $("#partida").after(pintarError("No hay cartas seleccionadas"));
    }
}

function mentiroso(){

    let idPartida = $("a.active").parent().prop("id");

    alert("Entro en mentiroso");
   
    $.ajax({
        type: 'POST',
        url: '/mentiroso', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify ({
            idPartida: idPartida,
            nombreUsuario: login,
        }),
        success: (data, textStatus, jqXHR) => {

            actualizaPartida();

        },
        error: (jqXHR, textStatus, errorThrown) =>{
            
            alert("Error");
            
        }
    });

}

/*-----------------------MOSTRAR-----------------------*/

//Funcion que carga las vistas principales
function cargarPricipal(){

    borrarmsg();
    ocultar();
    $("#login").show();
    $("#bienvenido").show();
}

//Carga el menu
function cargaMenu(){

    $.ajax({
        type: 'GET',
        url: '/participaEnPartidas', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        data: {
            idUsuario: loginId,
        },
        success: (data, textStatus, jqXHR) => {

            $("#listaPartidas").prepend(pintarPestañamisPartidas());

            data.forEach(elem => {
                
                $("#misPartidas").after(pintarPestañas(elem));
            });

        },
        error: (jqXHR, textStatus, errorThrown) =>{

            alert("Se ha producido un error: " + errorThrown);
        }
    });

    $("#menu").show();
}

//Muestra la pestaña mis partidas
function muestraMisPartidas(idPartida){

    ocultar();

    $("#sesion").show();
    $("a.active").removeClass("active");
    $("li.active").removeClass("active show");

    let pestaña = document.getElementById(idPartida);
    $(pestaña).children().addClass("active");
    $("#menu").show();
    $("#crearPartida").show();
    $("#unirsePartida").show();
}

//Carga la vista de una partida
function cargarPartida(idPartida){

    $.ajax({
        type: 'GET',
        url: '/estadoPartida', 
        beforeSend: function(req) {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization",
            "Basic " + cadenaBase64);
        },
        data: {
            idPartida: idPartida,
            nombreJugador: login,
        },
           
        success: (data, textStatus, jqXHR) => {
    
            ocultar();

            //Pinta info partida
            pintaInfoMesa(data.partida.nJugadores, data.partida.id);
            
            //Pinta info jugadores
            pintaInfoJugadores(data.partida.jugador);

            //Pinta las cartas del jugador
            pintaCartasMano(data.partida.jugador, login);
            
            //Pinta las cartas de la mesa. Si no hay cartas en la mesa y es tu turno te muestra el selector del palo
            pintaCartasMesa(data.partida.mesa.numeroJugado, data.partida.turno, data.partida.mesa.nCartasMesa);
            
            //Pinta el turno actual
            pintaTurno(data.partida.turno);

            //Pinta las opciones de juego
            pintaOpcionesJuego(data.partida.turno);

            //Pinta la ultima jugada
            pintaUltimaJugada(data.partida.mesa.nCartasMesa);
            
            //Activa la pestaña seleccionada
            let pestaña = document.getElementById(data.partida.id);
            $(pestaña).children().addClass("active");

            //Pinta nombre partida
            $("#nombrePartidaInfo").text(data.partida.nombre);
        
            $("#sesion").show();
            $("#menu").show();    
            $("#partida").show();

        },
        error: (jqXHR, textStatus, errorThrown) =>{
    
            alert("Se ha producido un error: " + errorThrown);
        }
    });        
}

//Funcion que actualiza la partida
function actualizaPartida(){

    let nombrePartida = $("#nombrePartidaInfo").text();
    let idPartida = $("a.active").parent().prop("id");

    vaciarInfoPartida();
    vaciarCartasPartida();
    vaciarCartasMano();

    cargarPartida(idPartida);
}

/*-----------------------PINTAR-----------------------*/

//Pinta la pestaña mis partidas
function pintarPestañamisPartidas() {
    let result = $("<li>").addClass("nav-item").prop("id", "misPartidas");
    result.append($("<a data-toggle='tab'>").addClass("nav-link active").prop("role", "tab").prop("href", "#misPartidas").text("Mis partidas"));
    return result;
}

//Convierte partidas en pestañas
function pintarPestañas(partida) {
    let result = $("<li>").addClass("nav-item").prop("id", partida.id);
    result.append($("<a data-toggle='tab'>").addClass("nav-link").prop("role", "tab").prop("href", "#" + partida.id).text(partida.nombre));
    return result;
}

//Funcion que pinta la informacion de la mesa si esta aun no ha empezado
function pintaInfoMesa(nParticipantes, idPartida){

    if(nParticipantes < 4){
                
        $("#noJugadoresInfo").text("Aun no hay suficientes participantes");
        $("#idPartidaInfo").text("El identificador de la partida es el: " + idPartida);
    }
}

//Funcion que pinta el nombre y las cartas de cada jugador
function pintaInfoJugadores(jugador){

    let i = 1;

    jugador.forEach(elem => {

        $("#nombreJugadorInfo" + i).text(elem.nombre);
        $("#nCartasJugadorInfo" + i).text(elem.nCartas);
        i++;
    });
}

//Funcion que resalta el turno actual
function pintaTurno(turno){

    $("#jugadores").find(".bg-success").removeClass("bg-success");

    let aux;

    for(let i = 1; i < 5; i++){

        aux = $("#nombreJugadorInfo" + i).text();
        if(aux === turno && turno.length > 0){
            $("#nombreJugadorInfo" + i).parent().addClass("bg-success");
        }
    }
}

//Funcion que pinta las cartas de la mano del jugador
function pintaCartasMano(arrayJugadores, nombre){

    arrayJugadores.forEach(jugador => {

        if(jugador.nombre === nombre){

            jugador.mano.forEach(carta => {

                $("#cartas-mano").append(pintarCarta(carta));
            });
        }
    });

    
}

//Funcion que pinta las cartas de la mesa, si es tu turno y no hay cartas en la mesa muestra el selector de palo
function pintaCartasMesa(numeroJugado, turno, nCartasMesa){

    if(turno === login && numeroJugado === 0){

        $("#seleccionarPalo").show();
    }

    for(let i = 0; i < nCartasMesa; i++){

        $("#cartas-mesa").append(pintarMesa(numeroJugado));
    };
}

//Funcion que pinta una carta
function pintarCarta(carta){

    let result = ($("<img src='img/" + carta + ".png'>").addClass("m-2").prop("id", carta));
    return result;

}

//Funcion que muestra las cartas de la mesa
function pintarMesa(numeroJugado){

    let result = $("<span>").addClass("d-inline-block cartaMesa bg-warning m-1 p-1");
    result.append($("<h4>").text(numeroJugado));
    return result;
}

//Funcion que pinta la jugada del turno anterior
function pintaUltimaJugada(nCartasMesa){

    if(nCartasMesa === 0){

        $("#jugadaAnterior").text("Aun no se han jugado cartas").show();
    }else{

        $("#jugadaAnterior").text(jugadaAnterior).show();
    }
}

//Funcion que pinta las opciones de juego si es tu turno
function pintaOpcionesJuego(turno){

    if(turno === login){

        $("#turno").show();
    }
}

//Funcion que muestra un error
function pintarError(mensaje) {

    let result = $("<div>").addClass("container d-flex justify-content-center mt-1 pl-4").prop("id", "msgLogin");
    result.append($("<h5>").addClass("text-danger").text(mensaje));
    return result;

}

//Funcion que muestra mensajes
function pintarInfo(mensaje) {

    let result = $("<div>").addClass("container d-flex justify-content-center mt-1 pl-4").prop("id", "msgLogin");
    result.append($("<h5>").addClass("text-success").text(mensaje));
    return result;

}

/*-----------------------VACIAR-----------------------*/

//Vacia cartas de la partida
function vaciarCartasPartida(){

    $("#cartas-mesa").empty();
}

//Vacia cartas de la partida
function vaciarCartasMano(){

    $("#cartas-mano").empty();
}

//Vacia cartas de la partida
function vaciarMenu(){

    $("#listaPartidas").empty();
}

//Vacia la informacion de la partida
function vaciarInfoPartida(){

    //Datos partida
    $("#nombrePartidaInfo").empty();
    $("#noJugadoresInfo").empty();
    $("#idPartidaInfo").empty();

    //Datos jugadores
    $("#nombreJugadorInfo1").empty();
    $("#nCartasJugadorInfo1").empty();

    $("#nombreJugadorInfo2").empty();
    $("#nCartasJugadorInfo2").empty();

    $("#nombreJugadorInfo3").empty();
    $("#nCartasJugadorInfo3").empty();

    $("#nombreJugadorInfo4").empty();
    $("#nCartasJugadorInfo4").empty();
}

//Funcion que borra los mensajes
function borrarmsg() {

    $("#msgLogin").remove();    
}

//Funcion que oculta todos los elementos
function ocultar(){

    $("#login").hide();
    $("#bienvenido").hide();
    $("#sesion").hide();
    $("#crearPartida").hide();
    $("#unirsePartida").hide();
    $("#menu").hide();
    $("#partida").hide();
    $("#turno").hide();
    $("#seleccionarPalo").hide();
    $("#jugadaAnterior").hide();
    borrarmsg();
    $("a.active").removeClass("active");
    $("li.active").removeClass("active show");
}