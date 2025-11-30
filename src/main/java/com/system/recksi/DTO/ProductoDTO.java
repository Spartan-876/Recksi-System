package com.system.recksi.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public class ProductoDTO {

    @NotEmpty(message = "El nombre no puede estar vacío")
    private String nombre;

    @NotBlank(message = "La descripcion es obligatoria")
    @Size(min = 2, max = 150, message = "La descripcion debe tener entre 2 y 150 caracteres")
    private String descripcion;

    public ProductoDTO() {
    }

    public ProductoDTO(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
