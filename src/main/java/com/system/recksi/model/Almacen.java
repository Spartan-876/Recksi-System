package com.system.recksi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "almacen")
public class Almacen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String nombre;

    @NotNull(message = "El stock actual es obligatorio")
    private Integer stockActual;

    @NotNull(message = "El stock minimo es obligatorio")
    private Integer stockMinimo;

    @NotNull(message = "El producto asociado es obligatorio")
    @ManyToOne(optional = false)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @NotNull
    private Integer estado = 1;

    public Almacen() {
    }

    public Almacen(String nombre, Integer stockActual, Integer stockMinimo, Producto producto) {
        this.nombre = nombre;
        this.stockActual = stockActual;
        this.stockMinimo = stockMinimo;
        this.producto = producto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getStockActual() {
        return stockActual;
    }

    public void setStockActual(Integer stockActual) {
        this.stockActual = stockActual;
    }

    public Integer getStockMinimo() {
        return stockMinimo;
    }

    public void setStockMinimo(Integer stockMinimo) {
        this.stockMinimo = stockMinimo;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Integer getEstado() {
        return estado;
    }

    public void setEstado(Integer estado) {
        this.estado = estado;
    }

    public void aumentarStock(Integer cantidad) {
        if (cantidad == null || cantidad <= 0){
            throw new IllegalArgumentException("La cantidad a aumentar debe ser positiva");
        }
        this.stockActual = (this.stockActual == null ? 0 : this.stockActual) + cantidad;
    }

    public void disminuirStock(Integer cantidad) {
        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad a disminuir debe ser positiva");
        }

        if (this.stockActual == null) this.stockActual = 0;

        if (this.stockActual < cantidad) {
            throw new IllegalStateException(
                    "Stock insuficiente en almacén '" + this.nombre +
                            "'. Actual: " + this.stockActual + ", Solicitado: " + cantidad
            );
        }

        this.stockActual -= cantidad;
    }

}
