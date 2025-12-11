package com.system.recksi.service.Implementaciones;

import com.system.recksi.DTO.ProductoDTO;
import com.system.recksi.model.Producto;
import com.system.recksi.repository.AlmacenRepository;
import com.system.recksi.repository.ProductoRepository;
import com.system.recksi.service.Interfaces.ProductoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final AlmacenRepository almacenRepository;

    public ProductoServiceImpl(ProductoRepository productoRepository, AlmacenRepository almacenRepository) {
        this.productoRepository = productoRepository;
        this.almacenRepository = almacenRepository;
    }

    @Transactional(readOnly = true)
    public List<Producto> listarProductos() {
        return productoRepository.findAllByEstadoNot(2);
    }

    @Transactional
    public Producto guardarProducto(ProductoDTO producto) {
        try {
            if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre es obligatorio");
            }

            if (productoRepository.existsByNombreIgnoreCaseAndEstadoNot(producto.getNombre().trim(), 2)) {
                throw new IllegalArgumentException("Ya existe un producto activo con el nombre: " + producto.getNombre());
            }

            if (producto.getDescripcion() == null || producto.getDescripcion().trim().isEmpty()) {
                throw new IllegalArgumentException("La descripción es obligatoria");
            }

            Producto nuevoProducto = new Producto();
            nuevoProducto.setNombre(producto.getNombre().trim());
            nuevoProducto.setDescripcion(producto.getDescripcion().trim());
            nuevoProducto.setEstado(1);

            return productoRepository.save(nuevoProducto);

        } catch (Exception e) {
            throw new IllegalArgumentException("Error al guardar el producto: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Producto actualizarProducto(Long id, ProductoDTO productoDTO) {
        try {
            Producto productoExistente = productoRepository.findById(id.longValue())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado con ID: " + id));

            if (!productoExistente.getNombre().equals(productoDTO.getNombre())
                    && productoRepository.existsByNombreAndEstadoNot(productoDTO.getNombre(),2)) {
                throw new IllegalArgumentException("Ya existe otro producto con el nombre: " + productoDTO.getNombre());
            }

            productoExistente.setNombre(productoDTO.getNombre().trim());
            productoExistente.setDescripcion(productoDTO.getDescripcion().trim());

            return productoRepository.save(productoExistente);

        } catch (Exception e) {
            throw new IllegalArgumentException("Error al actualizar el producto: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long contarProductos() {
        return productoRepository.countByEstadoNot(2);
    }

    @Transactional(readOnly = true)
    public Optional<Producto> obtenerProductoPorId(Long id) {
        if (id == null || id <= 0) {
            return Optional.empty();
        }
        return productoRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Producto> obtenerProductoPorNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return Optional.empty();
        }
        return productoRepository.findByNombreAndEstadoNot(nombre.trim().toLowerCase(),2);
    }

    @Transactional
    public void eliminarProducto(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        Integer stockTotal = almacenRepository.obtenerStockTotalPorProducto(id);

        if (stockTotal > 0) {
            throw new IllegalStateException("No se puede eliminar: El producto tiene " + stockTotal + " unidades en stock. Vacíe el inventario primero.");
        }
        producto.setEstado(2);
        productoRepository.save(producto);
    }

    @Transactional
    public Optional<Producto> cambiarEstadoProducto(Long id) {
        if (id == null || id <= 0) {
            return Optional.empty();
        }

        return obtenerProductoPorId(id).map(producto -> {
            int nuevoEstado = (producto.getEstado() == 1) ? 0 : 1;
            if (nuevoEstado == 0) {
                boolean tieneStock = almacenRepository.existsByProductoIdAndStockActualGreaterThan(id, 0);

                if (tieneStock) {
                    throw new IllegalStateException("No se puede inactivar: El producto tiene stock físico en almacenes.");
                }
            }
            producto.setEstado(nuevoEstado);
            return productoRepository.save(producto);
        });
    }

    @Override
    public long contarProductosActivos() {
        return productoRepository.countByEstadoNot(2);
    }
}
