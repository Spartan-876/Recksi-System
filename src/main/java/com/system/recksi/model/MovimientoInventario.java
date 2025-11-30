package com.system.recksi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimiento_inventario")
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    private TipoMovimiento tipoMovimiento;

    @NotNull
    private Integer cantidad;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @ManyToOne(optional = true)
    @JoinColumn(name = "almacen_origen_id", nullable = true)
    private Almacen almacenOrigen;

    @ManyToOne(optional = true)
    @JoinColumn(name = "almacen_destino_id", nullable = true)
    private Almacen almacenDestino;

    @NotNull
    @ManyToOne
    private Usuario usuario;

    @NotNull
    private Integer estado = 1;

    public MovimientoInventario() {
    }

    public MovimientoInventario(TipoMovimiento tipoMovimiento, Integer cantidad, Almacen almacenOrigen,
            Almacen almacenDestino, Usuario usuario) {
        this.tipoMovimiento = tipoMovimiento;
        this.cantidad = cantidad;
        this.fechaHora = LocalDateTime.now();
        this.almacenOrigen = almacenOrigen;
        this.almacenDestino = almacenDestino;
        this.usuario = usuario;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoMovimiento getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(TipoMovimiento tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public Almacen getAlmacenOrigen() {
        return almacenOrigen;
    }

    public void setAlmacenOrigen(Almacen almacenOrigen) {
        this.almacenOrigen = almacenOrigen;
    }

    public Almacen getAlmacenDestino() {
        return almacenDestino;
    }

    public void setAlmacenDestino(Almacen almacenDestino) {
        this.almacenDestino = almacenDestino;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Integer getEstado() {
        return estado;
    }

    public void setEstado(Integer estado) {
        this.estado = estado;
    }
}
