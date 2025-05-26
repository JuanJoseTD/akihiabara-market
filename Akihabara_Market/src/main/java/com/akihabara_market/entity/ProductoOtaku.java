package com.akihabara_market.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

/**
 * Representa un producto otaku en el sistema de gestión de inventario de Akihabara Market.
 * Esta clase es una entidad JPA y está mapeada a una tabla en la base de datos.
 * Incluye validaciones básicas para sus atributos y anotaciones para la documentación OpenAPI.
 *
 * @author Juan J. Tornero
 * @version 1.0
 * @since 2024-05-26
 */
@Entity
@Schema(description = "Detalles de un producto otaku disponible en Akihabara Market")
public class ProductoOtaku {

    /**
     * Identificador único del producto.
     * Generado automáticamente por la base de datos.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único del producto", example = "1")
    private Long id;

    /**
     * Nombre del producto.
     * Es un campo obligatorio y no puede estar en blanco.
     */
    @NotBlank(message = "El nombre del producto no puede estar en blanco")
    @Schema(description = "Nombre del producto", example = "Figura Son Goku Super Saiyan")
    private String nombre;

    /**
     * Categoría del producto.
     * Es un campo obligatorio y no puede estar en blanco.
     */
    @NotBlank(message = "La categoría del producto no puede estar en blanco")
    @Schema(description = "Categoría a la que pertenece el producto", example = "Figura")
    private String categoria;

    /**
     * Precio del producto.
     * Debe ser un valor no nulo y mayor o igual a 0.
     */
    @NotNull(message = "El precio no puede ser nulo")
    @Min(value = 0, message = "El precio debe ser mayor o igual a 0")
    @Schema(description = "Precio de venta del producto", example = "59.99")
    private Double precio;

    /**
     * Cantidad de stock disponible del producto.
     * Debe ser un valor no nulo y mayor o igual a 0.
     */
    @NotNull(message = "El stock no puede ser nulo")
    @Min(value = 0, message = "El stock debe ser mayor o igual a 0")
    @Schema(description = "Cantidad de unidades en stock", example = "25")
    private Integer stock;

    /**
     * Nombre del proveedor del producto.
     * Puede ser nulo.
     */
    @Schema(description = "Nombre del proveedor del producto", example = "Bandai Spirits", nullable = true)
    private String proveedor;

    /**
     * Nivel mínimo de stock para activar una alerta.
     * Puede ser nulo. Si es nulo, no se considera para alertas de stock bajo.
     */
    @Min(value = 0, message = "El nivel mínimo de stock debe ser mayor o igual a 0")
    @Schema(description = "Nivel de stock por debajo del cual se considera 'stock bajo'", example = "5", nullable = true)
    private Integer nivelMinimoStock;

    /**
     * Última fecha en que se realizó una reposición de este producto.
     * Puede ser nulo.
     */
    @Schema(description = "Fecha de la última reposición de stock (YYYY-MM-DD)", example = "2024-04-10", nullable = true)
    private LocalDate ultimaFechaReposicion;

    /**
     * Constructor por defecto.
     */
    public ProductoOtaku() {
    }

    /**
     * Constructor con todos los campos.
     *
     * @param id Identificador único del producto.
     * @param nombre Nombre del producto.
     * @param categoria Categoría del producto.
     * @param precio Precio del producto.
     * @param stock Cantidad de stock disponible.
     * @param proveedor Nombre del proveedor.
     * @param nivelMinimoStock Nivel mínimo de stock para alerta.
     * @param ultimaFechaReposicion Última fecha de reposición.
     */
    public ProductoOtaku(Long id, String nombre, String categoria, Double precio, Integer stock, String proveedor, Integer nivelMinimoStock, LocalDate ultimaFechaReposicion) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
        this.proveedor = proveedor;
        this.nivelMinimoStock = nivelMinimoStock;
        this.ultimaFechaReposicion = ultimaFechaReposicion;
    }

    // --- Getters y Setters ---

    /**
     * Obtiene el identificador único del producto.
     * @return El ID del producto.
     */
    public Long getId() {
        return id;
    }

    /**
     * Establece el identificador único del producto.
     * @param id El nuevo ID del producto.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Obtiene el nombre del producto.
     * @return El nombre del producto.
     */
    public String getNombre() {
        return nombre;
    }

    /**
     * Establece el nombre del producto.
     * @param nombre El nuevo nombre del producto.
     */
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    /**
     * Obtiene la categoría del producto.
     * @return La categoría del producto.
     */
    public String getCategoria() {
        return categoria;
    }

    /**
     * Establece la categoría del producto.
     * @param categoria La nueva categoría del producto.
     */
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    /**
     * Obtiene el precio del producto.
     * @return El precio del producto.
     */
    public Double getPrecio() {
        return precio;
    }

    /**
     * Establece el precio del producto.
     * @param precio El nuevo precio del producto.
     */
    public void setPrecio(Double precio) {
        this.precio = precio;
    }

    /**
     * Obtiene la cantidad de stock del producto.
     * @return La cantidad de stock.
     */
    public Integer getStock() {
        return stock;
    }

    /**
     * Establece la cantidad de stock del producto.
     * @param stock La nueva cantidad de stock.
     */
    public void setStock(Integer stock) {
        this.stock = stock;
    }

    /**
     * Obtiene el nombre del proveedor del producto.
     * @return El nombre del proveedor.
     */
    public String getProveedor() {
        return proveedor;
    }

    /**
     * Establece el nombre del proveedor del producto.
     * @param proveedor El nuevo nombre del proveedor.
     */
    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }

    /**
     * Obtiene el nivel mínimo de stock del producto.
     * @return El nivel mínimo de stock.
     */
    public Integer getNivelMinimoStock() {
        return nivelMinimoStock;
    }

    /**
     * Establece el nivel mínimo de stock del producto.
     * @param nivelMinimoStock El nuevo nivel mínimo de stock.
     */
    public void setNivelMinimoStock(Integer nivelMinimoStock) {
        this.nivelMinimoStock = nivelMinimoStock;
    }

    /**
     * Obtiene la última fecha de reposición del producto.
     * @return La fecha de la última reposición.
     */
    public LocalDate getUltimaFechaReposicion() {
        return ultimaFechaReposicion;
    }

    /**
     * Establece la última fecha de reposición del producto.
     * @param ultimaFechaReposicion La nueva fecha de última reposición.
     */
    public void setUltimaFechaReposicion(LocalDate ultimaFechaReposicion) {
        this.ultimaFechaReposicion = ultimaFechaReposicion;
    }

    /**
     * Retorna una representación en cadena del objeto ProductoOtaku.
     *
     * @return Una cadena que representa los atributos del producto.
     */
    @Override
    public String toString() {
        return "ProductoOtaku{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", categoria='" + categoria + '\'' +
                ", precio=" + precio +
                ", stock=" + stock +
                ", proveedor='" + proveedor + '\'' +
                ", nivelMinimoStock=" + nivelMinimoStock +
                ", ultimaFechaReposicion=" + ultimaFechaReposicion +
                '}';
    }
}
