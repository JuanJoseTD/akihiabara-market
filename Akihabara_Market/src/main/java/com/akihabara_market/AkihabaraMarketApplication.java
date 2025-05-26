package com.akihabara_market;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal del microservicio Akihabara Market.
 * Esta clase arranca la aplicación Spring Boot.
 *
 * @author [Tu Nombre/Equipo]
 * @version 1.0
 * @since 2024-05-26
 */
@SpringBootApplication
public class AkihabaraMarketApplication {

    /**
     * Método principal que sirve como punto de entrada de la aplicación.
     * Utiliza SpringApplication.run para inicializar y lanzar la aplicación Spring Boot.
     *
     * @param args Argumentos de la línea de comandos pasados a la aplicación.
     */
    public static void main(String[] args) {
        SpringApplication.run(AkihabaraMarketApplication.class, args);
    }

}