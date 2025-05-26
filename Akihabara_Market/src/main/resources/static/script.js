/**
 * @file script.js
 * @brief Lógica del frontend para la aplicación de Gestión de Inventario de Akihabara Market.
 * @version 1.0
 * @date 2024-05-26
 *
 * Este script maneja la interactividad de la interfaz de usuario, incluyendo:
 * - Comunicación con la API REST de Spring Boot para operaciones CRUD de productos.
 * - Gestión de la interfaz de usuario (mostrar/ocultar secciones, modales).
 * - Funcionalidad de búsqueda y filtrado de productos.
 * - Generación de informes de inventario con filtros dinámicos.
 * - Manejo de la selección de filas en la tabla para edición y eliminación.
 * - Validación básica de formularios en el lado del cliente.
 */

// --- Configuración de la API ---
/**
 * @constant {string} API_BASE_URL URL base de la API de productos de Spring Boot.
 */
const API_BASE_URL = 'http://localhost:8080/api/v1/productos';
/**
 * @constant {string} API_REPORTS_URL URL para el endpoint de generación de reportes.
 */
const API_REPORTS_URL = `${API_BASE_URL}/reports`; // Endpoint de reportes
/**
 * @constant {string} API_PROVEEDORES_URL URL para el endpoint de obtención de proveedores únicos.
 */
const API_PROVEEDORES_URL = `${API_BASE_URL}/proveedores`; // Endpoint para proveedores únicos

// --- Referencias a elementos del DOM de la página principal ---
/** @type {HTMLElement} Enlace de navegación al dashboard. */
const dashboardLink = document.getElementById('dashboard-link');
/** @type {HTMLElement} Enlace de navegación a los reportes de inventario. */
const inventoryReportsLink = document.getElementById('inventory-reports-link');
/** @type {HTMLElement} Sección del dashboard de inventario. */
const dashboardSection = document.getElementById('dashboard-section');
/** @type {HTMLElement} Sección de reportes de inventario. */
const inventoryReportsSection = document.getElementById('inventory-reports-section');

// --- Elementos de la barra de acciones del dashboard ---
/** @type {HTMLElement} Botón para agregar un nuevo producto. */
const addProductBtn = document.getElementById('add-product-btn');
/** @type {HTMLElement} Botón para editar el producto seleccionado. */
const editProductBtn = document.getElementById('edit-product-btn');
/** @type {HTMLElement} Botón para eliminar el producto seleccionado. */
const deleteProductBtn = document.getElementById('delete-product-btn');
/** @type {HTMLInputElement} Campo de entrada para la búsqueda de productos. */
const searchInput = document.getElementById('search-input');
/** @type {HTMLTableSectionElement} Cuerpo de la tabla donde se listan los productos del dashboard. */
const productList = document.getElementById('product-list');

// --- Referencias a elementos del DOM del MODAL de producto ---
/** @type {HTMLElement} El elemento modal principal para agregar/editar productos. */
const productModal = document.getElementById('product-modal');
/** @type {HTMLElement} Botón para cerrar el modal. */
const closeButton = document.querySelector('.close-button');
/** @type {HTMLFormElement} El formulario dentro del modal para la gestión de productos. */
const productFormModal = document.getElementById('product-form-modal');
/** @type {HTMLInputElement} Campo oculto para el ID del producto en el modal. */
const productIdInputModal = document.getElementById('product-id-modal');
/** @type {HTMLInputElement} Campo de entrada para el nombre del producto en el modal. */
const nombreInputModal = document.getElementById('nombre-modal');
/** @type {HTMLInputElement} Campo de entrada para la categoría del producto en el modal. */
const categoriaInputModal = document.getElementById('categoria-modal');
/** @type {HTMLInputElement} Campo de entrada para el precio del producto en el modal. */
const precioInputModal = document.getElementById('precio-modal');
/** @type {HTMLInputElement} Campo de entrada para el stock del producto en el modal. */
const stockInputModal = document.getElementById('stock-modal');
/** @type {HTMLInputElement} Campo de entrada para el proveedor del producto en el modal. */
const proveedorInputModal = document.getElementById('proveedor-modal');
/** @type {HTMLInputElement} Campo de entrada para el nivel mínimo de stock en el modal. */
const nivelMinimoStockInputModal = document.getElementById('nivelMinimoStock-modal');
/** @type {HTMLElement} Título del formulario dentro del modal (cambia entre "Agregar" y "Editar"). */
const formTitleModal = document.getElementById('form-title-modal');
/** @type {HTMLElement} Botón para cancelar la operación en el modal. */
const cancelModalBtn = document.getElementById('cancel-modal-btn');

// --- Referencias a elementos del DOM de la sección de Reportes ---
/** @type {HTMLFormElement} El formulario de filtros de reportes. */
const reportForm = document.getElementById('report-form');
/** @type {HTMLInputElement} Campo de entrada para la fecha de inicio del reporte. */
const reportStartDateInput = document.getElementById('report-start-date');
/** @type {HTMLInputElement} Campo de entrada para la fecha de fin del reporte. */
const reportEndDateInput = document.getElementById('report-end-date');
/** @type {HTMLSelectElement} Selector para filtrar por proveedor en los reportes. */
const reportSupplierSelect = document.getElementById('report-supplier');
/** @type {HTMLInputElement} Campo de entrada para filtrar por nombre de producto en los reportes. */
const reportProductNameInput = document.getElementById('report-product-name');
/** @type {HTMLTableSectionElement} Cuerpo de la tabla donde se muestran los resultados del reporte. */
const reportProductList = document.getElementById('report-product-list');
/** @type {HTMLElement} Párrafo para mostrar mensajes de estado del reporte. */
const reportStatusMessage = document.getElementById('report-status-message');

/**
 * @global {string|null} selectedProductId Almacena el ID del producto actualmente seleccionado en la tabla del dashboard.
 * Inicialmente es `null`.
 */
let selectedProductId = null;

// --- Funciones para la gestión del Modal de Producto ---

/**
 * Abre el modal de gestión de productos y enfoca el campo de nombre.
 * El modal se muestra con `display: flex` para permitir el centrado CSS.
 */
function openModal() {
    productModal.style.display = 'flex';
    nombreInputModal.focus();
}

/**
 * Cierra el modal de gestión de productos y limpia el formulario.
 */
function closeModal() {
    productModal.style.display = 'none';
    clearFormModal();
}

/**
 * Limpia todos los campos del formulario dentro del modal y resetea el título del formulario.
 */
function clearFormModal() {
    productIdInputModal.value = '';
    nombreInputModal.value = '';
    categoriaInputModal.value = '';
    precioInputModal.value = '';
    stockInputModal.value = '';
    proveedorInputModal.value = '';
    nivelMinimoStockInputModal.value = '';
    formTitleModal.textContent = 'Agregar Nuevo Producto'; // Resetear título a "Agregar Nuevo Producto"
}

// --- Event Listeners para el Modal ---
/**
 * Event listener para el botón "Agregar Nuevo Producto".
 * Limpia el formulario del modal y lo abre para una nueva entrada.
 */
addProductBtn.addEventListener('click', () => {
    clearFormModal();
    openModal();
});

/**
 * Event listener para el botón de cierre (X) del modal.
 * Cierra el modal.
 */
closeButton.addEventListener('click', closeModal);

/**
 * Event listener para el botón "Cancelar" dentro del modal.
 * Cierra el modal.
 */
cancelModalBtn.addEventListener('click', closeModal);

/**
 * Event listener global para cerrar el modal si se hace clic fuera de su contenido.
 */
window.addEventListener('click', (event) => {
    if (event.target === productModal) {
        closeModal();
    }
});

// --- Funciones de CRUD para Productos ---

/**
 * Carga productos desde la API de Spring Boot.
 * Si se proporciona un término de búsqueda en `searchInput`, utiliza el endpoint de búsqueda.
 * Después de cargar los productos, resetea la selección de fila y deshabilita los botones de acción.
 * Muestra una alerta si ocurre un error durante la carga.
 */
async function fetchProducts() {
    try {
        const searchTerm = searchInput.value;
        let url = API_BASE_URL;

        if (searchTerm) {
            // Utiliza el endpoint /buscar del backend que filtra por nombre, categoría y proveedor
            url = `${API_BASE_URL}/buscar?query=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        const products = await response.json();
        displayProducts(products);
        // Al recargar la lista, resetear la selección y deshabilitar botones de acción
        clearProductSelection();
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        alert('Ocurrió un error al cargar los productos. Por favor, intenta de nuevo más tarde.');
        productList.innerHTML = `<tr><td colspan="8" class="no-results">Error al cargar productos.</td></tr>`;
    }
}

/**
 * Muestra la lista de productos en la tabla del dashboard.
 * Si no hay productos, muestra un mensaje indicándolo.
 * Aplica la clase 'low-stock' a las celdas de stock si el valor es menor que el nivel mínimo.
 *
 * @param {Array<Object>} products - Una lista de objetos ProductoOtaku a mostrar.
 */
function displayProducts(products) {
    productList.innerHTML = ''; // Limpiar la tabla antes de añadir nuevos productos
    if (products.length === 0) {
        productList.innerHTML = `<tr><td colspan="8" class="no-results">No se encontraron productos.</td></tr>`;
        return;
    }

    products.forEach(product => {
        const row = productList.insertRow();
        // Almacena el ID del producto en un atributo `data-productId` de la fila para una fácil recuperación.
        row.dataset.productId = product.id;

        // Determina si el stock es bajo para aplicar estilos específicos
        const stockClass = (product.stock !== null && product.nivelMinimoStock !== null && product.stock < product.nivelMinimoStock) ? 'low-stock' : '';

        // Inserta el HTML de la fila con los datos del producto
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>${product.precio ? product.precio.toFixed(2) + '€' : 'N/A'}</td>
            <td class="${stockClass}">${product.stock !== null ? product.stock : 'N/A'}</td>
            <td>${product.proveedor || 'N/A'}</td>
            <td>${product.nivelMinimoStock !== null ? product.nivelMinimoStock : 'N/A'}</td>
            <td>${product.ultimaFechaReposicion ? new Date(product.ultimaFechaReposicion).toLocaleDateString('es-ES') : 'N/A'}</td>
        `;
    });
}

/**
 * Maneja el evento de envío del formulario del modal para crear o actualizar un producto.
 * Realiza validaciones básicas en el frontend y envía los datos a la API de Spring Boot.
 * Muestra mensajes de éxito o error al usuario.
 */
productFormModal.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevenir el envío por defecto del formulario

    // Validación básica del formulario en el frontend
    if (!nombreInputModal.value || !categoriaInputModal.value || precioInputModal.value === '' || stockInputModal.value === '') {
        alert('Por favor, completa todos los campos obligatorios (Nombre, Categoría, Precio, Stock).');
        return;
    }
    if (parseFloat(precioInputModal.value) < 0) {
        alert('El precio no puede ser negativo.');
        return;
    }
    if (parseInt(stockInputModal.value, 10) < 0) {
        alert('El stock no puede ser negativo.');
        return;
    }
    if (nivelMinimoStockInputModal.value !== '' && parseInt(nivelMinimoStockInputModal.value, 10) < 0) {
        alert('El stock mínimo no puede ser negativo.');
        return;
    }

    const productId = productIdInputModal.value;
    // Construye el objeto de datos del producto a enviar al backend
    const productData = {
        nombre: nombreInputModal.value,
        categoria: categoriaInputModal.value,
        precio: parseFloat(precioInputModal.value),
        stock: parseInt(stockInputModal.value, 10),
        // Si el campo de proveedor está vacío o solo contiene espacios, se envía `null` al backend.
        proveedor: proveedorInputModal.value.trim() === '' ? null : proveedorInputModal.value.trim(),
        // Si el campo de nivel mínimo de stock está vacío o solo contiene espacios, se envía `null` al backend.
        nivelMinimoStock: nivelMinimoStockInputModal.value.trim() === '' ? null : parseInt(nivelMinimoStockInputModal.value, 10)
    };

    try {
        let response;
        if (productId) {
            // Si hay un ID de producto, se realiza una petición PUT para actualizar
            response = await fetch(`${API_BASE_URL}/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Si no hay ID, se realiza una petición POST para crear un nuevo producto
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }

        if (response.ok) {
            alert(`Producto ${productId ? 'actualizado' : 'agregado'} exitosamente.`);
            closeModal(); // Cierra el modal y limpia el formulario
            fetchProducts(); // Recarga la lista de productos en el dashboard
        } else {
            const errorData = await response.json();
            // Construye un mensaje de error detallado a partir de la respuesta del backend
            let errorMessage = 'Error al procesar la solicitud.';
            if (errorData) {
                if (typeof errorData === 'object' && !Array.isArray(errorData)) {
                    // Si el backend devuelve un mapa de errores de validación (ej. de GlobalExceptionHandler)
                    const errorFields = Object.values(errorData).join('\n- ');
                    errorMessage = `Errores de validación:\n- ${errorFields}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = JSON.stringify(errorData);
                }
            }
            alert(`Error al ${productId ? 'actualizar' : 'agregar'} el producto: ${errorMessage}`);
            console.error('Error al guardar producto:', errorData);
        }
    } catch (error) {
        console.error('Error al guardar el producto:', error);
        alert('Ocurrió un error de conexión al intentar guardar el producto. Verifica que el servidor esté funcionando.');
    }
});

/**
 * Carga los datos de un producto específico en el formulario del modal para su edición.
 * @param {string} id - El ID del producto a editar.
 * Muestra una alerta si no se selecciona un producto o si ocurre un error durante la carga.
 */
async function editProduct(id) {
    if (!id) {
        alert('Por favor, selecciona un producto para editar.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        const product = await response.json();

        // Rellena los campos del modal con los datos del producto
        productIdInputModal.value = product.id;
        nombreInputModal.value = product.nombre;
        categoriaInputModal.value = product.categoria;
        precioInputModal.value = product.precio;
        stockInputModal.value = product.stock;
        // Si el proveedor es `null` del backend, se muestra como una cadena vacía en el input.
        proveedorInputModal.value = product.proveedor || '';
        // Si el nivel mínimo de stock es `null` del backend, se muestra como una cadena vacía en el input.
        nivelMinimoStockInputModal.value = product.nivelMinimoStock !== null ? product.nivelMinimoStock : '';

        formTitleModal.textContent = 'Editar Producto'; // Cambia el título del modal
        openModal(); // Abre el modal
    } catch (error) {
        console.error('Error al cargar el producto para edición:', error);
        alert('Ocurrió un error al cargar los datos del producto para edición.');
    }
}

/**
 * Elimina un producto de la base de datos después de una confirmación del usuario.
 * @param {string} id - El ID del producto a eliminar.
 * Muestra una alerta si no se selecciona un producto o si ocurre un error durante la eliminación.
 */
async function deleteProduct(id) {
    if (!id) {
        alert('Por favor, selecciona un producto para eliminar.');
        return;
    }
    // Pide confirmación al usuario antes de proceder con la eliminación.
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.')) {
        return; // El usuario canceló la eliminación
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.status === 204) { // Código 204 No Content indica eliminación exitosa sin contenido de respuesta.
            alert('Producto eliminado exitosamente.');
            fetchProducts(); // Recarga la lista de productos en el dashboard
        } else if (response.status === 404) {
            alert('Producto no encontrado.');
        } else {
            const errorData = await response.json();
            alert(`Error al eliminar el producto: ${errorData.message || response.statusText}`);
            console.error('Error al eliminar:', errorData || response.statusText);
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        alert('Ocurrió un error al intentar eliminar el producto. Verifica la conexión con el servidor.');
    }
}

// --- Funcionalidad de Búsqueda del Dashboard ---
/**
 * Event listener para el campo de búsqueda.
 * Cada vez que el usuario escribe, se activa una nueva búsqueda de productos.
 */
searchInput.addEventListener('input', () => {
    fetchProducts(); // Llama a la función para cargar y filtrar productos
});

// --- Manejo de selección de filas en la tabla del Dashboard ---
/**
 * Event listener para el cuerpo de la tabla de productos.
 * Permite al usuario seleccionar una fila haciendo clic en ella,
 * resaltando la fila y habilitando los botones de edición y eliminación.
 */
productList.addEventListener('click', (event) => {
    const clickedRow = event.target.closest('tr'); // Encuentra la fila (<tr>) más cercana al clic

    // Si no se hizo clic en una fila o la fila no tiene un ID de producto, no hacer nada.
    if (!clickedRow || !clickedRow.dataset.productId) {
        return;
    }

    // Deselecciona cualquier fila que estuviera seleccionada previamente.
    const currentlySelectedRow = document.querySelector('.product-table tbody tr.selected');
    if (currentlySelectedRow && currentlySelectedRow !== clickedRow) {
        currentlySelectedRow.classList.remove('selected');
    }

    // Alterna la clase 'selected' en la fila clicada.
    clickedRow.classList.toggle('selected');

    // Actualiza el ID del producto seleccionado y el estado de los botones de acción.
    if (clickedRow.classList.contains('selected')) {
        selectedProductId = clickedRow.dataset.productId;
        editProductBtn.disabled = false;
        deleteProductBtn.disabled = false;
    } else {
        // Si la fila se deselecciona, limpia la selección.
        clearProductSelection();
    }
});

/**
 * Limpia la selección de cualquier fila en la tabla del dashboard.
 * Elimina la clase 'selected' de la fila, resetea `selectedProductId` a `null`,
 * y deshabilita los botones de edición y eliminación.
 */
function clearProductSelection() {
    const currentlySelectedRow = document.querySelector('.product-table tbody tr.selected');
    if (currentlySelectedRow) {
        currentlySelectedRow.classList.remove('selected');
    }
    selectedProductId = null;
    editProductBtn.disabled = true;
    deleteProductBtn.disabled = true;
}

// --- Event Listeners para los botones de acción (Editar, Eliminar) ---
/**
 * Event listener para el botón "Editar Producto".
 * Llama a la función `editProduct` con el ID del producto seleccionado.
 */
editProductBtn.addEventListener('click', () => {
    editProduct(selectedProductId);
});

/**
 * Event listener para el botón "Eliminar Producto".
 * Llama a la función `deleteProduct` con el ID del producto seleccionado.
 */
deleteProductBtn.addEventListener('click', () => {
    deleteProduct(selectedProductId);
});

// --- Funcionalidad de Navegación (Dashboard vs. Reportes) ---
/** @type {NodeListOf<HTMLElement>} Colección de todos los elementos de navegación del sidebar. */
const navItems = document.querySelectorAll('.sidebar-nav-item');

/**
 * Agrega un event listener a cada elemento de navegación del sidebar.
 * Al hacer clic, actualiza la clase 'active' para resaltar el elemento seleccionado
 * y muestra la sección de contenido correspondiente (Dashboard o Reportes).
 */
navItems.forEach(item => {
    item.addEventListener('click', function () {
        // Remueve la clase 'active' de todos los elementos de navegación.
        navItems.forEach(nav => nav.classList.remove('active'));
        // Añade la clase 'active' al elemento que fue clicado.
        this.classList.add('active');

        // Oculta todas las secciones de contenido.
        dashboardSection.classList.add('hidden');
        inventoryReportsSection.classList.add('hidden');

        // Muestra la sección de contenido correspondiente según el ID del elemento clicado.
        if (this.id === 'dashboard-link') {
            dashboardSection.classList.remove('hidden');
            fetchProducts(); // Carga los productos al navegar al dashboard.
        } else if (this.id === 'inventory-reports-link') {
            inventoryReportsSection.classList.remove('hidden');
            fetchReportSuppliers(); // Carga los proveedores para los filtros de reportes.
            clearReportForm(); // Limpia el formulario de filtros de reportes.
            reportProductList.innerHTML = ''; // Limpia los resultados de reportes anteriores.
            reportStatusMessage.textContent = 'Utiliza los filtros y haz clic en "Generar Reporte".';
            reportStatusMessage.style.display = 'block'; // Muestra el mensaje de estado inicial.
        }
    });
});

// --- Funcionalidad de Reportes ---

/**
 * Obtiene la lista de proveedores únicos desde la API de Spring Boot
 * y los utiliza para poblar el selector de proveedores en el formulario de reportes.
 * Muestra una alerta si ocurre un error durante la carga de proveedores.
 */
async function fetchReportSuppliers() {
    try {
        const response = await fetch(API_PROVEEDORES_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        const suppliers = await response.json();
        displayReportSuppliers(suppliers);
    } catch (error) {
        console.error('Error al cargar proveedores para reportes:', error);
        reportSupplierSelect.innerHTML = '<option value="">Error al cargar</option>'; // Muestra un mensaje de error en el selector.
    }
}

/**
 * Popula el elemento `<select>` del filtro de proveedores con la lista de proveedores únicos.
 * @param {Array<string>} suppliers - Una lista de nombres de proveedores (cadenas de texto).
 */
function displayReportSuppliers(suppliers) {
    reportSupplierSelect.innerHTML = '<option value="">Todos</option>'; // Añade la opción por defecto "Todos".
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier;
        option.textContent = supplier;
        reportSupplierSelect.appendChild(option);
    });
}

/**
 * Limpia todos los campos del formulario de filtros de reportes.
 */
function clearReportForm() {
    reportStartDateInput.value = '';
    reportEndDateInput.value = '';
    reportSupplierSelect.value = '';
    reportProductNameInput.value = '';
}

/**
 * Maneja el evento de envío del formulario de filtros de reportes.
 * Construye los parámetros de la URL a partir de los filtros seleccionados
 * y realiza una petición GET a la API para generar el reporte.
 * Muestra los resultados en la tabla de reportes y mensajes de estado.
 */
reportForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Previene el envío por defecto del formulario.

    // Obtiene los valores de los campos de filtro.
    const startDate = reportStartDateInput.value;
    const endDate = reportEndDateInput.value;
    const supplier = reportSupplierSelect.value;
    const productName = reportProductNameInput.value;

    // Construye los parámetros de consulta URL.
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (supplier) queryParams.append('supplier', supplier);
    if (productName) queryParams.append('productName', productName);

    // Construye la URL completa para la petición de reporte.
    const url = `${API_REPORTS_URL}?${queryParams.toString()}`;

    try {
        reportProductList.innerHTML = ''; // Limpia los resultados anteriores de la tabla de reportes.
        reportStatusMessage.textContent = 'Generando reporte...'; // Muestra un mensaje de carga.
        reportStatusMessage.style.display = 'block';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        const products = await response.json();
        displayReportProducts(products); // Muestra los productos del reporte.
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        reportProductList.innerHTML = `<tr><td colspan="8" class="no-results">Error al generar el reporte. ${error.message || ''}</td></tr>`;
        reportStatusMessage.style.display = 'none'; // Oculta el mensaje de estado si hay un error.
    }
});

/**
 * Muestra la lista de productos en la tabla de resultados del reporte.
 * Si no hay productos, muestra un mensaje indicándolo.
 * Aplica la clase 'low-stock' si el stock es menor que el nivel mínimo.
 *
 * @param {Array<Object>} products - Una lista de objetos ProductoOtaku a mostrar en el reporte.
 */
function displayReportProducts(products) {
    reportProductList.innerHTML = ''; // Limpia la tabla antes de añadir nuevos productos.
    if (products.length === 0) {
        reportProductList.innerHTML = `<tr><td colspan="8" class="no-results">No se encontraron productos que coincidan con los criterios del reporte.</td></tr>`;
        reportStatusMessage.style.display = 'none'; // Oculta el mensaje de estado.
        return;
    }

    reportStatusMessage.style.display = 'none'; // Oculta el mensaje de estado si hay resultados.

    products.forEach(product => {
        const row = reportProductList.insertRow();
        // Aplica la clase 'low-stock' si el stock es menor que el nivel mínimo.
        const stockClass = (product.stock !== null && product.nivelMinimoStock !== null && product.stock < product.nivelMinimoStock) ? 'low-stock' : '';

        // Inserta el HTML de la fila con los datos del producto.
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.nombre}</td>
            <td>${product.categoria}</td>
            <td>${product.precio ? product.precio.toFixed(2) + '€' : 'N/A'}</td>
            <td class="${stockClass}">${product.stock !== null ? product.stock : 'N/A'}</td>
            <td>${product.proveedor || 'N/A'}</td>
            <td>${product.nivelMinimoStock !== null ? product.nivelMinimoStock : 'N/A'}</td>
            <td>${product.ultimaFechaReposicion ? new Date(product.ultimaFechaReposicion).toLocaleDateString('es-ES') : 'N/A'}</td>
        `;
    });
}

// --- Inicialización de la aplicación ---
/**
 * Event listener que se dispara cuando el DOM ha sido completamente cargado.
 * Asegura que la sección del dashboard sea visible por defecto y carga la lista inicial de productos.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Asegura que la sección del dashboard esté visible y la de reportes oculta al cargar la página.
    dashboardSection.classList.remove('hidden');
    inventoryReportsSection.classList.add('hidden');
    // Marca el enlace del dashboard como activo en el sidebar.
    dashboardLink.classList.add('active');
    // Carga la lista inicial de productos en el dashboard.
    fetchProducts();
});