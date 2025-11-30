package com.system.recksi.service.Implementaciones;

import com.system.recksi.DTO.AlmacenDTO;
import com.system.recksi.model.Almacen;
import com.system.recksi.model.Producto;
import com.system.recksi.repository.AlmacenRepository;
import com.system.recksi.repository.ProductoRepository;
import com.system.recksi.service.Interfaces.AlmacenService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlmacenServiceImpl implements AlmacenService {

    private final AlmacenRepository almacenRepository;
    private final ProductoRepository productoRepository;

    public AlmacenServiceImpl(AlmacenRepository almacenRepository, ProductoRepository productoRepository) {
        this.almacenRepository = almacenRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Almacen> listarAlmacenes() {
        return almacenRepository.findAllByEstadoNot(2);
    }

    @Override
    public Almacen guardarAlmacen(AlmacenDTO almacen) {
        try {
            String nombreLimpio = almacen.getNombre().trim();

            if (almacenRepository.existsByNombreIgnoreCaseAndEstadoNot(nombreLimpio, 2)) {
                throw new IllegalArgumentException("Ya existe un almacén con el nombre: " + nombreLimpio);
            }

            Almacen nuevoAlmacen = new Almacen();
            nuevoAlmacen.setNombre(nombreLimpio);
            nuevoAlmacen.setStockMinimo(almacen.getStockMinimo());
            nuevoAlmacen.setStockActual(0);

            Producto producto = productoRepository.findById(almacen.getProductoId().longValue())
                    .orElseThrow(() -> new EntityNotFoundException("El producto asociado no existe"));
            nuevoAlmacen.setProducto(producto);

            return almacenRepository.save(nuevoAlmacen);

        }catch (Exception e){
            throw new IllegalArgumentException("Error al guardar el almacen: "+e.getMessage());
        }
    }

    @Override
    public Almacen actualizarAlmacen(Long id,AlmacenDTO almacen) {
        try {
            Almacen almacenActual = almacenRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado con ID: " + id));

            if (almacen.getNombre() != null && !almacen.getNombre().isBlank()) {
                String nuevoNombre = almacen.getNombre().trim();

                if (!almacenActual.getNombre().equalsIgnoreCase(nuevoNombre)) {
                    if (almacenRepository.existsByNombreIgnoreCaseAndIdNotAndEstadoNot(nuevoNombre, id, 2)) {
                        throw new IllegalArgumentException("Ya existe otro almacén con el nombre: " + nuevoNombre);
                    }
                    almacenActual.setNombre(nuevoNombre);
                }
            }

            if (almacen.getStockMinimo() != null) {
                if (almacen.getStockMinimo() < 0){
                    throw new IllegalArgumentException("Stock mínimo negativo");
                }
                almacenActual.setStockMinimo(almacen.getStockMinimo());
            }

            if (almacen.getProductoId() != null) {
                if (!almacenActual.getProducto().getId().equals(almacen.getProductoId())) {
                    if (almacenActual.getStockActual() > 0) {
                        throw new IllegalStateException("No se puede cambiar el producto: el almacén aún tiene existencias.");
                    }

                    Producto nuevoProducto = productoRepository.findById(almacen.getProductoId().longValue())
                            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));
                    almacenActual.setProducto(nuevoProducto);
                }
            }

            return almacenRepository.save(almacenActual);

        }catch (Exception e){
            throw new IllegalArgumentException("Error al actualizar el almacen: "+e.getMessage());
        }
    }

    @Override
    public void eliminarAlmacen(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("El id del almacen debe ser valido");
        }

        Almacen almacen = almacenRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado con ID: " + id));

        if (almacen.getStockActual() > 0) {
            throw new IllegalStateException("No se puede eliminar el almacén porque tiene stock fisico existente. Vacíelo primero.");
        }

        almacen.setEstado(2);
        almacenRepository.save(almacen);
    }

    @Override
    public Almacen obtenerAlmacenPorId(Long id) {
        return almacenRepository.findById(id).orElse(null);
    }

    @Override
    public long contarAlmacenes() {
        return almacenRepository.countByEstadoNot(2);
    }

    @Transactional
    public void aumentarStock(Long almacenId, Integer cantidad) {

        if (almacenId == null) throw new IllegalArgumentException("ID inválido");

        Almacen almacen = almacenRepository.findById(almacenId)
                .orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado"));

        almacen.aumentarStock(cantidad);

        almacenRepository.save(almacen);
    }

    @Transactional
    public void disminuirStock(Long almacenId, Integer cantidad) {

        if (almacenId == null || almacenId <= 0) {
            throw new IllegalArgumentException("El ID del almacén debe ser válido");
        }

        Almacen almacen = almacenRepository.findById(almacenId)
                .orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado con ID: " + almacenId));

        almacen.disminuirStock(cantidad);

        almacenRepository.save(almacen);
    }

}
