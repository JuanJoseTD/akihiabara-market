package com.akihabara_market.controller;

import com.akihabara_market.entity.ProductoOtaku;
import com.akihabara_market.repository.ProductoOtakuRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Controlador REST para la gestión de productos otaku en Akihabara Market.
 * Ofrece endpoints para operaciones CRUD de productos y generación de informes.
 * Este controlador expone la API bajo la ruta "/api/v1/productos".
 *
 * @author [Tu Nombre/Nombre del Equipo]
 * @version 1.0
 * @since 2024-05-26
 */
@RestController
@RequestMapping("/api/v1/productos")
@Tag(name = "Gestión de Productos Otaku", description = "API para administrar el inventario de la tienda Akihabara Market")
public class ProductoOtakuController {

    @Autowired
    private ProductoOtakuRepository productoOtakuRepository;

    /**
     * Obtiene una lista de todos los productos otaku disponibles.
     * Permite filtrar por nombre o categoría mediante un parámetro de búsqueda.
     *
     * @param search Cadena de texto opcional para buscar productos por nombre o categoría.
     * @return Un {@link ResponseEntity} que contiene una lista de {@link ProductoOtaku}
     * con estado HTTP 200 (OK).
     */
    @Operation(summary = "Obtener todos los productos o filtrar por nombre/categoría",
            description = "Recupera una lista de todos los productos otaku. Opcionalmente, puede filtrar la lista por nombre o categoría del producto.",
            parameters = @Parameter(name = "search", description = "Cadena de búsqueda para filtrar por nombre o categoría (opcional)", example = "Figura"),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de productos recuperada exitosamente",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class)))
            })
    @GetMapping
    public ResponseEntity<List<ProductoOtaku>> getAllProductos(@RequestParam(required = false) String search) {
        List<ProductoOtaku> productos;
        if (search != null && !search.isEmpty()) {
            productos = productoOtakuRepository.findByNombreContainingIgnoreCaseOrCategoriaContainingIgnoreCase(search, search);
        } else {
            productos = productoOtakuRepository.findAll();
        }
        return ResponseEntity.ok(productos);
    }

    /**
     * Obtiene un producto otaku por su identificador único.
     *
     * @param id El ID del producto a buscar.
     * @return Un {@link ResponseEntity} que contiene el {@link ProductoOtaku} si se encuentra
     * (estado 200 OK), o un estado 404 (Not Found) si no existe.
     */
    @Operation(summary = "Obtener un producto por ID",
            description = "Recupera los detalles de un producto específico utilizando su ID.",
            parameters = @Parameter(name = "id", description = "ID del producto a buscar", example = "1"),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Producto encontrado exitosamente",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class))),
                    @ApiResponse(responseCode = "404", description = "Producto no encontrado",
                            content = @Content)
            })
    @GetMapping("/{id}")
    public ResponseEntity<ProductoOtaku> getProductoById(@PathVariable Long id) {
        Optional<ProductoOtaku> producto = productoOtakuRepository.findById(id);
        return producto.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Crea un nuevo producto otaku en el inventario.
     * El producto debe ser válido según las anotaciones de validación en la entidad {@link ProductoOtaku}.
     *
     * @param productoOtaku El objeto {@link ProductoOtaku} a crear.
     * @return Un {@link ResponseEntity} que contiene el producto creado (estado 201 Created).
     */
    @Operation(summary = "Crear un nuevo producto",
            description = "Añade un nuevo producto al inventario. Se requiere un objeto ProductoOtaku válido.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del nuevo producto",
                    required = true, content = @Content(schema = @Schema(implementation = ProductoOtaku.class))),
            responses = {
                    @ApiResponse(responseCode = "201", description = "Producto creado exitosamente",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class))),
                    @ApiResponse(responseCode = "400", description = "Solicitud inválida (errores de validación)",
                            content = @Content)
            })
    @PostMapping
    public ResponseEntity<ProductoOtaku> createProducto(@Valid @RequestBody ProductoOtaku productoOtaku) {
        // Al crear un producto, inicializamos la ultimaFechaReposicion
        if (productoOtaku.getUltimaFechaReposicion() == null) {
            productoOtaku.setUltimaFechaReposicion(LocalDate.now());
        }
        ProductoOtaku savedProducto = productoOtakuRepository.save(productoOtaku);
        return new ResponseEntity<>(savedProducto, HttpStatus.CREATED);
    }

    /**
     * Actualiza un producto existente por su ID.
     *
     * @param id El ID del producto a actualizar.
     * @param productoOtaku Los datos del producto con las actualizaciones.
     * @return Un {@link ResponseEntity} que contiene el producto actualizado (estado 200 OK)
     * o un estado 404 (Not Found) si el producto no existe.
     */
    @Operation(summary = "Actualizar un producto existente",
            description = "Actualiza los detalles de un producto existente utilizando su ID. Todos los campos se sobrescriben.",
            parameters = @Parameter(name = "id", description = "ID del producto a actualizar", example = "1"),
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Datos del producto a actualizar",
                    required = true, content = @Content(schema = @Schema(implementation = ProductoOtaku.class))),
            responses = {
                    @ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class))),
                    @ApiResponse(responseCode = "404", description = "Producto no encontrado",
                            content = @Content),
                    @ApiResponse(responseCode = "400", description = "Solicitud inválida (errores de validación)",
                            content = @Content)
            })
    @PutMapping("/{id}")
    public ResponseEntity<ProductoOtaku> updateProducto(@PathVariable Long id, @Valid @RequestBody ProductoOtaku productoOtaku) {
        Optional<ProductoOtaku> existingProductoOptional = productoOtakuRepository.findById(id);
        if (existingProductoOptional.isPresent()) {
            ProductoOtaku existingProducto = existingProductoOptional.get();
            existingProducto.setNombre(productoOtaku.getNombre());
            existingProducto.setCategoria(productoOtaku.getCategoria());
            existingProducto.setPrecio(productoOtaku.getPrecio());
            existingProducto.setStock(productoOtaku.getStock());
            existingProducto.setProveedor(productoOtaku.getProveedor()); // Asignar proveedor
            existingProducto.setNivelMinimoStock(productoOtaku.getNivelMinimoStock()); // Asignar nivel mínimo de stock
            // La fecha de reposición se actualiza solo si el stock aumenta significativamente o se gestiona en otro endpoint
            // Por simplicidad, no la actualizaremos automáticamente aquí a menos que se envíe explícitamente y sea diferente.
            // Para el caso de uso actual, se asume que esta fecha se actualiza en el backend en una lógica de reposición.
            return ResponseEntity.ok(productoOtakuRepository.save(existingProducto));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Elimina un producto por su ID.
     *
     * @param id El ID del producto a eliminar.
     * @return Un {@link ResponseEntity} con un estado 204 No Content si se elimina, o un 404 Not Found.
     */
    @Operation(summary = "Eliminar un producto",
            description = "Elimina un producto del inventario de forma permanente utilizando su ID.",
            parameters = @Parameter(name = "id", description = "ID del producto a eliminar", example = "1"),
            responses = {
                    @ApiResponse(responseCode = "204", description = "Producto eliminado exitosamente (Sin Contenido)",
                            content = @Content), // Para un 204, no hay contenido, pero se debe especificar @Content
                    @ApiResponse(responseCode = "404", description = "Producto no encontrado",
                            content = @Content) // Se añade content para que no haya advertencias, aunque esté vacío
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        if (productoOtakuRepository.existsById(id)) {
            productoOtakuRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtiene una lista de todos los proveedores únicos registrados en los productos.
     *
     * @return Un {@link ResponseEntity} que contiene una lista de cadenas con los nombres de los proveedores
     * y un estado HTTP 200 (OK).
     */
    @Operation(summary = "Obtener lista de proveedores únicos",
            description = "Recupera una lista de todos los proveedores únicos que están asociados a los productos en el inventario.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de proveedores recuperada exitosamente",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(type = "array", implementation = String.class)))
            })
    @GetMapping("/proveedores")
    public ResponseEntity<List<String>> getDistinctProveedores() {
        List<String> proveedores = productoOtakuRepository.findDistinctProveedores();
        return ResponseEntity.ok(proveedores);
    }

    /**
     * Genera un informe de productos con filtros opcionales.
     * Permite filtrar por stock mínimo, stock máximo, rango de precios, rango de fechas de última reposición,
     * proveedor y nombre del producto.
     *
     * @param minStock El stock mínimo para el filtro (opcional).
     * @param maxStock El stock máximo para el filtro (opcional).
     * @param minPrice El precio mínimo para el filtro (opcional).
     * @param maxPrice El precio máximo para el filtro (opcional).
     * @param startDate La fecha de inicio para el rango de última reposición (opcional, formato YYYY-MM-DD).
     * @param endDate La fecha de fin para el rango de última reposición (opcional, formato YYYY-MM-DD).
     * @param supplier El nombre del proveedor para el filtro (coincidencia parcial, case-insensitive, opcional).
     * @param productName El nombre del producto para el filtro (coincidencia parcial, case-insensitive, opcional).
     * @return Un {@link ResponseEntity} que contiene una lista de {@link ProductoOtaku} que cumplen con los criterios de filtro,
     * con estado HTTP 200 (OK).
     */
    @Operation(summary = "Generar informe de productos con filtros",
            description = "Permite generar un informe de productos aplicando varios filtros como rango de stock, rango de precios, rango de fechas de última reposición, proveedor y nombre de producto.",
            parameters = {
                    @Parameter(name = "minStock", description = "Stock mínimo", example = "10", required = false),
                    @Parameter(name = "maxStock", description = "Stock máximo", example = "100", required = false),
                    @Parameter(name = "minPrice", description = "Precio mínimo", example = "5.0", required = false),
                    @Parameter(name = "maxPrice", description = "Precio máximo", example = "50.0", required = false),
                    @Parameter(name = "startDate", description = "Fecha de inicio de última reposición (YYYY-MM-DD)", example = "2023-01-01", required = false),
                    @Parameter(name = "endDate", description = "Fecha de fin de última reposición (YYYY-MM-DD)", example = "2023-12-31", required = false),
                    @Parameter(name = "supplier", description = "Nombre del proveedor (coincidencia parcial)", example = "Bandai", required = false),
                    @Parameter(name = "productName", description = "Nombre del producto (coincidencia parcial)", example = "Goku", required = false)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "Informe generado exitosamente",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class)))
            })
    @GetMapping("/informe")
    public ResponseEntity<List<ProductoOtaku>> getProductInforme(
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String productName) {

        Specification<ProductoOtaku> spec = Specification.where(null); // Inicia una especificación vacía

        // Filtro por stock
        if (minStock != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("stock"), minStock));
        }
        if (maxStock != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("stock"), maxStock));
        }

        // Filtro por precio
        if (minPrice != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("precio"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("precio"), maxPrice));
        }

        // Si se proporciona una fecha de inicio, añade el filtro a la especificación
        if (startDate != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("ultimaFechaReposicion"), startDate));
        }
        // Si se proporciona una fecha de fin, añade el filtro a la especificación
        if (endDate != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("ultimaFechaReposicion"), endDate));
        }

        // Si se proporciona un proveedor, añade el filtro de coincidencia parcial (case-insensitive)
        if (supplier != null && !supplier.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("proveedor")), "%" + supplier.toLowerCase() + "%"));
        }

        // Si se proporciona un nombre de producto, añade el filtro de coincidencia parcial (case-insensitive)
        if (productName != null && !productName.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("nombre")), "%" + productName.toLowerCase() + "%"));
        }

        // Ejecuta la consulta usando la especificación construida
        List<ProductoOtaku> products = productoOtakuRepository.findAll(spec);
        return ResponseEntity.ok(products);
    }
}