/**
 * Script para la gestión de perfiles y permisos
 * Archivo: src/main/resources/static/js/perfiles.js
 */

$(document).ready(function () {
    // Variables globales
    let dataTable;
    let isEditing = false;
    let perfilModal;
    let permisosModal;

    // Configuración inicial
    const API_BASE = '/perfiles/api';
    const ENDPOINTS = {
        list: `${API_BASE}/listar`,
        save: `${API_BASE}/guardar`,
        get: (id) => `${API_BASE}/${id}`,
        toggleStatus: (id) => `${API_BASE}/cambiar-estado/${id}`,
        delete: (id) => `${API_BASE}/eliminar/${id}`,
        options: `${API_BASE}/opciones`
    };

    // Inicializar Componentes
    initializeDataTable();
    perfilModal = new bootstrap.Modal(document.getElementById('perfilModal'));
    permisosModal = new bootstrap.Modal(document.getElementById('permisosModal'));

    // Event Listeners
    setupEventListeners();

    /**
     * Inicializa DataTable
     */
    function initializeDataTable() {
        dataTable = $('#tablaPerfiles').DataTable({
            responsive: true,
            processing: true,
            ajax: {
                url: ENDPOINTS.list,
                dataSrc: 'data'
            },
            columns: [
                {
                    data: 'id',
                    render: (data) => `#PFP-${data}`
                },
                { data: 'nombre' },
                { data: 'descripcion' },
                {
                    data: 'estado',
                    render: (data) => data ? '<span class="badge text-bg-success">Activo</span>' : '<span class="badge text-bg-danger">Inactivo</span>'
                },
                {
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => createActionButtons(row)
                }
            ],
            columnDefs: [
                { responsivePriority: 1, targets: 1 },
                { responsivePriority: 2, targets: 4 },
            ],
            language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            pageLength: 10
        });
    }

    /**
     * Crea los botones de acción para cada fila
     */
    function createActionButtons(row) {
        const statusIcon = row.estado ? 'bi-eye-slash-fill' : 'bi-eye-fill';
        const statusTitle = row.estado ? 'Desactivar' : 'Activar';

        return `
            <div class="d-flex gap-1">
                <button data-id="${row.id}" class="btn btn-sm btn-info text-white action-permissions" title="Permisos">
                    <i class="bi bi-shield-lock-fill"></i> Permisos
                </button>

                <button data-id="${row.id}" class="btn btn-sm btn-primary action-edit" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>

                <button data-id="${row.id}" class="btn btn-sm ${row.estado ? 'btn-warning' : 'btn-success'} action-status" title="${statusTitle}">
                    <i class="bi ${statusIcon}"></i>
                </button>

                <button data-id="${row.id}" class="btn btn-sm btn-danger action-delete" title="Eliminar">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>
        `;
    }


    function setupEventListeners() {
        $('#btnNuevoRegistro').on('click', openModalForNew);
        $('#formPerfil').on('submit', (e) => { e.preventDefault(); savePerfil(); });
        $('#tablaPerfiles tbody').on('click', '.action-edit', handleEdit);
        $('#tablaPerfiles tbody').on('click', '.action-status', handleToggleStatus);
        $('#tablaPerfiles tbody').on('click', '.action-permissions', handlePermissions);
        $('#btnGuardarPermisos').on('click', savePermissions);
        $('#tablaPerfiles tbody').on('click', '.action-delete', handleDelete);
    }

    function reloadTable() {
        dataTable.ajax.reload();
    }

    function savePerfil() {
        const perfilData = {
            id: $('#id').val() || null,
            nombre: $('#nombre').val().trim(),
            descripcion: $('#descripcion').val().trim(),
        };

        if (!perfilData.nombre) {
            showFieldError('nombre', 'El nombre es obligatorio');
            return;
        }

        showLoading(true);
        fetch(ENDPOINTS.save, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(perfilData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    perfilModal.hide();
                    showNotification(data.message, 'success');
                    reloadTable();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => showNotification('Error de conexión', 'error'))
            .finally(() => showLoading(false));
    }

    function handleEdit(e) {
        const id = $(this).data('id');
        showLoading(true);
        fetch(ENDPOINTS.get(id))
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    openModalForEdit(data.data);
                } else {
                    showNotification('Error al cargar perfil', 'error');
                }
            })
            .catch(error => showNotification('Error de conexión', 'error'))
            .finally(() => showLoading(false));
    }

    function handleToggleStatus(e) {
        const id = $(this).data('id');
        showLoading(true);
        fetch(ENDPOINTS.toggleStatus(id), { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    reloadTable();
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => showNotification('Error de conexión', 'error'))
            .finally(() => showLoading(false));
    }

    function handleDelete(e) {
        const id = $(this).data('id');

        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción! Se eliminará el perfil permanentemente.",
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
                            reloadTable();
                        } else {
                            showNotification(data.message, 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Error de conexión al eliminar el perfil.', 'error');
                    })
                    .finally(() => {
                        showLoading(false);
                    });
            }
        });
    }

    async function handlePermissions(e) {
        const id = $(this).data('id');
        showLoading(true);
        $('#permisoPerfilId').val(id);

        try {
            const [perfilRes, opcionesRes] = await Promise.all([
                fetch(ENDPOINTS.get(id)),
                fetch(ENDPOINTS.options)
            ]);

            const perfilData = await perfilRes.json();
            const opcionesData = await opcionesRes.json();

            if (perfilData.success && opcionesData.success) {
                $('#permisoPerfilNombre').text(perfilData.data.nombre);
                const listaOpciones = $('#listaOpciones');
                listaOpciones.empty();

                opcionesData.data.forEach(opcion => {
                    const isChecked = perfilData.data.opciones.includes(opcion.id);
                    const item = `
                        <label class="list-group-item">
                            <input class="form-check-input me-1" type="checkbox" value="${opcion.id}" ${isChecked ? 'checked' : ''}>
                            ${opcion.nombre}
                        </label>
                    `;
                    listaOpciones.append(item);
                });
                permisosModal.show();
            } else {
                showNotification('Error al cargar datos de permisos', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión al cargar permisos', 'error');
        } finally {
            showLoading(false);
        }
    }

    async function savePermissions() {
        const perfilId = $('#permisoPerfilId').val();
        const selectedOpciones = $('#listaOpciones input:checked').map(function () {
            return { id: $(this).val() };
        }).get();

        showLoading(true);
        try {
            const perfilRes = await fetch(ENDPOINTS.get(perfilId));
            const perfilData = await perfilRes.json();

            if (!perfilData.success) {
                showNotification('No se pudo obtener el perfil para actualizar', 'error');
                return;
            }

            const perfilToUpdate = perfilData.data;
            perfilToUpdate.opciones = selectedOpciones;

            const saveRes = await fetch(ENDPOINTS.save, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(perfilToUpdate)
            });
            const saveData = await saveRes.json();

            if (saveData.success) {
                permisosModal.hide();
                showNotification('Permisos actualizados correctamente', 'success');
            } else {
                showNotification(saveData.message || 'Error al guardar permisos', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión al guardar permisos', 'error');
        } finally {
            showLoading(false);
        }
    }

    function openModalForNew() {
        isEditing = false;
        clearForm();
        $('#modalTitle').text('Agregar Perfil');
        perfilModal.show();
    }

    function openModalForEdit(perfil) {
        isEditing = true;
        clearForm();
        $('#modalTitle').text('Editar Perfil');
        $('#id').val(perfil.id);
        $('#nombre').val(perfil.nombre);
        $('#descripcion').val(perfil.descripcion);
        perfilModal.show();
    }

    function clearForm() {
        $('#formPerfil')[0].reset();
        clearFieldErrors();
    }

    function showFieldError(field, message) {
        $(`#${field}`).addClass('is-invalid');
        $(`#${field}-error`).text(message);
    }

    function clearFieldErrors() {
        $('.form-control').removeClass('is-invalid');
        $('.invalid-feedback').text('');
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
        let $overlay = $(`#${overlayId}`);
        if (show) {
            if ($overlay.length === 0) {
                $('body').append('<div id="loading-overlay" class="loading-overlay"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');
            }
        } else {
            $overlay.remove();
        }
    }
});