package com.system.recksi.service.Interfaces;

import com.system.recksi.DTO.ProductoDTO;
import com.system.recksi.model.Producto;

import java.util.List;
import java.util.Optional;

public interface ProductoService {

    List<Producto> listarProductos();

    Producto guardarProducto(ProductoDTO producto);

    Producto actualizarProducto(Long id, ProductoDTO productoDTO);

    long contarProductos();

    Optional<Producto> obtenerProductoPorId(Long id);

    Optional<Producto> obtenerProductoPorNombre(String nombre);

    void eliminarProducto(Long id);

    Optional<Producto> cambiarEstadoProducto(Long id);

    long contarProductosActivos();

}

