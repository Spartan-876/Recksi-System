
$(document).ready(function () {

    let dataTableMovimientoInventario;
    let miGraficoMovimientoInventario;

    const ENDPOINTS = {
        movimiento_inventario_listar: `/movimientoInventario/api/listar`,
        movimiento_inventario_filtro: `/movimientoInventario/api/buscar`,
    };

    // Inicializaciones
    initializeDataTableMovimientoInventario();
    graficoMovimientoInventario();
    loadSelectsMovimientos();
    setupEventListeners();

    function setupEventListeners() {
        $('#btnBuscarFiltrado').on('click', filtrarMovimientoInventario);
        $('#btnLimpiarFiltro').on('click', limpiarFiltroMovimientoInventario);
    }

    // Pagina de Kardex movimiento de inventario

    function initializeDataTableMovimientoInventario() {
        dataTableMovimientoInventario = $('#tablaMovimientos').DataTable({
            responsive: true,
            processing: true,
            deferRender: true,
            ajax: {
                url: ENDPOINTS.movimiento_inventario_listar,
                dataSrc: function (json) {
                    if (json.success) {
                        actualizarDatosGraficoMovimientoInventario(json.data);
                        return json.data;
                    } else {
                        return [];
                    }
                }
            },
            columns: [
                {
                    data: 'id', render: function (data, type, row) {
                        if (type === 'display') {
                            return `#MOV-${data}`;
                        }
                        return data;
                    }
                },
                { data: 'fechaHora', render: (data) => data ? new Date(data).toLocaleString() : '' },
                {
                    data: 'tipoMovimiento',
                    render: function (data) {
                        if (!data || !data.nombre) return '';
                        let nombre = data.nombre.toUpperCase();
                        let claseBadge = 'bg-secondary';
                        if (nombre.includes('INGRESO')) {
                            claseBadge = 'bg-success';
                        } else if (nombre.includes('SALIDA')) {
                            claseBadge = 'bg-danger';
                        } else if (nombre.includes('TRANSFERENCIA')) {
                            claseBadge = 'bg-warning text-dark';
                        }
                        return `<span class="badge ${claseBadge}">${data.nombre}</span>`;
                    }
                },
                { data: 'cantidad' },
                { data: 'almacenOrigen', render: (d) => d ? d.nombre : '' },
                { data: 'almacenDestino', render: (d) => d ? d.nombre : '' },
                { data: 'usuario', render: (d) => d ? d.nombre : '' },
                { data: 'comentario', render: (d) => d ? (d.length > 80 ? d.substring(0, 80) + '...' : d) : '' }
            ],
            columnDefs: [
                { responsivePriority: 1, targets: 1 },
                { responsivePriority: 2, targets: 2 },
                { responsivePriority: 3, targets: 3 },
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
                    text: '<i class="bi bi-file-earmark-excel"></i> Exportar a Excel',
                    title: 'Reporte de movimientos de inventario',
                    className: 'btn btn-success',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4, 5, 6, 7],
                        modifier: {
                            page: 'all'
                        }
                    }
                },
                {
                    extend: 'pdfHtml5',
                    text: '<i class="bi bi-file-earmark-pdf"></i> Exportar a PDF',
                    title: 'Reporte de movimientos de inventario',
                    className: 'btn btn-danger',
                    orientation: 'landscape',
                    pageSize: 'A4',
                    exportOptions: {
                        columns: [0, 1, 2, 3, 4, 5, 6, 7],
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
                        columns: [0, 1, 2, 3, 4, 5, 6, 7],
                        modifier: {
                            page: 'all'
                        }
                    },
                    customize: function (win) {
                        $(win.document.body)
                            .css('font-size', '10pt')
                            .prepend('<h3 style="text-align:center;">Reporte de movimientos de inventario</h3>');
                    }
                },
                {
                    extend: 'colvis',
                    text: '<i class="bi bi-eye"></i> Mostrar/Ocultar',
                    className: 'btn btn-secondary'
                }
            ]
        })
    }

    function loadSelectsMovimientos() {
        const $fAlmacen = $('#fAlmacen');
        $fAlmacen.empty();
        $fAlmacen.append($('<option>', { value: '', text: 'Todos' }));
        fetch('/almacen/api/listar')
            .then(r => r.json())
            .then(res => {
                const items = res && res.data ? res.data : [];
                items.forEach(a => {
                    $fAlmacen.append($('<option>', { value: a.id, text: a.nombre }));
                });
            }).catch(() => { });

        const $fTipo = $('#fTipoMovimiento');
        $fTipo.empty();
        $fTipo.append($('<option>', { value: '', text: 'Todos' }));
        fetch('/movimientoInventario/api/TipoMovimiento')
            .then(r => r.json())
            .then(res => {
                const items = res && res.data ? res.data : [];
                items.forEach(t => {
                    $fTipo.append($('<option>', { value: t.id, text: t.nombre }));
                });
            }).catch(() => { });

        const $fUsuario = $('#fUsuario');
        $fUsuario.empty();
        $fUsuario.append($('<option>', { value: '', text: 'Todos' }));
        fetch('/usuarios/api/listar')
            .then(r => r.json())
            .then(res => {
                const items = res && res.data ? res.data : [];
                items.forEach(u => {
                    $fUsuario.append($('<option>', { value: u.id, text: u.nombre }));
                });
            }).catch(() => { });
    }

    function filtrarMovimientoInventario() {
        clearFieldErrors();

        const inicio = $('#fechaInicio').val();
        const fin = $('#fechaFin').val();
        const almacenId = $('#fAlmacen').val();
        const tipoMovimientoId = $('#fTipoMovimiento').val();
        const usuarioId = $('#fUsuario').val();
        let hayErrores = false;

        if (!inicio) {
            showFieldError('fechaInicio', 'Debes seleccionar una fecha de inicio.');
            hayErrores = true;
        }

        if (!fin) {
            showFieldError('fechaFin', 'Debes seleccionar una fecha de fin.');
            hayErrores = true;
        }

        if (hayErrores) return;

        if (inicio > fin) {
            showNotification('La fecha fin debe ser después del inicio', 'error');
            return;
        }

        const payload = {
            fechaInicio: inicio || null,
            fechaFin: fin || null,
            almacenId: almacenId ? parseInt(almacenId) : null,
            tipoMovimientoId: tipoMovimientoId ? parseInt(tipoMovimientoId) : null,
            usuarioId: usuarioId ? parseInt(usuarioId) : null
        };

        fetch(ENDPOINTS.movimiento_inventario_filtro, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(r => r.json())
            .then(res => {
                if (res && res.success) {
                    dataTableMovimientoInventario.clear();
                    dataTableMovimientoInventario.rows.add(res.data);
                    dataTableMovimientoInventario.draw();
                    actualizarDatosGraficoMovimientoInventario(res.data);
                } else {
                    showNotification(res.message || 'Error al filtrar', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showNotification('Error de conexión', 'error');
            });
    }

    function limpiarFiltroMovimientoInventario() {
        $('#fechaInicio').val('');
        $('#fechaFin').val('');
        $('#fAlmacen').val('');
        $('#fTipoMovimiento').val('');
        $('#fUsuario').val('');
        clearFieldErrors();

        dataTableMovimientoInventario.ajax.url(ENDPOINTS.movimiento_inventario_listar).load();
    }

    function graficoMovimientoInventario() {
        const ctx = document.getElementById('graficoVentas').getContext('2d');
        miGraficoMovimientoInventario = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Ingresos',
                        data: [],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Salidas',
                        data: [],
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) { return value + 'ud'; }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Ingresos y Salidas por Día'
                    }
                }
            }
        });
    }

    function actualizarDatosGraficoMovimientoInventario(datos) {
        const datosPorFecha = {};

        datos.forEach(d => {
            if (!d.tipoMovimiento || !d.tipoMovimiento.nombre) return;

            const fecha = new Date(d.fechaHora);
            const fechaStr = fecha.toLocaleDateString();

            if (!datosPorFecha[fechaStr]) {
                datosPorFecha[fechaStr] = { ingresos: 0, salidas: 0 };
            }

            const tipoNombre = d.tipoMovimiento.nombre.toLowerCase();
            if (tipoNombre.includes('ingreso')) {
                datosPorFecha[fechaStr].ingresos += d.cantidad || 0;
            } else if (tipoNombre.includes('salida')) {
                datosPorFecha[fechaStr].salidas += d.cantidad || 0;
            }
        });

        const fechas = Object.keys(datosPorFecha).sort();
        const ingresos = fechas.map(f => datosPorFecha[f].ingresos);
        const salidas = fechas.map(f => datosPorFecha[f].salidas);

        miGraficoMovimientoInventario.data.labels = fechas;
        miGraficoMovimientoInventario.data.datasets[0].data = ingresos;
        miGraficoMovimientoInventario.data.datasets[1].data = salidas;

        miGraficoMovimientoInventario.update();
    }

    //Notificaciones y errores

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

    function showFieldError(fieldName, message) {
        const field = $(`#${fieldName}`);
        const errorDiv = $(`#${fieldName}-error`);

        field.addClass('is-invalid');
        errorDiv.text(message).show();
    }

    function clearFieldErrors() {
        $('.form-control').removeClass('is-invalid');
        $('.form-select').removeClass('is-invalid');
        $('.invalid-feedback').text('');
        $('.invalid-feedback').removeClass('d-block');
        $('.invalid-feedback').css('display', '');
    }

});