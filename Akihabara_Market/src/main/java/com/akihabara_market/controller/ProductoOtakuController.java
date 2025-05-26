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
 * @author Juan J. Tornero
 * @version 1.0
 * @since 2024-05-26
 */
@RestController
@RequestMapping("/api/v1/productos")
@Tag(name = "Productos Otaku", description = "API para la gestión de productos otaku en el inventario.")
public class ProductoOtakuController {

    @Autowired
    private ProductoOtakuRepository productoOtakuRepository;

    /**
     * Obtiene todos los productos otaku del inventario.
     *
     * @return Una lista de {@link ProductoOtaku}.
     */
    @Operation(summary = "Obtener todos los productos",
            description = "Recupera una lista de todos los productos otaku disponibles en el inventario.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de productos recuperada exitosamente.",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class)))
            })
    @GetMapping
    public ResponseEntity<List<ProductoOtaku>> getAllProducts() {
        List<ProductoOtaku> products = productoOtakuRepository.findAll();
        return ResponseEntity.ok(products);
    }

    /**
     * Obtiene un producto otaku por su ID.
     *
     * @param id El ID del producto a buscar.
     * @return Un {@link ResponseEntity} con el producto encontrado o un estado 404 si no existe.
     */
    @Operation(summary = "Obtener producto por ID",
            description = "Recupera los detalles de un producto otaku específico por su ID.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Producto encontrado exitosamente.",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class))),
                    @ApiResponse(responseCode = "404", description = "Producto no encontrado.")
            })
    @GetMapping("/{id}")
    public ResponseEntity<ProductoOtaku> getProductById(
            @Parameter(description = "ID del producto a buscar", required = true, example = "1")
            @PathVariable Long id) {
        Optional<ProductoOtaku> product = productoOtakuRepository.findById(id);
        return product.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Añade un nuevo producto otaku al inventario.
     *
     * @param product El objeto {@link ProductoOtaku} a añadir.
     * @return Un {@link ResponseEntity} con el producto creado y un estado 201 Created.
     */
    @Operation(summary = "Añadir un nuevo producto",
            description = "Crea un nuevo producto otaku en el inventario. La fecha de última reposición se establece automáticamente a la fecha actual si no se proporciona.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Producto creado exitosamente.",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class))),
                    @ApiResponse(responseCode = "400", description = "Datos de producto inválidos.")
            })
    @PostMapping
    public ResponseEntity<ProductoOtaku> addProduct(@Valid @RequestBody ProductoOtaku product) {
        // Si la fecha de última reposición no se proporciona, se establece a la fecha actual
        if (product.getUltimaFechaReposicion() == null) {
            product.setUltimaFechaReposicion(LocalDate.now());
        }
        ProductoOtaku savedProduct = productoOtakuRepository.save(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    /**
     * Actualiza un producto otaku existente por su ID.
     *
     * @param id El ID del producto a actualizar.
     * @param productDetails El objeto {@link ProductoOtaku} con los datos actualizados.
     * @return Un {@link ResponseEntity} con el producto actualizado o un estado 404 si no existe.
     */
    @Operation(summary = "Actualizar un producto existente",
            description = "Actualiza los detalles de un producto otaku existente por su ID. La fecha de última reposición se actualiza automáticamente a la fecha actual si el stock aumenta.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Producto actualizado exitosamente.",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class))),
                    @ApiResponse(responseCode = "404", description = "Producto no encontrado."),
                    @ApiResponse(responseCode = "400", description = "Datos de producto inválidos.")
            })
    @PutMapping("/{id}")
    public ResponseEntity<ProductoOtaku> updateProduct(
            @Parameter(description = "ID del producto a actualizar", required = true, example = "1")
            @PathVariable Long id,
            @Valid @RequestBody ProductoOtaku productDetails) {
        Optional<ProductoOtaku> productOptional = productoOtakuRepository.findById(id);

        if (productOptional.isPresent()) {
            ProductoOtaku existingProduct = productOptional.get();

            // Guardar el stock actual antes de la actualización
            Integer oldStock = existingProduct.getStock();

            existingProduct.setNombre(productDetails.getNombre());
            existingProduct.setCategoria(productDetails.getCategoria());
            existingProduct.setPrecio(productDetails.getPrecio());
            existingProduct.setStock(productDetails.getStock());
            existingProduct.setProveedor(productDetails.getProveedor());
            existingProduct.setNivelMinimoStock(productDetails.getNivelMinimoStock());

            // Lógica para actualizar automáticamente la ultimaFechaReposicion
            // Si el nuevo stock es mayor que el stock anterior, asumimos una reposición
            if (productDetails.getStock() != null && oldStock != null && productDetails.getStock() > oldStock) {
                existingProduct.setUltimaFechaReposicion(LocalDate.now());
            } else if (productDetails.getUltimaFechaReposicion() != null) {
                // Si el stock no aumenta, pero se proporciona una fecha de reposición explícita, la usamos
                existingProduct.setUltimaFechaReposicion(productDetails.getUltimaFechaReposicion());
            }


            ProductoOtaku updatedProduct = productoOtakuRepository.save(existingProduct);
            return ResponseEntity.ok(updatedProduct);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Elimina un producto otaku por su ID.
     *
     * @param id El ID del producto a eliminar.
     * @return Un {@link ResponseEntity} con un estado 204 No Content si la eliminación fue exitosa.
     */
    @Operation(summary = "Eliminar un producto",
            description = "Elimina un producto otaku del inventario por su ID.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "Producto eliminado exitosamente."),
                    @ApiResponse(responseCode = "404", description = "Producto no encontrado.")
            })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "ID del producto a eliminar", required = true, example = "1")
            @PathVariable Long id) {
        if (productoOtakuRepository.existsById(id)) {
            productoOtakuRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtiene una lista de todos los proveedores únicos de los productos.
     *
     * @return Una lista de cadenas con los nombres de los proveedores únicos.
     */
    @Operation(summary = "Obtener proveedores únicos",
            description = "Recupera una lista de todos los proveedores únicos asociados a los productos en el inventario.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Lista de proveedores recuperada exitosamente.",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(type = "array", implementation = String.class)))
            })
    @GetMapping("/proveedores")
    public ResponseEntity<List<String>> getUniqueProveedores() {
        List<String> proveedores = productoOtakuRepository.findDistinctProveedores();
        return ResponseEntity.ok(proveedores);
    }

    /**
     * Genera un informe de productos basado en criterios de filtrado dinámicos.
     * Permite filtrar por categoría, stock mínimo/máximo, rango de precios, rango de fechas de reposición,
     * proveedor y nombre del producto.
     *
     * @param category Filtra por categoría de producto (opcional).
     * @param minStock Filtra por stock mínimo (opcional).
     * @param maxStock Filtra por stock máximo (opcional).
     * @param minPrice Filtra por precio mínimo (opcional).
     * @param maxPrice Filtra por precio máximo (opcional).
     * @param startDate Filtra por fecha de última reposición desde (opcional).
     * @param endDate Filtra por fecha de última reposición hasta (opcional).
     * @param supplier Filtra por proveedor (coincidencia parcial, case-insensitive) (opcional).
     * @param productName Filtra por nombre de producto (coincidencia parcial, case-insensitive) (opcional).
     * @return Una lista de {@link ProductoOtaku} que coinciden con los criterios.
     */
    @Operation(summary = "Generar informe de productos",
            description = "Genera un informe detallado de productos aplicando diversos filtros.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Informe generado exitosamente.",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ProductoOtaku.class)))
            })
    @GetMapping("/informe")
    public ResponseEntity<List<ProductoOtaku>> generateReport(
            @Parameter(description = "Categoría del producto") @RequestParam(required = false) String category,
            @Parameter(description = "Stock mínimo") @RequestParam(required = false) Integer minStock,
            @Parameter(description = "Stock máximo") @RequestParam(required = false) Integer maxStock,
            @Parameter(description = "Precio mínimo") @RequestParam(required = false) Double minPrice,
            @Parameter(description = "Precio máximo") @RequestParam(required = false) Double maxPrice,
            @Parameter(description = "Fecha de reposición desde (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Fecha de reposición hasta (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Nombre del proveedor") @RequestParam(required = false) String supplier,
            @Parameter(description = "Nombre del producto") @RequestParam(required = false) String productName) {

        Specification<ProductoOtaku> spec = Specification.where(null); // Inicializa con una especificación nula

        // Si se proporciona una categoría, añade el filtro
        if (category != null && !category.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(criteriaBuilder.lower(root.get("categoria")), category.toLowerCase()));
        }

        // Si se proporciona un stock mínimo, añade el filtro
        if (minStock != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("stock"), minStock));
        }
        // Si se proporciona un stock máximo, añade el filtro
        if (maxStock != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.lessThanOrEqualTo(root.get("stock"), maxStock));
        }

        // Si se proporciona un precio mínimo, añade el filtro
        if (minPrice != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("precio"), minPrice));
        }
        // Si se proporciona un precio máximo, añade el filtro
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
