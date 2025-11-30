package com.system.recksi.repository;

import com.system.recksi.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository  extends JpaRepository<Producto, Long> {

    Optional<Producto> findByNombreAndEstadoNot(String nombre, Integer estado);

    boolean existsByNombreAndEstadoNot(String nombre, Integer estado);

    boolean existsByNombreIgnoreCaseAndEstadoNot(String nombre, Integer estadoEliminado);

    List<Producto> findAllByEstadoNot(Integer estado);

    Long countByEstadoNot(Integer estado);

}

