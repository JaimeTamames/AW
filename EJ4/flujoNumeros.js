class FlujoNumeros {
    constructor() {
        this.numeros = [6, 1, 4, 3, 10, 9, 8];
    }
    
    siguienteNumero(f) {
        setTimeout(() => {
          let result = this.numeros.shift();
          f(result);
        }, 100);
    }
}

/**
 * Imprime la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDosLog(flujo) {
    
	flujo.siguienteNumero(num => suma(flujo, num));
		
	function suma(flujo, n){
		
		flujo.siguienteNumero(num => {console.log(num + n);});
	}
}

/**
 * Llama a la función f con la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDos(flujo, f) {
    
	flujo.siguienteNumero(num => suma(flujo, num));
		
	function suma(flujo, n){
		
		flujo.siguienteNumero(num => f(num + n));
	}
}

/**
 * Llama a la función f con la suma de todos los números del flujo pasado como parámetro
 */
function sumaTodo(flujo, f) {

	
}

// 1
sumaDosLog(new FlujoNumeros());

// 2
sumaDos(new FlujoNumeros(), suma => {
	console.log(`El resultado de la suma de los dos primeros números es ${suma}`);
});

// 3
sumaTodo(new FlujoNumeros(), suma => {
	console.log(`El resultado de la suma de todos los números es ${suma}`);
});


/* NO MODIFICAR A PARTIR DE AQUÍ */
module.exports = {
    FlujoNumeros: FlujoNumeros,
    sumaDosLog: sumaDosLog,
    sumaDos: sumaDos,
    sumaTodo: sumaTodo
}