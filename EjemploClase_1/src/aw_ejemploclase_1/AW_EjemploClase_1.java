package aw_ejemploclase_1;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;

public class AW_EjemploClase_1 {

    public static void main(String... args) throws IOException {
    Socket s = new Socket("informatica.ucm.es", 80);
    BufferedWriter bw = new BufferedWriter(
            new OutputStreamWriter(s.getOutputStream()));
    BufferedReader br = new BufferedReader(
            new InputStreamReader(s.getInputStream()));

    // Escritura de la petición
    bw.write("GET / HTTP/1.0 \n");
    bw.write("host: informatica.ucm.es \n\n");
    bw.flush();

    // Recepción de la respuesta
    System.out.println(br.readLine());
    System.out.println(br.readLine());
    System.out.println(br.readLine());
    System.out.println(br.readLine());
    System.out.println(br.readLine());
    System.out.println(br.readLine());
    System.out.println(br.readLine());
    System.out.println(br.readLine());
    
    
    bw.close();
    br.close();
}
    
}
