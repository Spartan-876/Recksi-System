package com.system.recksi.repository;

import com.system.recksi.model.Almacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlmacenRepository extends JpaRepository<Almacen, Long> {

    List<Almacen> findAllByEstadoNot(Integer estado);

    Optional<Almacen> findById(Long id);

    Optional<Almacen> findByNombre(String nombre);

    Long countByEstadoNot(Integer estado);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    // Nuevos métodos que ignoran registros con estado eliminado (por ejemplo estado
    // == 2)
    boolean existsByNombreIgnoreCaseAndEstadoNot(String nombre, Integer estado);

    boolean existsByNombreIgnoreCaseAndIdNotAndEstadoNot(String nombre, Long id, Integer estado);

}
