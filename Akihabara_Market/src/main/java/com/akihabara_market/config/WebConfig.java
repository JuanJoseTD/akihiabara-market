package com.akihabara_market.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración web para la aplicación Spring Boot.
 * Esta clase implementa {@link WebMvcConfigurer} para personalizar la configuración
 * de Spring MVC, en particular para habilitar la configuración de CORS (Cross-Origin Resource Sharing).
 *
 * @author [Tu Nombre/Nombre del Equipo]
 * @version 1.0
 * @since 2024-05-26
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configura los mapeos CORS para permitir solicitudes desde orígenes específicos.
     * Esto es crucial para que el frontend (ej. un servidor de desarrollo en localhost:5500)
     * pueda comunicarse con el backend de Spring Boot.
     *
     * @param registry El registro de CORS al que se añaden los mapeos.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/v1/**") // Aplica CORS a todos los endpoints bajo /api/v1/
                .allowedOrigins("http://localhost:8080", "http://127.0.0.1:5500") // Permite el origen de tu frontend (ajusta si lo ejecutas en otro puerto o dominio)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos HTTP permitidos
                .allowedHeaders("*") // Cabeceras permitidas
                .allowCredentials(true); // Permitir el envío de cookies o credenciales (si fuera necesario)
    }
}