package com.system.recksi.service.Interfaces;

import com.system.recksi.DTO.FiltroMovimentoDTO;
import com.system.recksi.DTO.MovimientoInventarioDTO;
import com.system.recksi.model.MovimientoInventario;

import java.util.List;

public interface MovimientoInventarioService {

    List<MovimientoInventario> listarMovimientosInventario();

    List<MovimientoInventario> buscarMovimientoInventario(FiltroMovimentoDTO filtros);

    MovimientoInventario guardarMovimientoInventario(MovimientoInventarioDTO movimientoInventario);

    MovimientoInventario actualizarMovimientoInventario(Long id, MovimientoInventarioDTO movimientoInventario); 

    void eliminarMovimientoInventario(Long id);

    Integer calcularStockActual(Long almacenid);

    Long contarMovimientosInventario();

}
