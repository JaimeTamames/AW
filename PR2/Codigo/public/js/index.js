"use strict";

$(document).ready(() => {

    $("#aceptarLogin").on("click", () => {

        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();

        $.ajax({
            type: 'GET',
            url: '/login',
            
            data: {
                usuario: usuario,
                contraseña: contraseña,
            },
            success: (data) => {

                $("#p").text(data.user);
                $("#p").before($("<p>").text("hola"));

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