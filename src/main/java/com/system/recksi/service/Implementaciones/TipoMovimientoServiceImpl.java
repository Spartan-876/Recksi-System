package com.system.recksi.service.Implementaciones;

import com.system.recksi.model.TipoMovimiento;
import com.system.recksi.repository.TipoMovimientoRepository;
import com.system.recksi.service.Interfaces.TipoMovimientoService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TipoMovimientoServiceImpl implements TipoMovimientoService {

    private final TipoMovimientoRepository tipoMovimientoRepository;

    public TipoMovimientoServiceImpl(TipoMovimientoRepository tipoMovimientoRepository) {
        this.tipoMovimientoRepository = tipoMovimientoRepository;
    }

    @Override
    public List<TipoMovimiento> listarTipoMovimientos() {
        return tipoMovimientoRepository.findAll();
    }
}
