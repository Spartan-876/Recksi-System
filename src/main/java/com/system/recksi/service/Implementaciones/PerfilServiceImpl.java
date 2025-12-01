package com.system.recksi.service.Implementaciones;

import com.system.recksi.model.Perfil;
import com.system.recksi.model.Opcion;
import com.system.recksi.repository.PerfilRepository;
import com.system.recksi.repository.OpcionRepository;
import com.system.recksi.service.Interfaces.PerfilService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class PerfilServiceImpl implements PerfilService {

    private final PerfilRepository perfilRepository;
    private final OpcionRepository opcionRepository;

    public PerfilServiceImpl(PerfilRepository perfilRepository, OpcionRepository opcionRepository) {
        this.perfilRepository = perfilRepository;
        this.opcionRepository = opcionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Perfil> listarPerfilesActivos() {
        return perfilRepository.findByEstadoTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Perfil> listarTodosLosPerfiles() {
        return perfilRepository.findAll();
    }

    @Override
    @Transactional
    public Perfil guardarPerfil(Perfil perfil) {
        if (perfil.getId() != null) {
            Optional<Perfil> existente = perfilRepository.findById(perfil.getId());
            if (existente.isPresent()) {
                Perfil pExist = existente.get();
                if (perfil.getOpciones() == null || perfil.getOpciones().isEmpty()) {
                    perfil.setOpciones(pExist.getOpciones());
                } else {
                    Set<Opcion> opcionesGestionadas = new java.util.HashSet<>();
                    for (Opcion o : perfil.getOpciones()) {
                        if (o != null && o.getId() != null) {
                            opcionRepository.findById(o.getId()).ifPresent(opcionesGestionadas::add);
                        }
                    }
                    perfil.setOpciones(opcionesGestionadas);
                }
            }
        }

        return perfilRepository.save(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Perfil> obtenerPerfilPorId(Long id) {
        return perfilRepository.findById(id.longValue());
    }

    @Override
    @Transactional
    public Optional<Perfil> cambiarEstadoPerfil(Long id) {
        return perfilRepository.findById(id.longValue()).map(perfil -> {
            perfil.setEstado(!perfil.isEstado());
            return perfilRepository.save(perfil);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Opcion> listarTodasLasOpciones() {
        return opcionRepository.findAll();
    }

    @Override
    @Transactional
    public void eliminarPerfil(Long id) {
        perfilRepository.deleteById(id.longValue());
    }
}