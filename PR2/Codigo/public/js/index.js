"use strict";

$(document).ready(() => {

    $("#aceptarLogin").on("click", () => {

        alert('$("#nombreUsuario").val()');
    
        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();
        
        $.ajax({
            type: 'GET',
            url: '/login',
            data: {
                usuario: usuario,
                contraseña: contraseña,
            },
            success: (data, textStatus, jqXHR) => {

                $("#login").hide();
                $("#bienvenido").hide();
                $("#sesion").show();
            }
        });

    });

});