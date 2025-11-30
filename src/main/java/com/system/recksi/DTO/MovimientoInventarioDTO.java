package com.system.recksi.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class MovimientoInventarioDTO {

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    private Integer cantidad;

    // Los almacenes pueden ser opcionales dependiendo del tipo de movimiento
    private Long almacenOrigenId;

    private Long almacenDestinoId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private Long tipoMovimientoId;
    
    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    public MovimientoInventarioDTO() {
    }

    public MovimientoInventarioDTO(Long tipoMovimientoId) {
        this.tipoMovimientoId = tipoMovimientoId;
    }

    public MovimientoInventarioDTO(Integer cantidad, Long almacenOrigenId, Long almacenDestinoId, Long tipoMovimientoId,
            Long usuarioId) {
        this.cantidad = cantidad;
        this.almacenOrigenId = almacenOrigenId;
        this.almacenDestinoId = almacenDestinoId;
        this.tipoMovimientoId = tipoMovimientoId;
        this.usuarioId = usuarioId;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Long getAlmacenOrigenId() {
        return almacenOrigenId;
    }

    public void setAlmacenOrigenId(Long almacenOrigenId) {
        this.almacenOrigenId = almacenOrigenId;
    }

    public Long getAlmacenDestinoId() {
        return almacenDestinoId;
    }

    public void setAlmacenDestinoId(Long almacenDestinoId) {
        this.almacenDestinoId = almacenDestinoId;
    }

    public Long getTipoMovimientoId() {
        return tipoMovimientoId;
    }

    public void setTipoMovimientoId(Long tipoMovimientoId) {
        this.tipoMovimientoId = tipoMovimientoId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}
