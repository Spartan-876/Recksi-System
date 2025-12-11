package com.system.recksi.service.Implementaciones;

import com.system.recksi.model.Perfil;
import com.system.recksi.model.Opcion;
import com.system.recksi.repository.PerfilRepository;
import com.system.recksi.repository.OpcionRepository;
import com.system.recksi.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;

    public PerfilServiceImpl(PerfilRepository perfilRepository, OpcionRepository opcionRepository, UsuarioRepository usuarioRepository) {
        this.perfilRepository = perfilRepository;
        this.opcionRepository = opcionRepository;
        this.usuarioRepository = usuarioRepository;
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
        return perfilRepository.findById(id).map(perfil -> {
            if (perfil.getEstado() == 1) {
                perfil.setEstado(0);
            } else if (perfil.getEstado() == 0) {
                perfil.setEstado(1);
            }
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
        Perfil perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("El perfil con ID " + id + " no existe."));

        long usuariosActivos = usuarioRepository.countByPerfilAndEstado(perfil, 1);
        if (usuariosActivos > 0) {
            throw new IllegalStateException("No se puede eliminar el perfil porque está asignado a " + usuariosActivos + " usuario(s) activo(s).");
        }

        perfil.setEstado(2);
        perfilRepository.save(perfil);
    }
}