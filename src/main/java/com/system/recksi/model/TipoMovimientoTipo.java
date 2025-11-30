package com.system.recksi.model;

public enum TipoMovimientoTipo {

    INGRESO(1L, false, true),
    SALIDA(2L, true, false),
    TRANSFERENCIA(3L, true, true);

    private final Long id;
    private final boolean requiereOrigen;
    private final boolean requiereDestino;

    TipoMovimientoTipo(Long id, boolean requiereOrigen, boolean requiereDestino) {
        this.id = id;
        this.requiereOrigen = requiereOrigen;
        this.requiereDestino = requiereDestino;
    }

    public static TipoMovimientoTipo buscarPorId(Long id) {
        for (TipoMovimientoTipo tipo : values()) {
            if (tipo.id.equals(id)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("ID de tipo de movimiento no válido o no nativo: " + id);
    }

    public boolean isRequiereOrigen() { return requiereOrigen; }
    public boolean isRequiereDestino() { return requiereDestino; }
}
