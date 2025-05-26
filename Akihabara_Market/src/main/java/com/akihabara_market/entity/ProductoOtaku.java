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
 * @author [Tu Nombre/Nombre del Equipo]
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
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Schema(description = "Nombre del producto otaku", example = "Figura de Tanjiro")
    private String nombre;

    /**
     * Categoría a la que pertenece el producto.
     * Es un campo obligatorio y no puede estar en blanco.
     * Valores permitidos: Figura, Manga, Póster, Accesorio, Otro.
     */
    @NotBlank(message = "La categoría del producto es obligatoria")
    @Schema(description = "Categoría a la que pertenece el producto", example = "Figura", allowableValues = {"Figura", "Manga", "Póster", "Accesorio", "Otro"})
    private String categoria;

    /**
     * Precio de venta del producto.
     * Es un campo obligatorio y debe ser un valor positivo o cero.
     */
    @NotNull(message = "El precio del producto es obligatorio")
    @Min(value = 0, message = "El precio debe ser un valor positivo")
    @Schema(description = "Precio de venta del producto", example = "29.99")
    private Double precio;

    /**
     * Cantidad de unidades disponibles en stock.
     * Debe ser un valor positivo o cero.
     */
    @NotNull(message = "El stock del producto es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    @Schema(description = "Cantidad de unidades disponibles en stock", example = "10")
    private Integer stock;

    /**
     * Proveedor del producto.
     * Este campo es opcional.
     */
    @Schema(description = "Nombre del proveedor del producto", example = "Bandai Spirits", nullable = true)
    private String proveedor;

    /**
     * Nivel mínimo de stock para activar una alerta.
     * Si el stock actual cae por debajo de este valor, se considera bajo. Este campo es opcional.
     */
    @Min(value = 0, message = "El nivel mínimo de stock no puede ser negativo")
    @Schema(description = "Nivel de stock mínimo para generar una alerta de reposición", example = "5", nullable = true)
    private Integer nivelMinimoStock;

    /**
     * Fecha de la última vez que se repuso el stock de este producto.
     * Este campo es opcional y se puede gestionar automáticamente.
     */
    @Schema(description = "Fecha de la última reposición de este producto", example = "2024-03-15", nullable = true)
    private LocalDate ultimaFechaReposicion;

    /**
     * Constructor por defecto de {@link ProductoOtaku}.
     */
    public ProductoOtaku() {
    }

    /**
     * Constructor para crear una nueva instancia de {@link ProductoOtaku} con los atributos principales.
     *
     * @param nombre El nombre del producto.
     * @param categoria La categoría del producto.
     * @param precio El precio del producto.
     * @param stock La cantidad de stock disponible.
     */
    public ProductoOtaku(String nombre, String categoria, Double precio, Integer stock) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
    }

    /**
     * Constructor completo para crear una nueva instancia de {@link ProductoOtaku}.
     *
     * @param nombre El nombre del producto.
     * @param categoria La categoría del producto.
     * @param precio El precio del producto.
     * @param stock La cantidad de stock disponible.
     * @param proveedor El proveedor del producto.
     * @param nivelMinimoStock El nivel mínimo de stock para alerta.
     * @param ultimaFechaReposicion La fecha de la última reposición.
     */
    public ProductoOtaku(String nombre, String categoria, Double precio, Integer stock, String proveedor, Integer nivelMinimoStock, LocalDate ultimaFechaReposicion) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.stock = stock;
        this.proveedor = proveedor;
        this.nivelMinimoStock = nivelMinimoStock;
        this.ultimaFechaReposicion = ultimaFechaReposicion;
    }

    // Getters y Setters

    /**
     * Obtiene el ID del producto.
     * @return El ID del producto.
     */
    public Long getId() {
        return id;
    }

    /**
     * Establece el ID del producto.
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
     * Obtiene el stock del producto.
     * @return El stock actual del producto.
     */
    public Integer getStock() {
        return stock;
    }

    /**
     * Establece el stock del producto.
     * @param stock El nuevo stock del producto.
     */
    public void setStock(Integer stock) {
        this.stock = stock;
    }

    /**
     * Obtiene el proveedor del producto.
     * @return El proveedor del producto.
     */
    public String getProveedor() {
        return proveedor;
    }

    /**
     * Establece el proveedor del producto.
     * @param proveedor El nuevo proveedor del producto.
     */
    public void setProveedor(String proveedor) {
        this.proveedor = proveedor;
    }

    /**
     * Obtiene el nivel mínimo de stock del producto.
     * @return El nivel mínimo de stock para alerta.
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