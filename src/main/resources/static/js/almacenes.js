
$(document).ready(function () {
    // Variables globales
    let dataTable;
    let isEditing = false;
    let almacenModal;

    // Configuración inicial
    const API_BASE = '/almacen/api';
    const ENDPOINTS = {
        list: `${API_BASE}/listar`,
        save: `${API_BASE}/guardar`,
        update: (id) => `${API_BASE}/actualizar/${id}`,
        get: (id) => `${API_BASE}/${id}`,
        delete: (id) => `${API_BASE}/eliminar/${id}`,
    };

    // Inicializar Componentes
    initializeDataTable();
    almacenModal = new bootstrap.Modal(document.getElementById('almacenModal'));

    // Cargar lista de productos para el select
    loadProductosList();

    // Event Listeners
    setupEventListeners();

    function initializeDataTable() {
        dataTable = $('#tablaAlmacenes').DataTable({
            responsive: true,
            processing: true,
            deferRender: true,
            ajax: {
                url: ENDPOINTS.list,
                dataSrc: 'data'
            },
            columns: [
                {
                    data: 'id',
                    render: (data) => `#ALM-${data}`

                },
                { data: 'nombre' },
                { data: 'stockActual' },
                { data: 'stockMinimo' },
                {
                    data: 'producto', render: function (data, type, row) {
                        return data && data.nombre ? data.nombre : '';
                    }
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, row) {
                        return createActionButtons(row);
                    }
                }
            ],
            columnDefs: [
                { responsivePriority: 1, targets: 1 },
                { responsivePriority: 2, targets: 2 },
                { responsivePriority: 1, targets: -1 }
            ],
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
            },
            pageLength: 10,
            lengthMenu: [10, 25, 50],
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                    title: 'Listado de Almacenes',
                    className: 'btn btn-success',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                        modifier: {
                            page: 'all'
                        }
                    }
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                    title: 'Listado de Almacenes',
                    className: 'btn btn-danger',
                    orientation: 'landscape',
                    pageSize: 'A4',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                        modifier: {
                            page: 'all'
                        }
                    }
                },
                {
                    extend: 'print',
                    text: '<i class="bi bi-printer"></i> Imprimir',
                    className: 'btn btn-info',
                    orientation: 'landscape',
                    pageSize: 'A4',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4],
                        modifier: {
                            page: 'all'
                        }
                    },
                    customize: function (win) {
                        $(win.document.body)
                            .css('font-size', '10pt')
                            .prepend('<h3 style="text-align:center;">Listado de Almacenes</h3>');
                    }
                },
                {
                    extend: 'colvis',
                    text: '<i class="bi bi-eye"></i> Mostrar/Ocultar',
                    className: 'btn btn-secondary'
                }
            ]
        });
    }

    function createActionButtons(row) {
        return `
            <div class="d-flex gap-1">
                <button data-id="${row.id}" class="btn btn-sm btn-primary action-edit" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button data-id="${row.id}" class="btn btn-sm btn-danger action-delete" title="Eliminar">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>
        `;
    }

    function setupEventListeners() {
        $('#btnNuevoRegistro').on('click', openModalForNew);
        $('#formAlmacen').on('submit', function (e) {
            e.preventDefault();
            if (isEditing) {
                updateAlmacen();
            } else {
                createAlmacen();
            }
        });

        $('#tablaAlmacenes tbody').on('click', '.action-edit', handleEdit);
        $('#tablaAlmacenes tbody').on('click', '.action-delete', handleDelete);
    }

    function loadAlmacenes() {
        dataTable.ajax.reload();
    }

    function createAlmacen() {
        const form = document.getElementById("formAlmacen");
        const formData = new FormData(form);

        if (!validateForm(formData)) return;

        const data = {
            nombre: formData.get("nombre"),
            stockMinimo: formData.get("stockMinimo") ? parseInt(formData.get("stockMinimo")) : null,
            productoId: formData.get("productoId") ? parseInt(formData.get("productoId")) : null
        };

        fetch(ENDPOINTS.save, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, "success");
                    const modal = bootstrap.Modal.getInstance(document.getElementById("almacenModal"));
                    modal.hide();
                    form.reset();

                    if (dataTable) {
                        dataTable.ajax.reload(null, false);
                    }
                } else {
                    showNotification(data.message, "error");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showNotification("Error al guardar el almacén", "error");
            });
    }

    function updateAlmacen() {
        const form = document.getElementById("formAlmacen");
        const formData = new FormData(form);

        if (!validateForm(formData)) return;

        const id = formData.get("id") || formData.get("idAlmacen");
        const data = {
            nombre: formData.get("nombre"),
            stockMinimo: formData.get("stockMinimo") ? parseInt(formData.get("stockMinimo")) : null,
            productoId: formData.get("productoId") ? parseInt(formData.get("productoId")) : null
        };

        fetch(ENDPOINTS.update(id), {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, "success");
                    const modal = bootstrap.Modal.getInstance(document.getElementById("almacenModal"));
                    modal.hide();
                    form.reset();

                    if (dataTable) {
                        dataTable.ajax.reload(null, false);
                    }
                } else {
                    showNotification(data.message, "error");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showNotification("Error al actualizar el almacén", "error");
            });
    }



    function handleEdit(e) {
        e.preventDefault();
        const id = $(this).data('id');

        showLoading(true);

        fetch(ENDPOINTS.get(id))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Almacén no encontrado');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    openModalForEdit(data.data);
                } else {
                    showNotification('Error al cargar almacén: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al cargar los datos del almacén', 'error');
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function handleDelete(e) {
        e.preventDefault();

        const id = $(this).data('id');

        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                showLoading(true);

                fetch(ENDPOINTS.delete(id), {
                    method: 'DELETE'
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showNotification(data.message, 'success');
                            loadAlmacenes();
                        } else {
                            showNotification('Error: ' + data.message, 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Error de conexión al eliminar el almacén', 'error');
                    })
                    .finally(() => {
                        showLoading(false);
                    });
            }
        });
    }

    function openModalForNew() {
        isEditing = false;
        clearForm();
        $('#modalTitle').text('Agregar Almacén');
        showModal();
    }

    function openModalForEdit(almacen) {
        clearForm();
        $('#modalTitle').text('Editar Almacén');
        $('#idAlmacen').val(almacen.id);
        $('#nombreAlmacen').val(almacen.nombre);
        $('#stockMinimo').val(almacen.stockMinimo != null ? almacen.stockMinimo : '');
        if (almacen.producto && almacen.producto.id) {
            $('#productoId').val(almacen.producto.id).trigger('change');
        } else {
            $('#productoId').val('');
        }

        isEditing = true;

        showModal();
    }


    function showModal() {
        almacenModal.show();
    }

    function hiddenModal() {
        almacenModal.hide();
        clearForm();
    }

    function clearForm() {
        const $form = $('#formAlmacen');
        if ($form.length) {
            $form[0].reset();
            $form.find('.form-control').removeClass('is-invalid');
        }
        $('.invalid-feedback').text('');
        isEditing = false;
    }

    function validateForm(formData) {
        let hasErrors = false;
        clearFieldErrors();

        const nombre = formData.get("nombre");
        const stockMinimo = formData.get("stockMinimo");
        const productoId = formData.get("productoId");

        if (!nombre || nombre.length < 2) {
            showFieldError('nombreAlmacen', 'El nombre es obligatorio y debe tener al menos 2 caracteres');
            hasErrors = true;
        }

        if (stockMinimo === null || stockMinimo === '' || isNaN(stockMinimo) || parseInt(stockMinimo) < 0) {
            showFieldError('stockMinimo', 'El stock mínimo debe ser un número mayor o igual a 0');
            hasErrors = true;
        }

        if (!productoId || productoId === '') {
            showFieldError('productoId', 'Selecciona un producto');
            hasErrors = true;
        }

        return !hasErrors;
    }

    function loadProductosList() {
        const productosEndpoint = '/productos/api/listar';
        fetch(productosEndpoint)
            .then(response => response.json())
            .then(result => {
                let items = [];
                if (result) {
                    if (Array.isArray(result)) items = result;
                    else if (result.data) items = result.data;
                    else if (result.success && result.data) items = result.data;
                }

                const $select = $('#productoId');
                $select.empty();
                $select.append($('<option>', { value: '', text: '-- Seleccionar producto --' }));

                items.forEach(p => {
                    const id = p.id || (p.producto && p.producto.id) || null;
                    const nombre = p.nombre || (p.producto && p.producto.nombre) || '';
                    if (id != null) {
                        $select.append($('<option>', { value: id, text: nombre }));
                    }
                });
            })
            .catch(error => {
                console.error('Error cargando productos:', error);
            });
    }


    function clearFieldErrors() {
        $('.invalid-feedback').text('');
        $('.form-control').removeClass('is-invalid');
    }

    function showNotification(message, type = 'success') {
        const toastClass = type === 'success' ? 'text-bg-success' : 'text-bg-danger';

        const notification = $(`
            <div class="toast align-items-center ${toastClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `);

        $('#notification-container').append(notification);

        const toast = new bootstrap.Toast(notification, {
            delay: 5000
        });
        toast.show();
    }

    function showLoading(show) {
        const overlayId = 'loading-overlay';
        const $overlay = $(`#${overlayId}`);

        if (show) {
            if ($overlay.length === 0) {
                const spinner = $('<div>', { class: 'spinner-border text-primary', role: 'status' })
                    .append($('<span>', { class: 'visually-hidden' }).text('Loading...'));
                const newOverlay = $('<div>', { id: overlayId, class: 'loading-overlay' })
                    .append(spinner);
                $('body').append(newOverlay);
            }
        } else {
            $overlay.remove();
        }
    }

    function showFieldError(fieldName, message) {
        const field = $(`#${fieldName}`);
        const errorDiv = $(`#${fieldName}-error`);

        field.addClass('is-invalid');
        errorDiv.text(message);
    }

});