package com.akihabara_market.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones para la aplicación.
 * Captura excepciones y devuelve respuestas HTTP significativas.
 * Esta clase utiliza {@link ControllerAdvice} para centralizar el manejo de excepciones
 * en todos los controladores de la aplicación.
 *
 * @author Juan J. Tornero
 * @version 1.0
 * @since 2024-05-26
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja las excepciones de validación de argumentos de métodos (por ejemplo, cuando se usa {@code @Valid}
     * en un {@code @RequestBody} y la validación falla).
     * Recopila todos los errores de validación y los devuelve en un mapa con el nombre del campo
     * y el mensaje de error asociado.
     *
     * @param ex La excepción {@link MethodArgumentNotValidException} que contiene los detalles de los errores de validación.
     * @return Un {@link ResponseEntity} con un mapa de errores de validación (clave: nombre del campo, valor: mensaje de error)
     * y un estado HTTP 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // Aquí se pueden añadir otros manejadores de excepciones genéricos o específicos
    // Por ejemplo, para DataIntegrityViolationException, ResourceNotFoundException, etc.
}
