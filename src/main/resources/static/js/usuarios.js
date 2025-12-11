
$(document).ready(function () {
    // Variables globales
    let dataTable;
    let isEditing = false;
    let usuarioModal;
    let usuario;


    // Configuración inicial
    const API_BASE = '/usuarios/api';
    const ENDPOINTS = {
        list: `${API_BASE}/listar`,
        save: `${API_BASE}/guardar`,
        get: (id) => `${API_BASE}/${id}`,
        delete: (id) => `${API_BASE}/eliminar/${id}`,
        profiles: `${API_BASE}/perfiles`,
        toggleStatus: (id) => `${API_BASE}/cambiar-estado/${id}`,
        usuarioLogin: `${API_BASE}/usuarioLogueado`,
    };

    // Inicializar DataTable
    cargarDatosUsuarioLogueado();
    initializeDataTable();

    // Inicializar Modal de Bootstrap
    usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));

    // Cargar perfiles para el select
    loadProfiles();

    // Event Listeners
    setupEventListeners();

    function initializeDataTable() {
        dataTable = $('#tablaUsuarios').DataTable({
            responsive: true,
            processing: true,
            ajax: {
                url: ENDPOINTS.list,
                dataSrc: 'data'
            },
            columns: [
                {
                    data: 'id',
                    render: (data) => `#USR-${data}`
                },
                { data: 'nombre' },
                { data: 'usuario' },
                { data: 'perfil.nombre' },
                { data: 'correo' },
                {
                    data: 'estado',
                    render: function (data, type, row) {
                        return data === 1
                            ? '<span class="badge text-bg-success">Activo</span>'
                            : '<span class="badge text-bg-danger">Inactivo</span>';
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
                { responsivePriority: 2, targets: 6 },
            ],
            language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            pageLength: 10
        });
    }

    function createActionButtons(row) {
        const statusIcon = row.estado === 1
            ? '<i class="bi bi-eye-slash-fill"></i>' : '<i class="bi bi-eye-fill"></i>';

        const statusClass = row.estado === 1 ? 'action-btn-status-deactivate' : 'action-btn-status-activate';
        const statusTitle = row.estado === 1 ? 'Desactivar' : 'Activar';

        return `
            <div class="d-flex gap-1">
                <button data-id="${row.id}" class="action-edit btn btn-sm btn-primary" title="Editar">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button data-id="${row.id}" data-perfil="${row.perfil.nombre}" class="action-status btn btn-sm ${row.estado === 1 ? 'btn-warning' : 'btn-success'}" title="${statusTitle}">
                    ${statusIcon}
                </button>
                <button data-id="${row.id}" data-perfil="${row.perfil.nombre}" class="action-delete btn btn-sm btn-danger" title="Eliminar">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>
        `;
    }

    function setupEventListeners() {
        $('#btnNuevoRegistro').on('click', openModalForNew);

        $('#formUsuario').on('submit', function (e) {
            e.preventDefault();
            saveUsuario();
        });

        $('#tablaUsuarios tbody').on('click', '.action-edit', handleEdit);
        $('#tablaUsuarios tbody').on('click', '.action-status', handleToggleStatus);
        $('#tablaUsuarios tbody').on('click', '.action-delete', handleDelete);
    }


    function loadUsuarios() {
        dataTable.ajax.reload();
    }

    function loadProfiles() {
        fetch(ENDPOINTS.profiles)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const select = $('#id_perfil');
                    select.empty().append('<option value="">Seleccione un perfil...</option>');
                    data.data.forEach(profile => {
                        select.append(`<option value="${profile.id}">${profile.nombre}</option>`);
                    });
                } else {
                    showNotification('Error al cargar perfiles', 'error');
                }
            }).catch(error => {
                console.error('Error cargando perfiles:', error);
            });
    }

    function saveUsuario() {
        clearFieldErrors();

        const formData = {
            id: $('#id').val() || null,
            nombre: $('#nombre').val().trim(),
            usuario: $('#usuario').val().trim(),
            clave: $('#clave').val(),
            correo: $('#correo').val().trim(),
            perfil: {
                id: $('#id_perfil').val()
            }
        };

        if (!validateForm(formData)) {
            return;
        }

        if (isEditing && (!formData.clave || String(formData.clave).trim() === '')) {
            delete formData.clave;
        }

        showLoading(true);

        fetch(ENDPOINTS.save, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    hideModal();
                    showNotification(data.message, 'success');
                    loadUsuarios();
                } else {
                    if (data.errors) {
                        Object.keys(data.errors).forEach(field => {
                            showFieldError(field, data.errors[field]);
                        });
                    } else {
                        showNotification(data.message, 'error');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión al guardar usuario', 'error');
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function handleEdit(e) {
        e.preventDefault();
        const id = $(this).data('id');

        showLoading(true);

        fetch(ENDPOINTS.get(id))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Usuario no encontrado');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    openModalForEdit(data.data);
                } else {
                    showNotification('Error al cargar usuario: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al cargar los datos del usuario', 'error');
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function handleToggleStatus(e) {
        e.preventDefault();
        const id = $(this).data('id');
        const perfil = $(this).data('perfil');

        if (!usuario || !usuario.id) {
            showNotification('No se pudo verificar el usuario logueado. Intente recargar la página.', 'error');
            return;
        }

        if (usuario.id === id) {
            Swal.fire({
                title: 'Acción Inválida',
                text: 'No puede inactivar su propio usuario.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
            return;
        }

        if (perfil === "Administrador") {
            Swal.fire({
                title: 'Acción Inválida',
                text: 'No puede inactivar a los administradores',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
            return;
        }

        showLoading(true);

        fetch(ENDPOINTS.toggleStatus(id), {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    loadUsuarios();
                } else {
                    showNotification('Error: ' + data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error de conexión al cambiar estado', 'error');
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function handleDelete(e) {
        e.preventDefault();

        const id = $(this).data('id');
        const perfil = $(this).data('perfil');

        if (!usuario || !usuario.id) {
            showNotification('No se pudo verificar el usuario logueado. Intente recargar la página.', 'error');
            return;
        }

        if (usuario.id === id) {
            Swal.fire({
                title: 'Acción Inválida',
                text: 'No puede eliminar su propio usuario.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
            return;
        }

        if (perfil === "Administrador") {
            Swal.fire({
                title: 'Acción Inválida',
                text: 'No puede eliminar a los administradores',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
            return;
        }

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
                            loadUsuarios();
                        } else {
                            showNotification('Error: ' + data.message, 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Error de conexión al eliminar usuario', 'error');
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
        $('#modalTitle').text('Agregar Usuario');
        $('#clave').prop('required', true).attr('placeholder', '');
        showModal();
    }

    function openModalForEdit(usuario) {
        isEditing = true;
        clearForm();
        $('#modalTitle').text('Editar Usuario');

        $('#id').val(usuario.id);
        $('#nombre').val(usuario.nombre);
        $('#usuario').val(usuario.usuario);
        $('#correo').val(usuario.correo);
        $('#id_perfil').val(usuario.perfil ? usuario.perfil.id : '');
        $('#clave').val('').prop('required', false).attr('placeholder', 'Dejar en blanco para no cambiar');

        showModal();
    }

    function showModal() {
        usuarioModal.show();
    }

    function hideModal() {
        usuarioModal.hide();
        clearForm();
    }

    function clearForm() {
        $('#formUsuario')[0].reset();
        $('#formUsuario .form-control').removeClass('is-invalid');
        $('.invalid-feedback').text('');
        isEditing = false;
    }

    function validateForm(formData) {
        let hasErrors = false;
        clearFieldErrors();

        if (!formData.nombre) {
            showFieldError('nombre', 'El nombre es obligatorio');
            hasErrors = true;
        } else if (formData.nombre.length < 2) {
            showFieldError('nombre', 'El nombre debe tener al menos 2 caracteres');
            hasErrors = true;
        }

        if (!formData.usuario) {
            showFieldError('usuario', 'El usuario es obligatorio');
            hasErrors = true;
        } else if (formData.usuario.length < 3) {
            showFieldError('usuario', 'El usuario debe tener al menos 3 caracteres');
            hasErrors = true;
        }

        if (!formData.perfil.id) {
            showFieldError('id_perfil', 'Debe seleccionar un perfil');
            hasErrors = true;
        }

        const claveRequerida = $('#clave').prop('required');
        const claveValor = formData.clave != null ? String(formData.clave).trim() : '';
        if (claveRequerida && !claveValor) {
            showFieldError('clave', 'La contraseña es obligatoria');
            hasErrors = true;
        } else if (claveValor && claveValor.length < 6) {
            showFieldError('clave', 'La contraseña debe tener al menos 6 caracteres');
            hasErrors = true;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            showFieldError('correo', 'El formato del correo no es válido');
            hasErrors = true;
        }

        return !hasErrors;
    }

    function showFieldError(fieldName, message) {
        const field = $(`#${fieldName}`);
        const errorDiv = $(`#${fieldName}-error`);

        field.addClass('is-invalid');
        errorDiv.text(message);
    }

    function clearFieldErrors() {
        $('.invalid-feedback').text('');
        $('#formUsuario .form-control').removeClass('is-invalid');
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

    function cargarDatosUsuarioLogueado() {
        fetch(ENDPOINTS.usuarioLogin)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener ID de usuario.');
                }
                return response.json();
            })
            .then(loginData => {
                if (loginData.success && loginData.usuarioActual) {
                    return fetch(ENDPOINTS.get(loginData.usuarioActual));
                } else {
                    throw new Error('No se encontró el ID del usuario logueado en la respuesta.');
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos del usuario.');
                }
                return response.json();
            })
            .then(userData => {
                if (userData.success) {
                    usuario = userData.data;
                } else {
                    throw new Error('La respuesta para obtener datos de usuario no fue exitosa.');
                }
            })
            .catch(error => {
                console.error('Error al cargar la información del usuario logueado:', error);
                usuario = null;
                showNotification('No se pudo cargar la información del usuario. Algunas funciones podrían no operar correctamente.', 'error');
            });
    }

});