"use strict";

$(document).ready(() => {

    $("#aceptarLogin").on("click", () => {

        let usuario = $("#nombreUsuario").val();
        let contraseña = $("#contraseñaUsuario").val();

        $.ajax({
            type: 'GET',
            url: '/login',
            beforeSend: (req) => {
                req.setRequestHeader("Authorization", "Basic " + btoa(usuario + ":" + contraseña));
            },
            data: {
                usuario: usuario,
                contraseña: contraseña,
            },
            success: (data, state, jqXRH) => {
                
                $("#login").hide();
                $("#bienvenido").hide();
                $("#sesion").show();
            },
            error: (jqXHR, textStatus, errorThrown) =>{

                alert("Datos introducidos incorrectos");
                alert(errorThrown);
            }
        });

    });

});