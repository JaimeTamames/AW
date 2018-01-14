"use strict";

$(document).ready(() => {

    $("#aceptarLogin").on("click", () => {

        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();

        $.ajax({
            type: 'GET',
            url: '/login',
<<<<<<< HEAD
=======
            
>>>>>>> 0c918476353a184c086a42e2f758303c6481f020
            data: {
                usuario: usuario,
                contraseña: contraseña,
            },
            success: (data) => {
                
                $("#login").hide();
                $("#bienvenido").hide();
                $("#sesion").show();
            },
            error: (data) =>{

                alert("nope");
            }
        });

    });

});