package com.system.recksi.service.Implementaciones;

import com.system.recksi.DTO.EtapaProduccionDTO;
import com.system.recksi.repository.AlmacenRepository;
import com.system.recksi.service.Interfaces.ReportesService;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ReportesServiceImpl implements ReportesService {

    private final AlmacenRepository almacenRepository;

    public ReportesServiceImpl(AlmacenRepository almacenRepository) {
        this.almacenRepository = almacenRepository;
    }

    @Override
    public List<EtapaProduccionDTO> obtenerDatosEmbudo(List<Long> idsFlujo) {
        List<EtapaProduccionDTO> etapas = almacenRepository.obtenerEmbudoProduccion(idsFlujo);

        for (int i = 0; i < etapas.size(); i++) {
            EtapaProduccionDTO etapa = etapas.get(i);

            if (i == 0) {
                etapa.setIcono("bi-recycle");
                etapa.setColorBootstrap("warning");
                etapa.setEstado("Abastecido");
            }
            else if (i == etapas.size() - 1) {
                etapa.setIcono("bi-truck");
                etapa.setColorBootstrap("success");
                etapa.setEstado("Listo para Venta");
            }
            else {
                etapa.setIcono("bi-gear-wide-connected");
                etapa.setColorBootstrap("primary");
                etapa.setEstado("En Proceso");
            }

            if (etapa.getCantidadActual() <= etapa.getStockMinimo()) {
                etapa.setColorBootstrap("danger");

                if (i == 0) {
                    etapa.setEstado("¡Faltan Insumos!");
                } else if (i == etapas.size() - 1) {
                    etapa.setEstado("Stock Crítico");
                } else {
                    etapa.setEstado("Cuello de Botella");
                }
            }
        }

        return etapas;
    }
}
