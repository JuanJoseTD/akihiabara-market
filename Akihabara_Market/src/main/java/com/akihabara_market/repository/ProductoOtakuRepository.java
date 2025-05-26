package com.akihabara_market.repository;

import com.akihabara_market.entity.ProductoOtaku;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para la entidad {@link ProductoOtaku}.
 * Proporciona métodos CRUD estándar para la gestión de productos,
 * además de métodos para búsquedas personalizadas y filtrado.
 * Extiende {@link JpaRepository} para operaciones CRUD básicas y {@link JpaSpecificationExecutor}
 * para permitir consultas dinámicas utilizando Specifications (criterios de JPA).
 *
 * @author Juan J. Tornero
 * @version 1.0
 * @since 2024-05-26
 */
@Repository
public interface ProductoOtakuRepository extends JpaRepository<ProductoOtaku, Long>, JpaSpecificationExecutor<ProductoOtaku> {

    /**
     * Busca productos cuyo nombre o categoría contengan la cadena de búsqueda especificada,
     * ignorando mayúsculas y minúsculas.
     * Este método es utilizado principalmente por el campo de búsqueda del frontend.
     *
     * @param nombre Una cadena para buscar coincidencias parciales en el nombre del producto.
     * @param categoria Una cadena para buscar coincidencias parciales en la categoría del producto.
     * @return Una lista de {@link ProductoOtaku} que coinciden con los criterios de búsqueda.
     */
    List<ProductoOtaku> findByNombreContainingIgnoreCaseOrCategoriaContainingIgnoreCase(String nombre, String categoria);

    /**
     * Obtiene una lista de todos los proveedores únicos que están asociados a los productos
     * en el inventario. Excluye proveedores nulos o cadenas vacías.
     *
     * @return Una lista de cadenas, cada una representando un proveedor único.
     */
    @Query("SELECT DISTINCT p.proveedor FROM ProductoOtaku p WHERE p.proveedor IS NOT NULL AND p.proveedor != ''")
    List<String> findDistinctProveedores();
}
