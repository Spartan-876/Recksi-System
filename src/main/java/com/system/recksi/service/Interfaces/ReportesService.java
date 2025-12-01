package com.system.recksi.service.Interfaces;

import com.system.recksi.DTO.EtapaProduccionDTO;

import java.util.List;

public interface ReportesService {

    List<EtapaProduccionDTO> obtenerDatosEmbudo(List<Long> idsFlujo);


}
