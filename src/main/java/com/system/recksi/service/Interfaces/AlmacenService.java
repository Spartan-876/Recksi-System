package com.system.recksi.service.Interfaces;

import com.system.recksi.DTO.AlmacenDTO;
import com.system.recksi.model.Almacen;

import java.util.List;

public interface AlmacenService {

    List<Almacen> listarAlmacenes();

    Almacen guardarAlmacen(AlmacenDTO almacen);

    Almacen actualizarAlmacen(Long id, AlmacenDTO almacen);

    void eliminarAlmacen(Long id);

    Almacen obtenerAlmacenPorId(Long id);

    long contarAlmacenes();

    void aumentarStock(Long almacenId, Integer cantidad);

    void disminuirStock(Long almacenId, Integer cantidad);

}
