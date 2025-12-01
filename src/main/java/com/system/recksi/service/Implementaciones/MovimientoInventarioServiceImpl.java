package com.system.recksi.service.Implementaciones;

import com.system.recksi.DTO.FiltroMovimentoDTO;
import com.system.recksi.DTO.MovimientoInventarioDTO;
import com.system.recksi.model.Almacen;
import com.system.recksi.model.MovimientoInventario;
import com.system.recksi.model.TipoMovimientoTipo;
import com.system.recksi.repository.AlmacenRepository;
import com.system.recksi.repository.DAO.StockDao;
import com.system.recksi.repository.MovimientoInventarioRepository;
import com.system.recksi.repository.TipoMovimientoRepository;
import com.system.recksi.repository.UsuarioRepository;
import com.system.recksi.service.Interfaces.MovimientoInventarioService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class MovimientoInventarioServiceImpl implements MovimientoInventarioService {

    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final AlmacenRepository almacenRepository;
    private final TipoMovimientoRepository tipoMovimientoRepository;
    private final UsuarioRepository usuarioRepository;
    private final StockDao stockDao;

    public MovimientoInventarioServiceImpl(MovimientoInventarioRepository movimientoInventarioRepository,
            AlmacenRepository almacenRepository, TipoMovimientoRepository tipoMovimientoRepository,
            UsuarioRepository usuarioRepository, StockDao stockDao) {
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.almacenRepository = almacenRepository;
        this.tipoMovimientoRepository = tipoMovimientoRepository;
        this.usuarioRepository = usuarioRepository;
        this.stockDao = stockDao;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoInventario> listarMovimientosInventario() {
        return movimientoInventarioRepository.findAllByEstadoNot(2);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoInventario> buscarMovimientoInventario(FiltroMovimentoDTO filtro) {

        LocalDateTime inicio = filtro.getFechaInicio() != null ? filtro.getFechaInicio().atStartOfDay() : null;
        LocalDateTime fin = (filtro.getFechaFin() != null ? filtro.getFechaFin() : LocalDate.now())
                .atTime(LocalTime.MAX);

        return movimientoInventarioRepository.buscarConFiltros(
                inicio,
                fin,
                filtro.getTipoMovimientoId(),
                filtro.getUsuarioId(),
                filtro.getAlmacenId());
    }

    @Override
    @Transactional
    public MovimientoInventario guardarMovimientoInventario(MovimientoInventarioDTO movimientoInventario) {

        TipoMovimientoTipo reglas = TipoMovimientoTipo.buscarPorId(movimientoInventario.getTipoMovimientoId());

        if (reglas.isRequiereOrigen() && movimientoInventario.getAlmacenOrigenId() == null) {
            throw new IllegalArgumentException("Este tipo de movimiento requiere un almacén de origen.");
        }
        if (!reglas.isRequiereOrigen() && movimientoInventario.getAlmacenOrigenId() != null) {
            throw new IllegalArgumentException("Este tipo de movimiento NO debe tener origen.");
        }

        if (reglas.isRequiereDestino() && movimientoInventario.getAlmacenDestinoId() == null) {
            throw new IllegalArgumentException("Este tipo de movimiento requiere un almacén de destino.");
        }

        if (!reglas.isRequiereDestino() && movimientoInventario.getAlmacenDestinoId() != null) {
            throw new IllegalArgumentException("Este tipo de movimiento NO debe tener destino.");
        }

        MovimientoInventario nuevoMovimiento = new MovimientoInventario();

        nuevoMovimiento.setCantidad(movimientoInventario.getCantidad());
        nuevoMovimiento.setFechaHora(LocalDateTime.now());
        nuevoMovimiento.setEstado(1);

        if (movimientoInventario.getAlmacenOrigenId() != null) {
            Almacen origen = almacenRepository.findById(movimientoInventario.getAlmacenOrigenId())
                    .orElseThrow(() -> new EntityNotFoundException("Almacén Origen no encontrado"));

            origen.disminuirStock(movimientoInventario.getCantidad());
            almacenRepository.save(origen);

            nuevoMovimiento.setAlmacenOrigen(origen);
        }

        if (movimientoInventario.getAlmacenDestinoId() != null) {
            Almacen destino = almacenRepository.findById(movimientoInventario.getAlmacenDestinoId())
                    .orElseThrow(() -> new EntityNotFoundException("Almacén Destino no encontrado"));

            destino.aumentarStock(movimientoInventario.getCantidad());
            almacenRepository.save(destino);

            nuevoMovimiento.setAlmacenDestino(destino);
        }

        nuevoMovimiento.setTipoMovimiento(
                tipoMovimientoRepository.getReferenceById(movimientoInventario.getTipoMovimientoId().longValue()));

        nuevoMovimiento.setUsuario(usuarioRepository.findById(movimientoInventario.getUsuarioId().longValue())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado")));

        // Comentario opcional
        nuevoMovimiento.setComentario(movimientoInventario.getComentario());

        return movimientoInventarioRepository.save(nuevoMovimiento);
    }

    @Override
    @Transactional
    public MovimientoInventario actualizarMovimientoInventario(Long id, MovimientoInventarioDTO movimientoInventario) {

        this.eliminarMovimientoInventario(id);

        return this.guardarMovimientoInventario(movimientoInventario);
    }

    @Override
    @Transactional
    public void eliminarMovimientoInventario(Long id) {
        MovimientoInventario movimiento = movimientoInventarioRepository.findById(id.longValue())
                .orElseThrow(() -> new EntityNotFoundException("Movimiento no encontrado"));

        if (movimiento.getEstado() == 2) {
            throw new IllegalStateException("El movimiento ya fue eliminado previamente.");
        }

        if (movimiento.getAlmacenOrigen() != null) {
            Almacen origen = movimiento.getAlmacenOrigen();
            origen.aumentarStock(movimiento.getCantidad());
            almacenRepository.save(origen);
        }

        if (movimiento.getAlmacenDestino() != null) {
            Almacen destino = movimiento.getAlmacenDestino();
            destino.disminuirStock(movimiento.getCantidad());
            almacenRepository.save(destino);
        }

        movimiento.setEstado(2);
        movimientoInventarioRepository.save(movimiento);
    }

    @Override
    public Integer calcularStockActual(Long almacenid) {
        Integer totalEntradas = stockDao.sumarEntradas(almacenid);

        Integer totalSalidas = stockDao.sumarSalidas(almacenid);

        return totalEntradas - totalSalidas;
    }

    @Override
    public Long contarMovimientosInventario() {
        return movimientoInventarioRepository.countByEstadoNot(2);
    }
}
