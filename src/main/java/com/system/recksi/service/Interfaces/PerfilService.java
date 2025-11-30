package com.system.recksi.service.Interfaces;

import com.system.recksi.model.Perfil;
import com.system.recksi.model.Opcion;

import java.util.List;
import java.util.Optional;

public interface PerfilService {
    List<Perfil> listarPerfilesActivos();

    List<Perfil> listarTodosLosPerfiles();

    Perfil guardarPerfil(Perfil perfil);

    Optional<Perfil> obtenerPerfilPorId(Long id);

    Optional<Perfil> cambiarEstadoPerfil(Long id);

    List<Opcion> listarTodasLasOpciones();

    void eliminarPerfil(Long id);
}