package com.akihabara_market.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de OpenAPI (Swagger) para la documentación de la API.
 * Proporciona metadatos para la generación de la documentación interactiva de la API,
 * incluyendo información sobre el título, versión, descripción, términos de servicio,
 * contacto y licencia.
 *
 * @author [Tu Nombre/Nombre del Equipo]
 * @version 1.0
 * @since 2024-05-26
 */
@Configuration
public class OpenApiConfig {

    /**
     * Define un bean de tipo {@link OpenAPI} que configura la información principal
     * de la documentación de la API.
     *
     * @return Un objeto {@link OpenAPI} configurado con los detalles de la API.
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Gestión de Productos Akihabara Market") // Título de la API
                        .version("1.0.0") // Versión de la API
                        .description("Microservicio para la gestión del inventario de la tienda otaku 'Akihabara Market'. Permite operaciones CRUD sobre los productos y generación de informes.") // Descripción de la API actualizada
                        .termsOfService("http://swagger.io/terms/") // Términos de servicio (ejemplo)
                        .contact(new Contact()
                                .name("Equipo de Desarrollo Akihabara") // Nombre del equipo de contacto
                                .url("https://akihabaramarket.com/support") // URL de soporte (ejemplo)
                                .email("soporte@akihabaramarket.com")) // Correo de contacto
                        .license(new License()
                                .name("Apache 2.0") // Licencia
                                .url("http://springdoc.org"))); // URL de la licencia
    }
}