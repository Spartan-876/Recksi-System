
$(document).ready(function () {
    // Variables
    let dataTable;
    let movimientoModal;
    let usuarioLogueadoId = null;
    let usuarioLogueadoNombre = null;
    let editingId = null; 
    const tiposMovimiento = { ingreso: 1, salida: 2, transferencia: 3 };

    const API_BASE = '/movimientoInventario';
    const ENDPOINTS = {
        list: `${API_BASE}/api/listar`,
        search: `${API_BASE}/api/buscar`,
        save: `${API_BASE}/api/guardar`,
        delete: (id) => `${API_BASE}/api/eliminar/${id}`,
        tipos: `${API_BASE}/api/TipoMovimiento`,
        stock: (id) => `${API_BASE}/api/stock/${id}`,
        usuarioLogueado: '/usuarios/api/usuarioLogueado'
    };

    // Inicializar
    initializeDataTable();
    movimientoModal = new bootstrap.Modal(document.getElementById('movimientoModal'));
    obtenerUsuarioLogueado().then(() => {
        return cargarTiposMovimiento();
    }).then(() => {
        loadSelects();
        setupEventListeners();
    });

    function initializeDataTable() {
        dataTable = $('#tablaMovimientos').DataTable({
            responsive: true,
            processing: true,
            deferRender: true,
            ajax: {
                url: ENDPOINTS.list,
                dataSrc: 'data'
            },
            columns: [
                { data: 'id' },
                { data: 'fechaHora', render: formatDate },
                { data: 'tipoMovimiento', render: (d) => d ? d.nombre : '' },
                { data: 'cantidad' },
                { data: 'almacenOrigen', render: (d) => d ? d.nombre : '' },
                { data: 'almacenDestino', render: (d) => d ? d.nombre : '' },
                { data: 'usuario', render: (d) => d ? d.nombre : '' },
                { data: null, orderable: false, searchable: false, render: (r) => createActionButtons(r) }
            ],
            language: { url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            pageLength: 10,
            dom: 'lBfrtip',
            buttons: [
                {
                    extend: 'excelHtml5',
                    text: '<i class="bi bi-file-earmark-excel"></i> Excel',
                    className: 'btn btn-success',
                    exportOptions:
                    {
                        columns: [0, 1, 2, 3, 4, 5, 6]
                    }
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="bi bi-file-earmark-pdf"></i> PDF',
                    className: 'btn btn-danger',
                    exportOptions:
                    {
                        columns: [0, 1, 2, 3, 4, 5, 6]
                    }
                },
                {
                    extend: 'print',
                    text: '<i class="bi bi-printer"></i> Imprimir',
                    className: 'btn btn-info',
                    exportOptions:
                    {
                        columns: [0, 1, 2, 3, 4, 5, 6]
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
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button data-id="${row.id}" class="btn btn-sm btn-danger action-delete" title="Eliminar">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </div>`;
    }

    function setupEventListeners() {
        $('#btnNuevoRegistro').on('click', openModalForNew);
        $('#btnBuscarFiltrado').on('click', buscarMovimientos);
        $('#btnLimpiarFiltro').on('click', () => { $('#formFiltro')[0].reset(); dataTable.ajax.reload(); });

        $('#formMovimiento').on('submit', function (e) {
            e.preventDefault();
            createMovimiento();
        });

        $('#tipoMovimiento').on('change', function () {
            actualizarVisibilidadAlmacenes();
        });

        $('#tablaMovimientos tbody').on('click', '.action-delete', handleDelete);
        $('#tablaMovimientos tbody').on('click', '.action-edit', handleEdit);
    }

    function obtenerUsuarioLogueado() {
        return fetch(ENDPOINTS.usuarioLogueado)
            .then(r => r.json())
            .then(res => {
                if (res && res.usuarioActual) {
                    usuarioLogueadoId = res.usuarioActual;
                    if (res.data && Array.isArray(res.data)) {
                        const u = res.data.find(x => x.id === usuarioLogueadoId);
                        if (u) usuarioLogueadoNombre = u.nombre || null;
                    }
                    $('#usuario').val(usuarioLogueadoId);
                    if (usuarioLogueadoNombre) {
                        $('#usuarioDisplay').val(usuarioLogueadoNombre);
                    }
                }
                return Promise.resolve();
            })
            .catch(err => { console.error('Error obteniendo usuario:', err); return Promise.resolve(); });
    }

    function cargarTiposMovimiento() {
        return fetch(ENDPOINTS.tipos)
            .then(r => r.json())
            .then(res => {
                const items = res && res.data ? res.data : [];
                items.forEach(tipo => {
                    const nombre = tipo.nombre ? tipo.nombre.toLowerCase() : '';
                    if (nombre.includes('ingreso')) tiposMovimiento.ingreso = tipo.id;
                    else if (nombre.includes('salida')) tiposMovimiento.salida = tipo.id;
                    else if (nombre.includes('transferencia')) tiposMovimiento.transferencia = tipo.id;
                });
                return Promise.resolve();
            })
            .catch(err => { console.error('Error cargando tipos:', err); return Promise.resolve(); });
    }

    function actualizarVisibilidadAlmacenes() {
        const tipoSeleccionado = $('#tipoMovimiento').val();
        const $colOrigen = $('#col-almacenOrigen');
        const $colDestino = $('#col-almacenDestino');

        $('#almacenOrigen').val('');
        $('#almacenDestino').val('');

        if (tipoSeleccionado == tiposMovimiento.ingreso) {
            $colOrigen.hide();
            $colDestino.show();
        } else if (tipoSeleccionado == tiposMovimiento.salida) {
            $colOrigen.show();
            $colDestino.hide();
        } else if (tipoSeleccionado == tiposMovimiento.transferencia) {
            $colOrigen.show();
            $colDestino.show();
        } else {
            $colOrigen.hide();
            $colDestino.hide();
        }
    }

    function loadSelects() {
        fetch('/almacen/api/listar').then(r => r.json()).then(res => {
            const items = res && res.data ? res.data : [];
            const $fAlmacen = $('#fAlmacen');
            const $origen = $('#almacenOrigen');
            const $destino = $('#almacenDestino');

            items.forEach(a => {
                $fAlmacen.append($('<option>', { value: a.id, text: a.nombre }));
                $origen.append($('<option>', { value: a.id, text: a.nombre }));
                $destino.append($('<option>', { value: a.id, text: a.nombre }));
            });
        }).catch(() => { });

        fetch(ENDPOINTS.tipos).then(r => r.json()).then(res => {
            const items = res && res.data ? res.data : [];
            const $tipo = $('#tipoMovimiento');
            const $fTipo = $('#fTipoMovimiento');

            $tipo.append($('<option>', { value: '', text: '-- Seleccionar tipo --', disabled: true, hidden: true }));
            items.forEach(t => {
                $tipo.append($('<option>', { value: t.id, text: t.nombre }));
                $fTipo.append($('<option>', { value: t.id, text: t.nombre }));
            });
        }).catch(() => { });

        fetch('/usuarios/api/listar').then(r => r.json()).then(res => {
            const items = res && res.data ? res.data : [];
            const $fUsuario = $('#fUsuario');

            items.forEach(u => {
                $fUsuario.append($('<option>', { value: u.id, text: u.nombre }));
            });
        }).catch(() => { });
    }

    function buscarMovimientos() {
        const form = document.getElementById('formFiltro');
        const formData = new FormData(form);
        const payload = {
            fechaInicio: formData.get('fechaInicio') || null,
            fechaFin: formData.get('fechaFin') || null,
            almacenId: formData.get('almacenId') ? parseInt(formData.get('almacenId')) : null,
            tipoMovimientoId: formData.get('tipoMovimientoId') ? parseInt(formData.get('tipoMovimientoId')) : null,
            usuarioId: formData.get('usuarioId') ? parseInt(formData.get('usuarioId')) : null
        };

        showLoading(true);
        fetch(ENDPOINTS.search, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            .then(r => r.json())
            .then(res => {
                if (res && res.data) {
                    dataTable.clear();
                    dataTable.rows.add(res.data);
                    dataTable.draw();
                }
            })
            .catch(err => console.error(err))
            .finally(() => showLoading(false));
    }

    function createMovimiento() {
        const form = document.getElementById('formMovimiento');
        const formData = new FormData(form);
        if (!validateMovimientoForm(formData)) return;

        const payload = {
            cantidad: formData.get('cantidad') ? parseInt(formData.get('cantidad')) : null,
            almacenOrigenId: formData.get('almacenOrigenId') ? parseInt(formData.get('almacenOrigenId')) : null,
            almacenDestinoId: formData.get('almacenDestinoId') ? parseInt(formData.get('almacenDestinoId')) : null,
            tipoMovimientoId: formData.get('tipoMovimientoId') ? parseInt(formData.get('tipoMovimientoId')) : null,
            usuarioId: formData.get('usuarioId') ? parseInt(formData.get('usuarioId')) : null
        };

        console.log('Payload enviado:', payload);

        const isEdit = editingId !== null && editingId !== undefined;
        const url = isEdit ? `${API_BASE}/api/actualizar/${editingId}` : ENDPOINTS.save;
        const method = isEdit ? 'PUT' : 'POST';

        fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            .then(r => r.json())
            .then(res => {
                console.log('Respuesta:', res);
                if (res && res.success) {
                    showNotification(res.message || (isEdit ? 'Movimiento actualizado' : 'Movimiento guardado'), 'success');
                    movimientoModal.hide();
                    form.reset();
                    editingId = null;
                    dataTable.ajax.reload(null, false);
                } else {
                    showNotification(res.message || 'Error al guardar', 'error');
                    if (res && res.errors) {
                        console.log('Errores detallados:', res.errors);
                    }
                }
            }).catch(err => { console.error(err); showNotification('Error de conexión', 'error'); });
    }

    function handleDelete(e) {
        e.preventDefault();
        const id = $(this).data('id');
        Swal.fire({ title: '¿Eliminar?', text: 'Confirmar eliminación', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí' }).then(result => {
            if (result.isConfirmed) {
                fetch(ENDPOINTS.delete(id), { method: 'DELETE' })
                    .then(r => r.json())
                    .then(res => { if (res && res.success) { showNotification(res.message, 'success'); dataTable.ajax.reload(null, false); } else { showNotification(res.message || 'Error', 'error'); } })
                    .catch(err => { console.error(err); showNotification('Error al eliminar', 'error'); });
            }
        });
    }

    function handleEdit(e) {
        e.preventDefault();
        const id = $(this).data('id');
        const rowData = dataTable.row($(this).closest('tr')).data();
        if (!rowData) return;

        editingId = id;
        $('#modalTitle').text('Editar Movimiento');
        $('#cantidad').val(rowData.cantidad || '');
        $('#tipoMovimiento').val(rowData.tipoMovimiento ? rowData.tipoMovimiento.id : '');
        $('#almacenOrigen').val(rowData.almacenOrigen ? rowData.almacenOrigen.id : '');
        $('#almacenDestino').val(rowData.almacenDestino ? rowData.almacenDestino.id : '');
        $('#usuario').val(rowData.usuario ? rowData.usuario.id : (usuarioLogueadoId || ''));
        $('#usuarioDisplay').val(rowData.usuario ? rowData.usuario.nombre : (usuarioLogueadoNombre || ''));

        actualizarVisibilidadAlmacenes();
        movimientoModal.show();
    }

    function openModalForNew() {
        $('#modalTitle').text('Nuevo Movimiento');
        $('#formMovimiento')[0].reset();
        editingId = null;
        if (usuarioLogueadoId) {
            $('#usuario').val(usuarioLogueadoId);
            $('#usuarioDisplay').val(usuarioLogueadoNombre || '');
        }
        actualizarVisibilidadAlmacenes();
        movimientoModal.show();
    }

    function validateMovimientoForm(formData) {
        let hasErrors = false;
        $('.invalid-feedback').text('');
        $('.form-control').removeClass('is-invalid');

        const cantidad = formData.get('cantidad');
        const origen = formData.get('almacenOrigenId');
        const destino = formData.get('almacenDestinoId');
        const tipo = formData.get('tipoMovimientoId');
        const usuario = formData.get('usuarioId');

        if (!cantidad || isNaN(cantidad) || parseInt(cantidad) <= 0) {
            $('#cantidad').addClass('is-invalid');
            $('#cantidad-error').text('Cantidad inválida');
            hasErrors = true;
        }

        if (!tipo) {
            $('#tipoMovimiento').addClass('is-invalid');
            $('#tipoMovimiento-error').text('Selecciona tipo');
            hasErrors = true;
        }

        if (!usuario) {
            $('#usuarioDisplay').addClass('is-invalid');
            $('#usuario-error').text('Selecciona usuario');
            hasErrors = true;
        }

        if (tipo == tiposMovimiento.ingreso) {
            if (!destino) {
                $('#almacenDestino').addClass('is-invalid');
                $('#almacenDestino-error').text('Selecciona almacén destino');
                hasErrors = true;
            }
        } else if (tipo == tiposMovimiento.salida) {
            if (!origen) {
                $('#almacenOrigen').addClass('is-invalid');
                $('#almacenOrigen-error').text('Selecciona almacén origen');
                hasErrors = true;
            }
        } else if (tipo == tiposMovimiento.transferencia) {
            if (!origen) {
                $('#almacenOrigen').addClass('is-invalid');
                $('#almacenOrigen-error').text('Selecciona origen');
                hasErrors = true;
            }
            if (!destino) {
                $('#almacenDestino').addClass('is-invalid');
                $('#almacenDestino-error').text('Selecciona destino');
                hasErrors = true;
            }
            if (origen && destino && origen === destino) {
                $('#almacenDestino').addClass('is-invalid');
                $('#almacenDestino-error').text('Origen y destino no pueden ser iguales');
                hasErrors = true;
            }
        }

        return !hasErrors;
    }

    function formatDate(data) {
        if (!data) return '';
        try {
            const d = new Date(data);
            return d.toLocaleString();
        } catch (e) { return data; }
    }

    function showNotification(message, type = 'success') {
        const toastClass = type === 'success' ? 'text-bg-success' : 'text-bg-danger';
        const notification = $(`<div class="toast align-items-center ${toastClass} border-0" role="alert" aria-live="assertive" aria-atomic="true"><div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div></div>`);
        $('#notification-container').append(notification);
        const toast = new bootstrap.Toast(notification, { delay: 5000 }); toast.show();
    }

    function showLoading(show) {
        const overlayId = 'loading-overlay'; const $overlay = $(`#${overlayId}`);
        if (show) { if ($overlay.length === 0) { const spinner = $('<div>', { class: 'spinner-border text-primary', role: 'status' }).append($('<span>', { class: 'visually-hidden' }).text('Loading...')); const newOverlay = $('<div>', { id: overlayId, class: 'loading-overlay' }).append(spinner); $('body').append(newOverlay); } } else { $overlay.remove(); }
    }

});