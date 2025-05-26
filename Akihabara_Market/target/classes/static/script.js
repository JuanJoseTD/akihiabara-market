/**
 * @file script.js
 * @brief Lógica del frontend para la aplicación de Gestión de Inventario de Akihabara Market.
 * @version 1.6 (Depuración de Alerta de Stock Mejorada)
 * @date 2024-05-26
 *
 * Este script maneja la interactividad de la interfaz de usuario, incluyendo:
 * - Comunicación con la API REST de Spring Boot para operaciones CRUD de productos.
 * - Gestión de la interfaz de usuario (mostrar/ocultar secciones, modales, sidebar móvil).
 * - Funcionalidad de búsqueda y filtrado de productos.
 * - Generación de informes de inventario con filtros dinámicos y descarga CSV.
 * - Manejo de la selección de filas en la tabla para edición y eliminación.
 * - Validación básica de formularios en el lado del cliente.
 * - Implementación de modo oscuro persistente.
 * - Generación de alertas visuales para productos con stock bajo.
 * - Auto-eliminación de mensajes de alerta para evitar problemas de visualización.
 */

// --- Configuración de la API ---
/**
 * @constant {string} API_BASE_URL URL base de la API de productos de Spring Boot.
 */
const API_BASE_URL = 'http://localhost:8080/api/v1/productos';
/**
 * @constant {string} API_INFORME_URL URL para el endpoint de generación de reportes.
 */
const API_INFORME_URL = `${API_BASE_URL}/informe`;
/**
 * @constant {string} API_PROVEEDORES_URL URL para el endpoint de obtención de proveedores únicos.
 */
const API_PROVEEDORES_URL = `${API_BASE_URL}/proveedores`;

// --- Referencias a elementos del DOM de la página ---
const dashboardLink = document.getElementById('dashboardLink');
const inventoryReportsLink = document.getElementById('inventoryReportsLink');
const dashboardSection = document.getElementById('dashboardSection');
const inventoryReportsSection = document.getElementById('inventoryReportsSection');

// --- Elementos de la barra de acciones del dashboard ---
const addProductBtn = document.getElementById('addProductBtn');
const editProductBtn = document.getElementById('editProductBtn');
const deleteProductBtn = document.getElementById('deleteProductBtn');
const searchInput = document.getElementById('searchInput');
const productTableBody = document.getElementById('productTableBody');
const stockAlertsContainer = document.getElementById('stockAlertsContainer'); // Contenedor para alertas de stock

// --- Referencias a elementos del DOM del MODAL de producto ---
const productModal = document.getElementById('productModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const nombreInputModal = document.getElementById('nombre-modal');
const categoriaInputModal = document.getElementById('categoria-modal');
const precioInputModal = document.getElementById('precio-modal');
const stockInputModal = document.getElementById('stock-modal');
const proveedorInputModal = document.getElementById('proveedor-modal');
const nivelMinimoStockInputModal = document.getElementById('nivelMinimoStock-modal');
const modalTitle = document.getElementById('modalTitle');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// --- Referencias a elementos del DOM de la sección de Reportes ---
const reportForm = document.getElementById('reportForm');
const reportCategoryInput = document.getElementById('reportCategory');
const reportMinStockInput = document.getElementById('reportMinStock');
const reportStartDateInput = document.getElementById('reportStartDate');
const reportEndDateInput = document.getElementById('reportEndDate');
const reportSupplierSelect = document.getElementById('reportSupplier');
const reportProductNameInput = document.getElementById('reportProductName');
const reportTableBody = document.getElementById('reportTableBody');
const clearReportFiltersBtn = document.getElementById('clearReportFiltersBtn');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');

// --- Elementos de UI adicionales ---
const alertContainer = document.getElementById('alertContainer');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const darkModeToggle = document.getElementById('darkModeToggle');

/**
 * @global {string|null} selectedProductId Almacena el ID del producto actualmente seleccionado en la tabla del dashboard.
 * Inicialmente es `null`.
 */
let selectedProductId = null;
/**
 * @global {Array<Object>} currentReportProducts Almacena los productos de la última generación de reporte.
 * Utilizado para la descarga CSV.
 */
let currentReportProducts = [];

// --- Funciones de Utilidad de UI ---

/**
 * Muestra una alerta temporal en la esquina superior derecha de la pantalla.
 * @param {string} message El mensaje a mostrar en la alerta.
 * @param {'success'|'error'|'warning'} type El tipo de alerta (determina el estilo).
 */
function showAlert(message, type) {
    const alertElement = document.createElement('div');
    alertElement.classList.add('alert', type);

    let iconClass = '';
    if (type === 'success') {
        iconClass = 'fas fa-check-circle';
    } else if (type === 'error') {
        iconClass = 'fas fa-times-circle';
    } else if (type === 'warning') {
        iconClass = 'fas fa-exclamation-triangle';
    }

    alertElement.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    alertContainer.appendChild(alertElement);

    // Desaparecer la alerta después de 3.5 segundos
    setTimeout(() => {
        alertElement.style.opacity = '0';
        alertElement.style.transform = 'translateY(-20px)';
        alertElement.addEventListener('transitionend', () => alertElement.remove());
    }, 3500); // El mensaje se borrará automáticamente después de 3.5 segundos.
}

/**
 * Muestra u oculta una sección de la aplicación y actualiza el estado activo del menú.
 * @param {HTMLElement} sectionToShow La sección del DOM que se debe mostrar.
 * @param {HTMLElement} linkToActivate El enlace del sidebar que debe marcarse como activo.
 */
function setActiveSection(sectionToShow, linkToActivate) {
    // Ocultar todas las secciones de contenido
    dashboardSection.classList.add('hidden');
    inventoryReportsSection.classList.add('hidden');

    // Mostrar la sección deseada
    sectionToShow.classList.remove('hidden');

    // Desactivar todos los enlaces del sidebar
    dashboardLink.classList.remove('active');
    inventoryReportsLink.classList.remove('active');

    // Activar el enlace correspondiente
    linkToActivate.classList.add('active');

    // Ocultar el sidebar en móviles después de la selección
    if (window.innerWidth <= 992) { // Asume que 992px es el breakpoint para móvil
        sidebar.classList.remove('sidebar-open');
    }
}

/**
 * Abre el modal de producto para añadir o editar.
 * @param {Object} [product] Objeto producto si es para editar, nulo para añadir.
 */
function showModal(product = null) {
    productForm.reset(); // Limpia el formulario
    document.querySelectorAll('.error-message').forEach(el => el.remove()); // Limpia errores previos
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error')); // Quita clases de error

    if (product) {
        modalTitle.textContent = 'Editar Producto';
        productIdInput.value = product.id;
        nombreInputModal.value = product.nombre;
        categoriaInputModal.value = product.categoria;
        precioInputModal.value = product.precio;
        stockInputModal.value = product.stock;
        proveedorInputModal.value = product.proveedor || '';
        nivelMinimoStockInputModal.value = product.nivelMinimoStock || '';
    } else {
        modalTitle.textContent = 'Añadir Nuevo Producto';
        productIdInput.value = '';
    }
    productModal.classList.add('active'); // Muestra el modal
}

/**
 * Oculta el modal de producto.
 */
function hideModal() {
    productModal.classList.remove('active'); // Oculta el modal
    selectedProductId = null; // Deselecciona cualquier producto
    productTableBody.querySelectorAll('tr').forEach(row => row.classList.remove('selected')); // Quita la selección visual
    editProductBtn.disabled = true; // Deshabilita botones
    deleteProductBtn.disabled = true;
}

/**
 * Renderiza los errores de validación recibidos del backend en el formulario del modal.
 * @param {Object} errors Un mapa de errores donde la clave es el nombre del campo y el valor es el mensaje de error.
 */
function displayValidationErrors(errors) {
    // Limpiar errores previos
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

    for (const field in errors) {
        // Asume que los IDs de los inputs del modal terminan en '-modal'
        const inputElement = document.getElementById(`${field}-modal`);
        if (inputElement) {
            inputElement.classList.add('input-error');
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('error-message');
            errorMessage.textContent = errors[field];
            inputElement.parentNode.insertBefore(errorMessage, inputElement.nextSibling);
        }
    }
    showAlert('Por favor, corrige los errores en el formulario.', 'error');
}

/**
 * Limpia los resultados de la tabla de informes y muestra un mensaje de "no resultados".
 */
function clearReportTable() {
    reportTableBody.innerHTML = `
        <tr class="no-results">
            <td colspan="8">Genera un informe para ver los resultados.</td>
        </tr>
    `;
    downloadCsvBtn.style.display = 'none'; // Oculta el botón de descarga al limpiar la tabla
    currentReportProducts = []; // Limpia los datos del reporte actual
}

// --- Funciones de Lógica de Negocio (Interacción con la API) ---

/**
 * Carga la lista de productos desde la API y la renderiza en la tabla.
 * @param {string} [searchTerm=''] Término de búsqueda opcional para filtrar productos.
 */
async function loadProducts(searchTerm = '') {
    try {
        const response = await fetch(`${API_BASE_URL}?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        console.log("Productos cargados:", products); // Log para depuración
        renderProducts(products);
        displayStockAlerts(products); // Muestra las alertas de stock
    } catch (error) {
        console.error('Error al cargar productos:', error);
        showAlert('Error al cargar los productos.', 'error');
    }
}

/**
 * Renderiza la lista de productos en la tabla del dashboard.
 * @param {Array<Object>} products Lista de objetos ProductoOtaku.
 */
function renderProducts(products) {
    productTableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    if (products.length === 0) {
        productTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; font-style: italic; color: var(--text-color-light);">No hay productos registrados o que coincidan con la búsqueda.</td></tr>`;
        return;
    }

    products.forEach(product => {
        const row = productTableBody.insertRow();
        row.dataset.id = product.id; // Almacena el ID en el atributo data-id
        row.classList.add('product-item'); // Clase para identificar filas de producto

        // Determina si el stock es bajo para aplicar estilo
        const stockClass = (product.stock !== null && product.nivelMinimoStock !== null && product.stock < product.nivelMinimoStock) ? 'low-stock' : '';

        // Formatea la fecha de reposición si existe
        const ultimaFechaReposicionFormatted = product.ultimaFechaReposicion ? new Date(product.ultimaFechaReposicion).toLocaleDateString('es-ES') : 'N/A';

        // Inserta el HTML de la fila con los datos del producto.
        // Se añade `data-label` para la responsividad móvil.
        row.innerHTML = `
            <td data-label="ID">${product.id}</td>
            <td data-label="Nombre">${product.nombre}</td>
            <td data-label="Categoría">${product.categoria}</td>
            <td data-label="Precio">${product.precio ? product.precio.toFixed(2) + '€' : 'N/A'}</td>
            <td data-label="Stock" class="${stockClass}">${product.stock !== null ? product.stock : 'N/A'}</td>
            <td data-label="Proveedor">${product.proveedor || 'N/A'}</td>
            <td data-label="Stock Mínimo">${product.nivelMinimoStock !== null ? product.nivelMinimoStock : 'N/A'}</td>
            <td data-label="Última Reposición">${ultimaFechaReposicionFormatted}</td>
            <td class="actions">
                <button class="edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;

        // Event listener para seleccionar la fila
        row.addEventListener('click', () => {
            // Deseleccionar cualquier fila previamente seleccionada
            productTableBody.querySelectorAll('.product-item').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected'); // Seleccionar la fila actual
            selectedProductId = product.id; // Actualizar el ID del producto seleccionado
            editProductBtn.disabled = false; // Habilitar botones de editar y eliminar
            deleteProductBtn.disabled = false;
        });

        // Event listeners para los botones de acción dentro de la fila (edición y eliminación directa)
        row.querySelector('.edit-btn').addEventListener('click', async (event) => {
            event.stopPropagation(); // Evita que se propague al listener de la fila
            selectedProductId = product.id; // Asegura que el ID esté seleccionado
            try {
                const response = await fetch(`${API_BASE_URL}/${product.id}`);
                if (!response.ok) {
                    throw new Error(`Error HTTP! estado: ${response.status}`);
                }
                const fetchedProduct = await response.json();
                showModal(fetchedProduct); // Abre el modal para editar este producto con datos frescos
            } catch (error) {
                console.error('Error al cargar el producto para edición:', error);
                showAlert('Ocurrió un error al cargar los datos del producto para edición.', 'error');
            }
        });

        row.querySelector('.delete-btn').addEventListener('click', (event) => {
            event.stopPropagation(); // Evita que se propague al listener de la fila
            selectedProductId = product.id; // Asegura que el ID esté seleccionado
            deleteProduct(); // Llama a la función de eliminación
        });
    });
}

/**
 * Muestra alertas visuales para productos con stock bajo.
 * @param {Array<Object>} products Lista de objetos ProductoOtaku.
 */
function displayStockAlerts(products) {
    stockAlertsContainer.innerHTML = ''; // Limpiar alertas previas
    const lowStockProducts = products.filter(p => p.stock !== null && p.nivelMinimoStock !== null && p.stock < p.nivelMinimoStock);

    console.log("DEBUG: Productos con stock bajo detectados:", lowStockProducts); // Log para depuración

    if (lowStockProducts.length > 0) {
        stockAlertsContainer.classList.remove('hidden');
        const alertTitle = document.createElement('h3');
        alertTitle.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Productos con Stock Bajo';
        stockAlertsContainer.appendChild(alertTitle);

        const ul = document.createElement('ul');
        lowStockProducts.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-box-open"></i> <strong>${product.nombre}</strong> (Stock: ${product.stock}, Mínimo: ${product.nivelMinimoStock})`;
            ul.appendChild(li);
        });
        stockAlertsContainer.appendChild(ul);
        console.log("DEBUG: Alerta de stock bajo mostrada."); // Log para depuración
    } else {
        stockAlertsContainer.classList.add('hidden'); // Ocultar el contenedor si no hay alertas
        console.log("DEBUG: No hay productos con stock bajo, alerta oculta."); // Log para depuración
    }
}


/**
 * Añade un nuevo producto o actualiza uno existente.
 * @param {Event} event Evento de submit del formulario.
 */
async function addOrUpdateProduct(event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    const productId = productIdInput.value;
    const productData = {
        nombre: nombreInputModal.value.trim(),
        categoria: categoriaInputModal.value.trim(),
        precio: parseFloat(precioInputModal.value),
        stock: parseInt(stockInputModal.value, 10),
        proveedor: proveedorInputModal.value.trim() === '' ? null : proveedorInputModal.value.trim(),
        nivelMinimoStock: nivelMinimoStockInputModal.value.trim() === '' ? null : parseInt(nivelMinimoStockInputModal.value, 10),
        // Si es un nuevo producto, establece la ultimaFechaReposicion a hoy.
        // Si es una actualización, no se envía a menos que haya una lógica específica para ello.
        ultimaFechaReposicion: productId ? undefined : new Date().toISOString().slice(0, 10)
    };

    const method = productId ? 'PUT' : 'POST';
    const url = productId ? `${API_BASE_URL}/${productId}` : API_BASE_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            showAlert(`Producto ${productId ? 'actualizado' : 'añadido'} con éxito.`, 'success');
            hideModal(); // Ocultar el modal después de guardar
            loadProducts(); // Recargar la lista de productos
        } else {
            const errorData = await response.json();
            if (response.status === 400 && errorData) {
                displayValidationErrors(errorData); // Mostrar errores de validación del backend
            } else {
                throw new Error(`Error al ${productId ? 'actualizar' : 'añadir'} producto: ${errorData.message || response.statusText}`);
            }
        }
    } catch (error) {
        console.error(`Error en la operación de ${method} producto:`, error);
        showAlert(`Error en la operación: ${error.message}`, 'error');
    }
}

/**
 * Elimina un producto seleccionado.
 */
async function deleteProduct() {
    if (!selectedProductId) {
        showAlert('Por favor, selecciona un producto para eliminar.', 'warning');
        return;
    }

    // Usar una confirmación más amigable en lugar de `confirm()`
    const confirmDelete = await new Promise(resolve => {
        const confirmModal = document.createElement('div');
        confirmModal.classList.add('modal-overlay', 'active');
        confirmModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px; text-align: center;">
                <h3>Confirmar Eliminación</h3>
                <p>¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.</p>
                <div class="form-actions" style="justify-content: center;">
                    <button id="confirmDeleteBtn" class="btn btn-danger"><i class="fas fa-trash-alt"></i> Eliminar</button>
                    <button id="cancelDeleteBtn" class="btn btn-secondary"><i class="fas fa-times-circle"></i> Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);

        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            confirmModal.remove();
            resolve(true);
        });
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            confirmModal.remove();
            resolve(false);
        });
        confirmModal.addEventListener('click', (event) => {
            if (event.target === confirmModal) {
                confirmModal.remove();
                resolve(false);
            }
        });
    });

    if (!confirmDelete) {
        return; // El usuario canceló la eliminación
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${selectedProductId}`, {
            method: 'DELETE',
        });

        if (response.status === 204) { // Código 204 No Content para eliminación exitosa.
            showAlert('Producto eliminado con éxito.', 'success');
            loadProducts(); // Recargar la lista de productos
            selectedProductId = null; // Deseleccionar
            editProductBtn.disabled = true; // Deshabilitar botones
            deleteProductBtn.disabled = true;
        } else if (response.status === 404) {
            showAlert('Producto no encontrado.', 'error');
        } else {
            const errorText = await response.text();
            throw new Error(`Error al eliminar producto: ${response.status} ${errorText}`);
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        showAlert(`Error al eliminar producto: ${error.message}`, 'error');
    }
}

/**
 * Carga los proveedores únicos para el filtro de informes.
 */
async function loadUniqueProveedores() {
    try {
        const response = await fetch(API_PROVEEDORES_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const proveedores = await response.json();
        reportSupplierSelect.innerHTML = '<option value="">Todos los proveedores</option>'; // Opción por defecto
        proveedores.forEach(proveedor => {
            const option = document.createElement('option');
            option.value = proveedor;
            option.textContent = proveedor;
            reportSupplierSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        showAlert('Error al cargar la lista de proveedores para el informe.', 'error');
    }
}

/**
 * Genera y muestra un informe de inventario basado en los filtros.
 * @param {Event} event Evento de submit del formulario de reporte.
 */
async function generateReport(event) {
    event.preventDefault();

    const category = reportCategoryInput.value.trim();
    const minStock = reportMinStockInput.value;
    const startDate = reportStartDateInput.value;
    const endDate = reportEndDateInput.value;
    const supplier = reportSupplierSelect.value;
    const productName = reportProductNameInput.value.trim();

    const params = new URLSearchParams();
    if (category) params.append('category', category); // El backend no tiene filtro por categoría en informe, esto no hará nada.
    if (minStock) params.append('minStock', minStock);
    // Nota: El backend tiene minPrice y maxPrice, pero el frontend no los expone.
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (supplier) params.append('supplier', supplier);
    if (productName) params.append('productName', productName);

    try {
        const response = await fetch(`${API_INFORME_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reportProducts = await response.json();
        currentReportProducts = reportProducts; // Almacena los productos para la descarga CSV
        renderReport(reportProducts);

        if (reportProducts.length > 0) {
            downloadCsvBtn.style.display = 'inline-flex'; // Muestra el botón de descarga si hay resultados
        } else {
            downloadCsvBtn.style.display = 'none'; // Oculta el botón si no hay resultados
        }
        showAlert('Informe generado con éxito.', 'success');
    } catch (error) {
        console.error('Error al generar informe:', error);
        showAlert('Error al generar el informe. Inténtalo de nuevo.', 'error');
        clearReportTable(); // Limpia la tabla y oculta el botón de descarga en caso de error
    }
}

/**
 * Renderiza los productos del informe en la tabla de informes.
 * @param {Array<Object>} products Lista de objetos ProductoOtaku para el informe.
 */
function renderReport(products) {
    reportTableBody.innerHTML = ''; // Limpiar tabla antes de renderizar
    if (products.length === 0) {
        reportTableBody.innerHTML = `
            <tr class="no-results">
                <td colspan="8">No se encontraron productos que coincidan con los filtros.</td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = reportTableBody.insertRow();
        const stockClass = (product.stock !== null && product.nivelMinimoStock !== null && product.stock < product.nivelMinimoStock) ? 'low-stock' : '';

        // Formatea la fecha de reposición si existe
        const ultimaFechaReposicionFormatted = product.ultimaFechaReposicion ? new Date(product.ultimaFechaReposicion).toLocaleDateString('es-ES') : 'N/A';

        // Se añade `data-label` para la responsividad móvil.
        row.innerHTML = `
            <td data-label="ID">${product.id}</td>
            <td data-label="Nombre">${product.nombre}</td>
            <td data-label="Categoría">${product.categoria}</td>
            <td data-label="Precio">${product.precio ? product.precio.toFixed(2) + '€' : 'N/A'}</td>
            <td data-label="Stock" class="${stockClass}">${product.stock !== null ? product.stock : 'N/A'}</td>
            <td data-label="Proveedor">${product.proveedor || 'N/A'}</td>
            <td data-label="Stock Mínimo">${product.nivelMinimoStock !== null ? product.nivelMinimoStock : 'N/A'}</td>
            <td data-label="Última Reposición">${ultimaFechaReposicionFormatted}</td>
        `;
    });
}

/**
 * Descarga los datos actuales del informe como un archivo CSV.
 */
function convertToCsvAndDownload() {
    if (!currentReportProducts || currentReportProducts.length === 0) {
        showAlert('No hay datos en el informe para descargar.', 'warning');
        return;
    }

    const headers = [
        "ID", "Nombre", "Categoría", "Precio", "Stock", "Proveedor", "Nivel Mínimo Stock", "Última Fecha Reposición"
    ];

    // Mapea los datos del producto a las cabeceras en el orden correcto
    const rows = currentReportProducts.map(product => [
        product.id,
        `"${product.nombre.replace(/"/g, '""')}"`, // Escapa comillas dobles en el nombre
        `"${product.categoria.replace(/"/g, '""')}"`,
        product.precio !== null ? product.precio.toFixed(2) : 'N/A',
        product.stock !== null ? product.stock : 'N/A',
        `"${(product.proveedor || 'N/A').replace(/"/g, '""')}"`,
        product.nivelMinimoStock !== null ? product.nivelMinimoStock : 'N/A',
        product.ultimaFechaReposicion ? new Date(product.ultimaFechaReposicion).toLocaleDateString('es-ES') : 'N/A'
    ]);

    // Une las cabeceras y las filas con comas, y cada fila con un salto de línea
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Crea un Blob con el contenido CSV y lo descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'informe_productos_akihabara.csv');
    document.body.appendChild(link); // Necesario para Firefox
    link.click();
    document.body.removeChild(link); // Limpiar
    URL.revokeObjectURL(url); // Liberar el objeto URL
    showAlert('Informe CSV descargado exitosamente.', 'success');
}

// --- Lógica del Modo Oscuro ---

/**
 * Alterna entre el modo claro y oscuro de la aplicación.
 * Guarda la preferencia en localStorage.
 */
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggleIcon(isDarkMode);
}

/**
 * Actualiza el icono del botón de modo oscuro según el estado actual.
 * @param {boolean} isDarkMode True si el modo oscuro está activo, false en caso contrario.
 */
function updateDarkModeToggleIcon(isDarkMode) {
    const icon = darkModeToggle.querySelector('i');
    if (isDarkMode) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

/**
 * Carga la preferencia de modo oscuro del usuario desde localStorage al iniciar la aplicación.
 */
function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeToggleIcon(isDarkMode);
}


// --- Event Listeners ---

// Navegación del Sidebar
dashboardLink.addEventListener('click', (event) => {
    event.preventDefault();
    setActiveSection(dashboardSection, dashboardLink);
    loadProducts(); // Recargar productos al volver al dashboard
});

inventoryReportsLink.addEventListener('click', (event) => {
    event.preventDefault();
    setActiveSection(inventoryReportsSection, inventoryReportsLink);
    loadUniqueProveedores(); // Cargar proveedores al entrar en informes
    clearReportTable(); // Limpiar la tabla de informes al cambiar de sección
});

// Botones de acción del Dashboard
addProductBtn.addEventListener('click', () => showModal());
editProductBtn.addEventListener('click', () => {
    if (selectedProductId) {
        // Fetch the product details to ensure the modal gets the latest data
        // This is important because the table might not have all fields or the latest values
        fetch(`${API_BASE_URL}/${selectedProductId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                showModal(product);
            })
            .catch(error => {
                console.error('Error al cargar el producto para edición:', error);
                showAlert('Ocurrió un error al cargar los datos del producto para edición.', 'error');
            });
    } else {
        showAlert('Selecciona un producto para editar.', 'warning');
    }
});
deleteProductBtn.addEventListener('click', deleteProduct);

// Cierre del modal
closeModalBtn.addEventListener('click', hideModal);
cancelModalBtn.addEventListener('click', hideModal);
productModal.addEventListener('click', (event) => {
    if (event.target === productModal) { // Solo cierra si se hace clic en el overlay
        hideModal();
    }
});

// Envío del formulario de producto (añadir/editar)
productForm.addEventListener('submit', addOrUpdateProduct);

// Búsqueda de productos
searchInput.addEventListener('input', (event) => {
    loadProducts(event.target.value);
});

// Envío del formulario de reporte
reportForm.addEventListener('submit', generateReport);

// Botón de limpiar filtros de reporte
clearReportFiltersBtn.addEventListener('click', () => {
    reportForm.reset();
    clearReportTable();
    loadUniqueProveedores(); // Recargar proveedores por si acaso
});

// Botón de descarga CSV
downloadCsvBtn.addEventListener('click', convertToCsvAndDownload);

// Botón de Modo Oscuro
darkModeToggle.addEventListener('click', toggleDarkMode);

// Botón de menú hamburguesa para móviles
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar-open');
});

// --- Inicialización de la aplicación ---
/**
 * Event listener que se dispara cuando el DOM ha sido completamente cargado.
 * Asegura que la sección del dashboard sea visible por defecto y carga la lista inicial de productos.
 */
document.addEventListener('DOMContentLoaded', () => {
    loadDarkModePreference(); // Cargar la preferencia de modo oscuro al inicio
    setActiveSection(dashboardSection, dashboardLink); // Inicializa la UI mostrando el dashboard
    loadProducts(); // Carga los productos inicialmente al cargar la página
});
