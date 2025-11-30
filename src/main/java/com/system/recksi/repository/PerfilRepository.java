package com.system.recksi.repository;

import com.system.recksi.model.Perfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    List<Perfil> findByEstadoTrue();
}