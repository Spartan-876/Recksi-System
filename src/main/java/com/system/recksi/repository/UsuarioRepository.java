package com.system.recksi.repository;

import com.system.recksi.model.Perfil;
import com.system.recksi.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsuario(String usuario);

    Optional<Usuario> findByCorreo(String correo);

    boolean existsByUsuario(String usuario);

    boolean existsByCorreo(String correo);

    List<Usuario> findAllByEstadoNot(Integer estado);

    long countByEstadoNot(Integer estado);

    long countByPerfilAndEstado(Perfil perfil, Integer estado);

}